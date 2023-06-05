import { throttle, removeEle } from '@/utils';
import { EVENT_ENGINE, ROLE } from '@/constants';

export default class EleThread {
    constructor(view) {
        this.chatView = view;
        this.$thread = view.$chatView.$qs('.thread');

        this.isHovering = false;

        this.wrapFunction();
        this.bindThreadHover();
        this.bindEngineEvents();
    }

    wrapFunction() {
        this.scrolToBottom = throttle(this.scrolToBottom, 300);
    }

    bindThreadHover() {
        this.$thread.addEventListener('mouseenter', () => {
            this.isHovering = true;
        });
        this.$thread.addEventListener('mouseleave', () => {
            this.isHovering = false;
        });
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

    renderThread(thread) {
        this.$thread.innerHTML = '';
        thread.forEach((message) => {
            this.appendElByMessage(message);
        });
    }

    appendElByMessage(message) {
        if (message.role == ROLE.system) return;

        const msgDom = document.createElement('div');
        msgDom.classList.add('message');
        msgDom.classList.add(message.role === 'user' ? 'sent' : 'received');
        const child = document.createElement('div');
        child.textContent = message.content;
        msgDom.appendChild(child);
        this.$thread.appendChild(msgDom);

        this.scrolToBottom();
        return msgDom;
    }

    scrolToBottom() {
            this.$thread.scrollTop = 10e10;
    }

    getCurrentMsgDom() {
        const { children } = this.$thread;
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
