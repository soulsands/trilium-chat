import { toggleEleShow, toggleEleFade, removeEle, nap } from '@/utils';

import { zindexInfo } from './share';

const template = `<div class="chat_modal">
<div class="modal_mask"></div>
<div class="content_wrapper"></div>
</div>`;

export default class Modal {
    constructor({ type = 'dialog', $content, $chatView }) {
        this.type = type;
        const map = {
            popup: 'content_wrapper_popup',
            dialog: 'content_wrapper_dialog',
        };
        this.wrapperClassName = map[type];

        this.$content = removeEle($content);
        this.$chatView = $chatView;

        this.$modal = null;

        this.isShow = false;
    }

    async show(event) {
        if (this.isShow) return;

        if (!this.$modal) {
            this.initModal();
        }

        zindexInfo.global += 1;
        this.$modal.style.zIndex = zindexInfo.global;
        zindexInfo.currentModal = zindexInfo.global;

        this.$chatView.appendChild(this.$modal);
        toggleEleShow(this.$modal, true);

        this.$contentWrapper.classList.add(this.wrapperClassName);

        if (this.type !== 'popup') {
            const { offsetWidth, offsetHeight } = this.$contentWrapper;
            const { offsetLeft, offsetTop } = this.$chatView;

            this.$contentWrapper.style.left = `${event.x - offsetLeft - offsetWidth / 2}px`;
            this.$contentWrapper.style.top = `${event.y - offsetTop - offsetHeight / 2}px`;
        }

        await nap();

        toggleEleFade(this.$mask, true);
        toggleEleFade(this.$contentWrapper, true);

        this.isShow = true;
    }

    initModal() {
        const el = document.createElement('template');
        el.innerHTML = template;

        this.$modal = el.content.lastChild;
        this.$mask = this.$modal.$qs('.modal_mask');
        this.$contentWrapper = this.$modal.$qs('.content_wrapper');

        this.$contentWrapper.appendChild(this.$content);

        this.bindClick();
    }

    bindClick() {
        const handleClick = (e) => {
            this.hide();
        };

        this.$mask.addEventListener('click', handleClick);
        this.$contentWrapper.addEventListener('click', (e) => {});
    }

    async hide() {
        if (!this.isShow) return;

        const handleTransitionEnd = () => {
            toggleEleShow(this.$modal, false);

            this.$contentWrapper.style.left = 'initial';
            this.$contentWrapper.style.top = 'initial';

            this.$contentWrapper.classList.remove(this.wrapperClassName);
            removeEle(this.$modal);

            this.isShow = false;
            zindexInfo.currentModal = null;

            this.$mask.removeEventListener('transitionend', handleTransitionEnd);
        };

        this.$mask.addEventListener('transitionend', handleTransitionEnd);

        toggleEleFade(this.$mask, false);
        toggleEleFade(this.$contentWrapper, false);
    }
}
