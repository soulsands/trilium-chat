import LittleEvent from '@/classes/LittleEvent';
import {
    removeEle,
    closest,
    promptToHtml,
    getParsedPromt,
    nap,
    toggleEleShow,
    bindEnter,
    toLowerCase,
    debug,
} from '@/utils';
import { EVENT_VIEW } from '@/constants';
import Popover from '../wrappers/Popover';
import ModalFormWrapper from '../wrappers/ModalFormWrapper';

export default class ElePrompt extends LittleEvent {
    constructor(view) {
        super();
        this.chatView = view;
        this.$promptContent = view.$chatView.$qs('.prompt_content');

        // this.$content = view.$chatView.$qs('.content_select_prompt');
        this.$showBtn = view.$chatView.$qs('.operate_btn_prompt');

        //
        this.Popover = new Popover({
            placement: 'top',
            contentSelector: '.content_select_prompt',
            $edgeEle: view.$chatView,
            $triggerEle: this.$showBtn,
            offset: 5,
            popoverClass: 'popover_prompt',
        });

        this.$content = this.Popover.$content;

        this.$count = this.$content.$qs('.select_count');
        this.$countNum = this.$count.$qs('.select_num');

        this.$addBtn = this.$content.$qs('.select_add');
        this.$closeBtn = this.$content.$qs('.select_close');
        this.$search = this.$content.$qs('.select_search_input');
        this.$list = this.$content.$qs('.select_list');
        this.$promptTpl = removeEle(this.$content.$qs('.select_item'));

        //
        this.$contentForm = view.$chatView.$qs('.content_prompt_form');
        this.ModalForm = new ModalFormWrapper({
            $content: this.$contentForm,
            $chatView: view.$chatView,
            title: 'Add temlate',
        });

        this.prompts = [];
        this.bindEvents();

        // this.$showBtn.click();
    }

    async hide() {
        this.Popover.hide();
    }

    bindEvents() {
        this.chatView.on(EVENT_VIEW.p, () => {
            this.show();
        });

        this.$showBtn.addEventListener('click', async () => {
            this.show();
        });

        this.bindContentEvents();
        this.bindListEvents();
        this.bindFormEvents();
    }

    show() {
        this.Popover.show();
        this.$search.focus();
        this.loadPrompts();
    }

    bindContentEvents() {
        this.$promptContent.$qs('.prompt_content_close').addEventListener('click', () => {
            this.$promptContent.style.height = `0px`;
            toggleEleShow(this.$promptContent, false);
            this.clearContent();

            this.emit(EVENT_VIEW.promptToggle, 0);
        });
    }

    clearContent() {
        this.promptContent = '';
        this.$text.innerHTML = '';
    }

    bindListEvents() {
        this.$count.addEventListener('click', () => {
            window.open('https://prompts.chat/#using-promptschat');
        });

        this.$addBtn.addEventListener('click', async (e) => {
            this.ModalForm.show(e, { title: 'Add temlate' });
        });

        this.$closeBtn.addEventListener('click', () => {
            this.hide();
        });
        this.$search.addEventListener('input', (e) => {
            this.renderSearch(e.target.value);
        });
        this.$list.addEventListener('click', async (e) => {
            const $prompt = closest('[data-id]', e.target);
            if ($prompt) {
                const target = this.prompts.find((prompt) => prompt.id === $prompt.dataset.id);

                let type = 'select';
                if (e.target.classList.contains('bx-edit-alt')) {
                    type = 'edit';
                } else if (e.target.classList.contains('bx-trash')) {
                    type = 'delete';
                }

                if (type === 'edit') {
                    this.ModalForm.show(e, {
                        title: 'Edit temlate',
                        formData: { 'prompt-name': target.name, 'prompt-content': target.content },
                        flagObj: target,
                    });
                    return;
                }
                if (type === 'delete') {
                    await this.chatView.chatData.deletePrompt(target);
                    this.loadPrompts();
                    return;
                }
                debug(target);
                this.handlePromptContent(target);
                this.hide();
            }
        });
    }

    async handlePromptContent(prompt) {
        this.promptContent = prompt.content;

        toggleEleShow(this.$promptContent, true);
        this.renderContent(prompt);
    }

    async renderContent(prompt) {
        this.$text = this.$promptContent.$qs('.prompt_content_text');
        this.$text.innerHTML = promptToHtml(prompt.content);
        await nap();
        this.$promptContent.style.height = `${this.$text.offsetHeight + 40}px`;

        this.emit(EVENT_VIEW.promptToggle, this.$text.offsetHeight + 40);
    }

    bindFormEvents() {
        this.ModalForm.on(EVENT_VIEW.formSave, async (formData, flagObj) => {
            debug(flagObj);
            this.ModalForm.enable(false);

            // is update
            if (flagObj) {
                const prompt = {
                    ...flagObj,
                    name: formData['prompt-name'],
                    content: formData['prompt-content'],
                };
                await this.chatView.chatData.updatePrompt(prompt);
            } else {
                const prompt = {
                    name: formData['prompt-name'],
                    content: formData['prompt-content'],
                    id: Date.now().toString(),
                };
                await this.chatView.chatData.createPrompt(prompt);
            }
            this.ModalForm.hide();

            this.loadPrompts();
        });
        this.ModalForm.on(EVENT_VIEW.formCancel, () => {
            this.ModalForm.hide();
        });
    }

    async loadPrompts() {
        this.prompts = ((await this.chatView.chatData.getPrompts()) || []).sort((a, b) => b.order - a.order);

        this.renderCount(this.prompts.length);
        this.renderList(this.prompts);
    }

    renderCount(num) {
        this.$countNum.textContent = num;
    }

    renderList(list) {
        this.$list.innerHTML = '';

        const fragment = document.createDocumentFragment();

        list.forEach((prompt) => {
            const $prompt = this.$promptTpl.cloneNode(true);

            bindEnter($prompt, () => {
                this.handlePromptContent(prompt);
                this.hide();
            });

            $prompt.setAttribute('data-id', prompt.id);

            $prompt.$qs('.item_title').textContent = prompt.name;

            const $preview = $prompt.$qs('.item_preview');
            $preview.setAttribute('title', prompt.content);
            $preview.textContent = prompt.content;

            fragment.appendChild($prompt);
        });

        this.$list.appendChild(fragment);
    }

    renderSearch(keyword) {
        const filterList = this.prompts.filter(
            (prompt) =>
                toLowerCase(prompt.name).includes(toLowerCase(keyword)) ||
                toLowerCase(prompt.content).includes(toLowerCase(keyword))
        );
        this.renderList(filterList);
    }

    // called in eleInput
    $getParsedPromt() {
        if (!this.promptContent) return '';

        return getParsedPromt(this.$promptContent, this.promptContent);
    }
}
