import LittleEvent from '@/classes/LittleEvent';
import { STATUS_MESSAGE, EVENT_ENGINE, EVENT_VIEW } from '@/constants';
import { isMsgExpected, escape, debug } from '@/utils';

export default class EleInput extends LittleEvent {
    constructor(view) {
        super();
        this.chatView = view;
        this.$userInput = view.$chatView.$qs('.input-area');
        this.$sendBtn = view.$chatView.$qs('.operate_send');

        this.engineStatus = STATUS_MESSAGE.none;

        this.bindInput();
        this.bindSendMessage();

        this.bindDependEvents();
    }

    bindInput() {
        this.$userInput.addEventListener('input', () => {
            this.setBtnStyle();
        });
    }

    bindDependEvents() {
        this.chatView.chatEngine.on(EVENT_ENGINE.setStatus, (status) => {
            this.enableUserInput(status !== STATUS_MESSAGE.faild);
            this.handleMsgStatus(status);
        });
        this.chatView.chatEngine.on(EVENT_ENGINE.load, async () => {
            this.$userInput.focus();
        });
        this.chatView.elePrompt.on(EVENT_VIEW.promptToggle, () => {
            this.setBtnStyle();
        });
        this.chatView.on(EVENT_VIEW.viewShow, () => {
            this.$userInput.focus();
        });
    }

    handleMsgStatus(status) {
        this.engineStatus = status;

        this.setBtnStyle();
    }

    async setBtnStyle() {
        const allowSend = isMsgExpected(this.engineStatus) || this.engineStatus === STATUS_MESSAGE.none;
        let hint = '';
        if (allowSend) {
            const { msgEngine } = await this.getParsedMsg();
            if (!msgEngine) {
                this.$sendBtn.classList.add('freezed');
                this.$sendBtn.setAttribute('title', 'Type a message');
                return;
            }

            this.$sendBtn.classList.remove('freezed');
            hint = 'Send(Enter to send, Shift+Enter to break line)';
            this.$userInput.focus();
        } else {
            this.$sendBtn.classList.add('freezed');
            if (this.engineStatus === STATUS_MESSAGE.faild) {
                hint = 'Regenerating is worth a try';
            } else {
                hint = 'Wait a moment';
            }
        }
        this.$sendBtn.setAttribute('title', hint);
    }

    bindSendMessage() {
        const sendMessage = async () => {
            const { msgView, msgEngine } = await this.getParsedMsg();

            debug(msgView, msgEngine);

            if (msgEngine) {
                if (this.chatView.chatEngine.isAvailable()) {
                    this.emit(EVENT_VIEW.send, msgView);
                    this.chatView.chatEngine.requestCompletion({ userInput: msgEngine });
                    this.clearInput();
                }
            }
        };

        this.$sendBtn.addEventListener('click', sendMessage.bind(this));

        this.$userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage.call(this);
            }
        });
    }

    /* 
        userInput:{
            engine:raw,
            view:escaped
        }
        activaNote:{
            engine:raw,
            view:{
                code:escaped,
                text:raw
            }
        }
    */

    async getParsedMsg() {
        const parsedPrompt = this.chatView.elePrompt.$getParsedPromt();
        const userInput = this.$userInput.value;
        const escapedInput = escape(userInput);
        debug(parsedPrompt, userInput, escapedInput);

        if (!parsedPrompt) {
            return {
                msgEngine: userInput.trim(),
                msgView: escapedInput.trim(),
            };
        }

        let msgEngine = parsedPrompt;
        let msgView = parsedPrompt;

        const regMsg = /{{message}}/g;
        const regNote = /{{activeNote}}/g;

        if (regNote.test(parsedPrompt)) {
            try {
                const { engine, view } = await this.chatView.chatData.getAcitveNoteContent();

                msgEngine = msgEngine.replace(regNote, engine);
                msgView = msgView.replace(regNote, view);

                debug(msgEngine, msgView);
            } catch (error) {
                console.error(error);
            }
        }
        if (regMsg.test(parsedPrompt)) {
            msgEngine = msgEngine.replace(regMsg, userInput);
            msgView = msgView.replace(regMsg, escapedInput);
        }

        // console.error(parsedPrompt);
        return {
            msgEngine: msgEngine.trim(),
            msgView: msgView.trim(),
        };
    }

    enableUserInput(enable) {
        this.$userInput.disabled = !enable;
    }

    clearInput() {
        this.$userInput.value = '';
    }
}
