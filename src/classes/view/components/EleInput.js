import LittleEvent from '@/classes/LittleEvent';
import { STATUS_MESSAGE, EVENT_ENGINE, EVENT_VIEW } from '@/constants';

export default class EleInput extends LittleEvent {
    constructor(view) {
        super();
        this.chatView = view;
        this.$userInput = view.$chatView.$qs('.input-area');

        this.$sendBtn = view.$chatView.$qs('.operate_send');

        this.engineStatus = STATUS_MESSAGE.none;

        this.bindInput();
        this.bindSendMessage();

        this.bindEngineEvents();
        this.bindPromptStatus();
    }

    bindInput() {
        this.$userInput.addEventListener('input', () => {
            this.setBtnStyle();
        });
    }

    bindEngineEvents() {
        this.chatView.chatEngine.on(EVENT_ENGINE.setStatus, (status) => {
            this.enableUserInput(status !== STATUS_MESSAGE.faild);
            this.handleMsgStatus(status);
        });
    }

    bindPromptStatus() {
        this.chatView.elePrompt.on(EVENT_VIEW.promptToggle, () => {
            this.setBtnStyle();
        });
    }

    handleMsgStatus(status) {
        this.engineStatus = status;

        this.setBtnStyle();
    }

    async setBtnStyle() {
        const allowSend = [STATUS_MESSAGE.none, STATUS_MESSAGE.success, STATUS_MESSAGE.cancel].includes(
            this.engineStatus
        );

        let hint = '';
        if (allowSend) {
            if (!(await this.getParsedMsg())) {
                this.$sendBtn.classList.add('freezed');
                this.$sendBtn.setAttribute('title', 'Type a message');
                return;
            }

            this.$sendBtn.classList.remove('freezed');
            hint = 'Send(Enter to send, Shift+Enter to break line)';
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
            const finalMsg = await this.getParsedMsg();
            if (finalMsg) {
                if (this.chatView.chatEngine.isEngineAvailable()) {
                    this.chatView.chatEngine.requestCompletion({ userInput: finalMsg });
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

    async getParsedMsg() {
        const parsedPrompt = this.chatView.elePrompt.$getParsedPromt();
        const userInput = this.$userInput.value;

        if (!parsedPrompt) return userInput;

        let finalMsg = parsedPrompt;
        const regMsg = /{{message}}/g;
        const regNote = /{{activeNote}}/g;
        if (regMsg.test(finalMsg)) {
            finalMsg = finalMsg.replace(regMsg, userInput);
        }

        if (regNote.test(finalMsg)) {
            try {
                finalMsg = finalMsg.replace(regNote, await this.chatView.chatData.getAcitveNoteContent());
            } catch (error) {
                console.error(error);
                return null;
            }
        }

        /* console.error(parsedPrompt);
        console.error(regNote.test(parsedPrompt));
        console.error(finalMsg.trim()); */
        return finalMsg.trim();
    }

    enableUserInput(enable) {
        this.$userInput.disabled = !enable;
    }

    clearInput() {
        this.$userInput.value = '';
    }
}
