import { ROLE, EVENT_ENGINE, STATUS_MESSAGE } from '@/constants';
import { isMsgExpected, debug } from '@/utils';
import Streamer from '../Streamer';
import LittleEvent from '../LittleEvent';

const HINTS = {
    waiting: '...',
};

export default class ChatGpt extends LittleEvent {
    constructor({ apiKey, engineOptions, systemPrompt, requestUrls }) {
        super();
        this.urls = requestUrls;
        this.apiKey = apiKey;
        this.defaultOptions = engineOptions;
        this.systemPrompt = systemPrompt;
    }

    get lastMessage() {
        if (!this.thread.length) return null;
        return this.thread[this.thread.length - 1];
    }

    set lastMessage(msg) {
        if (this.thread[this.thread.length - 1]) {
            this.thread[this.thread.length - 1] = msg;
        } else {
            throw new Error('lastMessage not exist');
        }
    }

    newChat() {
        const list = [];

        if (this.systemPrompt) {
            list.push({
                role: ROLE.system,
                content: this.systemPrompt,
                status: STATUS_MESSAGE.success,
            });
        }

        this.loadThread({ id: Date.now().toString(), list });

        this.emit(EVENT_ENGINE.setStatus, STATUS_MESSAGE.none);
    }

    loadThread(thread) {
        this.endStream();

        this.threadId = thread.id;
        this.thread = thread.list.map((msg) => ({ ...msg, status: STATUS_MESSAGE.success }));

        this.emit(EVENT_ENGINE.load, this.thread);
    }

    isAvailable() {
        if (!this.lastMessage) return true;
        return isMsgExpected(this.lastMessage.status);
    }

    setLastMessageStatus(status) {
        if (this.lastMessage.status !== status) {
            this.lastMessage.status = status;

            if (isMsgExpected(status)) {
                this.lastMessage.stamp = Date.now();
            }

            this.emit(EVENT_ENGINE.setStatus, status);
        }
    }

    createMessage(content, role = ROLE.user) {
        const message = { role, content, stamp: Date.now() };
        this.thread.push(message);

        const status = role === ROLE.user ? STATUS_MESSAGE.success : STATUS_MESSAGE.fetching;
        this.setLastMessageStatus(status);

        this.emit(EVENT_ENGINE.create, { ...this.lastMessage });
    }

    replaceMessage(content, status, role) {
        if (!content) throw new Error('content required');

        this.lastMessage.content = content;
        this.lastMessage.role = role || this.lastMessage.role;

        this.setLastMessageStatus(status || this.lastMessage.status);

        this.emit(EVENT_ENGINE.replace, { ...this.lastMessage });
    }

    appendMessageWords(word) {
        if (this.lastMessage) {
            this.lastMessage.content += word;

            this.emit(EVENT_ENGINE.append, { word, ...this.lastMessage });
        }
    }

    requestCompletion({ userInput, overrideOptions = {} }) {
        const isEmptyString = typeof userInput === 'string' && userInput.trim() === '';
        if (!userInput || isEmptyString) {
            return;
        }

        this.createMessage(userInput);

        this.createMessage(HINTS.waiting, ROLE.assistant);

        return this.sendRequest(overrideOptions);
    }

    async sendRequest(overrideOptions = {}) {
        const messages = this.thread.reduce((handleMessages, msg) => {
            // Maybe there's some way to set msg.content the title of the note instead?
            if (isMsgExpected(msg.status)) {
                handleMessages.push({ role: msg.role, content: msg.content });
            }

            return handleMessages;
        }, []);

        const finalOptions = {
            messages,
            ...this.defaultOptions,
            ...overrideOptions,
        };

        if (!this.apiKey) {
            this.replaceMessage(
                'Please verify your API Key is correct in the note titled "CHAT_OPTIONS", and then reload via (F5) or (Ctrl + R), or use the Trilium menu: Advanced > Reload Frontend',
                STATUS_MESSAGE.failed,
                ROLE.error
            );
            return;
        }

        try {
            if (finalOptions.stream) {
                await this.requestChatStream(finalOptions);
            } else {
                await this.requestChatBatch(finalOptions);
            }
        } catch (error) {
            // Check if the error contains a CustomEvent which has an entry called "data", if it does, display that to the user
            if (error.data) {
                this.replaceMessage(
                    `The API returned the following error:\n ${error.data}`,
                    STATUS_MESSAGE.failed,
                    ROLE.error
                );
            } else {
                console.error(error);
                this.replaceMessage(
                    'API Error. See console logs for details. (ctrl + shift + i)',
                    STATUS_MESSAGE.failed,
                    ROLE.error
                );
            }
        }
    }

    regenerate(overrideOptions) {
        if (this.lastMessage.role === ROLE.user) {
            throw new Error('error detected!');
        }

        this.replaceMessage(HINTS.waiting, STATUS_MESSAGE.fetching, ROLE.assistant);

        this.sendRequest(overrideOptions);
    }

    async requestChatStream(options) {
        await new Promise((resolve, reject) => {
            try {
                this.activeStream = new Streamer(this.urls.completion, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.apiKey}`,
                    },
                    method: 'POST',
                    payload: JSON.stringify(options),
                });
                let txt = '';
                this.activeStream.addEventListener('message', (e) => {
                    debug(e.data);
                    if (e.data !== '[DONE]') {
                        const payload = JSON.parse(e.data);
                        if (payload?.choices[0]?.finish_reason === 'stop') {
                            this.endStream();

                            this.setLastMessageStatus(STATUS_MESSAGE.success);
                            resolve(txt);
                        } else {
                            const text = payload.choices[0].delta.content;
                            if (!text) {
                                return;
                            }
                            txt += text;

                            if (this.lastMessage.content === HINTS.waiting) {
                                this.replaceMessage(text, STATUS_MESSAGE.generating);
                            } else {
                                this.appendMessageWords(text);
                            }
                        }
                    } else {
                        this.endStream();

                        this.setLastMessageStatus(STATUS_MESSAGE.success);
                        resolve(txt);
                    }
                });
                this.activeStream.addEventListener('readystatechange', (e) => {
                    debug(e);
                    if (e.readyState >= 2) {
                        debug(`ReadyState: ${e.readyState}`);
                    }
                });
                this.activeStream.addEventListener('error', (e) => {
                    this.endStream();
                    reject(e);
                });

                this.emit('beforeStream', {
                    role: ROLE.assistant,
                });

                this.activeStream.stream();
            } catch (err) {
                this.endStream();
                reject(err);
            }
        });
    }

    cancelGenerating() {
        this.setLastMessageStatus(STATUS_MESSAGE.cancel);
        this.emit(EVENT_ENGINE.cancel, { ...this.lastMessage });

        this.endStream();
    }

    endStream() {
        if (this.activeStream) {
            this.activeStream.close();
            this.activeStream = null;
        }
    }

    async requestChatBatch(options) {
        const content = await this.requestCompletionBatch(options);
        this.replaceMessage(content, STATUS_MESSAGE.success);
    }

    async requestCompletionBatch(options) {
        const response = await fetch(this.urls.completion, {
            method: 'POST',
            mode: 'cors',
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
        });
        const responseJson = await response.json();
        const { content } = responseJson.choices ? responseJson.choices[0].message : responseJson.message;

        return content;
    }
}
