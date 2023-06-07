import { throttle, removeEle, closest } from '@/utils';
import { EVENT_ENGINE, EVENT_VIEW, ROLE } from '@/constants';
import Popover, { showTooltip } from '../wrappers/Popover';

export default class EleThread {
    constructor(view) {
        this.chatView = view;
        this.$thread = view.$chatView.$qs('.thread');
        this.$threadMsgs = this.$thread.$qs('.thread-messages');

        this.isHovering = false;

        this.Popover = new Popover({
            contentSelector: '.msg-command',
            $edgeEle: this.$thread,
        });

        this.clickedMsg = '';

        this.wrapFunction();

        this.bindEngineEvents();

        this.bindThreadHover();
        this.bindPromptToggle();

        this.bindDotClick();
        this.bindThreadScroll();
    }

    wrapFunction() {
        this.scrolToBottom = throttle(this.scrolToBottom, 300);
    }

    bindEngineEvents() {
        const { chatEngine } = this.chatView;
        chatEngine.on(EVENT_ENGINE.load, (thread) => {
            this.renderThread(thread);
        });
        chatEngine.on(EVENT_ENGINE.create, (message) => {
            this.appendElByMessage(message);
        });
        chatEngine.on(EVENT_ENGINE.append, (data) => {
            this.replaceCurrentElContent(data.content);
        });
        chatEngine.on(EVENT_ENGINE.replace, (data) => {
            this.replaceCurrentElContent(data.content);
        });
    }

    bindThreadHover() {
        this.$thread.addEventListener('mouseenter', () => {
            this.isHovering = true;
        });
        this.$thread.addEventListener('mouseleave', () => {
            this.isHovering = false;
        });
    }

    bindPromptToggle() {
        this.chatView.elePrompt.on(EVENT_VIEW.promptToggle, (height) => {
            // hacky
            this.$thread.style.height = `calc(100% - ${247 + height}px)`;
        });
    }

    bindDotClick() {
        this.$threadMsgs.addEventListener('click', (e) => {
            const isDot = e.target.classList.contains('dot');
            console.log(isDot);

            if (isDot) {
                this.clickedMsg = e.target.previousSibling.textContent;

                this.showMsgCommand(e.target);
            }
        });
    }

    showMsgCommand($dot) {
        const placement = closest('.message', $dot).classList.contains('sent') ? 'left' : 'right';

        this.Popover = new Popover({
            placement,
            contentSelector: '.msg-command',
            $edgeEle: this.$thread,
            $triggerEle: $dot,
            offset: 0,
        });
        this.Popover.show();

        this.bindCommand();
    }

    bindCommand() {
        this.Popover.$content.addEventListener('click', async (e) => {
            const $command = e.target;
            const command = $command.getAttribute('command');

            const { $chatView, chatEngine, chatData } = this.chatView;
            try {
                await chatData.handleMsgCommand(command, chatEngine);
                showTooltip('success', $command, $chatView);
            } catch (error) {
                console.error(error);
                showTooltip(JSON.parse(error.message).reason, $command, $chatView);
            }
        });
    }

    bindThreadScroll() {
        let willHide = false;
        this.$threadMsgs.addEventListener('scroll', () => {
            if (this.Popover.isShow && willHide === false) {
                willHide = true;
                setTimeout(() => {
                    this.Popover.hide();
                    willHide = false;
                }, 100);
            }
        });
    }

    renderThread(thread) {
        this.$threadMsgs.innerHTML = '';
        thread.forEach((message) => {
            this.appendElByMessage(message);
        });
    }

    appendElByMessage(message) {
        if (message.role === ROLE.system) return;

        const skeleton = `<div class='message ${
            message.role === 'user' ? 'sent' : 'received'
        }'><div class='message-text'>${
            message.content
        }</div><div class='bx bx-dots-vertical-rounded dot icon-action'></div></div>`;

        const template = document.createElement('template');
        template.innerHTML = skeleton;
        const msgDom = template.content.lastChild;

        this.$threadMsgs.appendChild(msgDom);

        this.scrolToBottom();
        return msgDom;
    }

    scrolToBottom() {
        this.$threadMsgs.scrollTop = 10e10;
    }

    getCurrentMsgDom() {
        const { children } = this.$threadMsgs;
        return children[children.length - 1];
    }

    replaceCurrentElContent(content) {
        const currentMsgDom = this.getCurrentMsgDom();
        currentMsgDom.children[0].textContent = content;

        if (!this.isHovering) {
            this.scrolToBottom();
        }
    }

    removeCurrentEl() {
        const currentMsgDom = this.getCurrentMsgDom();
        removeEle(currentMsgDom);
    }
}
