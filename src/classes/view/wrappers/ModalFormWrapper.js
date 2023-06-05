import LittleEvent from '@/classes/LittleEvent';
import { EVENT_VIEW } from '@/constants';

import Modal from './Modal';
import Popover from './Popover';

export default class ModalFormWrapper extends LittleEvent {
    constructor({ $content, $chatView, title, saveText = 'Save', cancelText = 'Cancel' }) {
        super();

        this.$wrapper = document.createElement('div');
        this.$wrapper.innerHTML = `<div class="form_wrapper">
        <div class="form_wrapper_top flex-center-between">
            <div class="wapper_title">${title}</div>
            <div class="wapper_close bx bx-x icon-action"></div>
        </div>
        <div class="wrapper_content"></div>
        <div class="wrapper_op">
            <button class="chat_button wrapper_btn_cancel">${cancelText}</button>
            <button class="chat_button wrapper_btn_save ml-1">${saveText}</button>
        </div>
    </div>`;

        this.$content = $content;
        this.$chatView = $chatView;
        this.$save = this.$wrapper.$qs('.wrapper_btn_save');

        this.$wrapper.$qs('.wrapper_content').appendChild($content);

        $chatView.appendChild(this.$wrapper);

        console.log(this.$wrapper);

        this.modal = new Modal({ type: 'dialog', $content: this.$wrapper, $chatView });
        this.flagObj = null;

        this.bindEvents();
    }

    bindEvents() {
        this.$wrapper.$qs('.wapper_close').addEventListener('click', (e) => {
            this.emit(EVENT_VIEW.formCancel);
        });
        this.$save.addEventListener('click', (e) => {
            console.dir(this.$content);
            const $inputs = Array.from(this.$content.querySelectorAll('[name]'));

            const formData = $inputs.reduce((res, el) => {
                res[el.name] = el.value;

                if (!el.value) {
                    this.showTooltip(`no empty`);
                }
                return res;
            }, {});

            this.emit(EVENT_VIEW.formSave, formData, this.flagObj);
        });
        this.$wrapper.$qs('.wrapper_btn_cancel').addEventListener('click', (e) => {
            this.emit(EVENT_VIEW.formCancel);
        });
    }

    showTooltip(text) {
        const tooltip = new Popover({
            placement: 'top',
            text,
            $edgeEle: this.$chatView,
            $triggerEle: this.$save,
            offset: 8,
            hideDelay: 1000,
        });
        tooltip.show();
    }

    show(e, { title, formData = {}, flagObj } = {}) {
        if (title) {
            this.$wrapper.$qs('.wapper_title').textContent = title;
        }

        const $inputs = Array.from(this.$content.querySelectorAll('[name]'));
        $inputs.forEach((el) => {
            // eslint-disable-next-line no-param-reassign
            el.value = formData[el.name] || '';
        });

        this.flagObj = flagObj;

        this.modal.show(e);
    }

    hide() {
        this.enable(true);
        this.modal.hide();
    }

    enable(isEnable) {
        this.$wrapper.$qs('.wrapper_btn_save').disabled = !isEnable;
        this.$wrapper.$qs('.wrapper_btn_cancel').disabled = !isEnable;
    }
}
