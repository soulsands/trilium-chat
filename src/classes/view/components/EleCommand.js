import LittleEvent from '@/classes/LittleEvent';
import { getFirstUserContentOrThrow, showTooltip, bindEnter } from '@/utils';
import { EVENT_VIEW } from '@/constants';
import Popover from '../wrappers/Popover';

export default class EleCommand extends LittleEvent {
    constructor(view) {
        super();
        this.chatView = view;

        this.$showBtn = view.$chatView.$qs('.operate_btn_command');
        this.popover = new Popover({
            placement: 'top',
            contentSelector: '.content_command',
            $edgeEle: view.$chatView,
            $triggerEle: this.$showBtn,
            offset: 6,
        });

        this.$content = this.popover.$content;

        view.on(EVENT_VIEW.c, () => {
            this.show();
        });

        this.bindShowClick();
        this.bindCommand();
        this.checkAutoSave();
    }

    checkAutoSave() {
        if (this.chatView.options.autoSave) {
            this.$content.$qs('[command=history]').style.display = 'none';
        }
    }

    bindShowClick() {
        this.$showBtn.addEventListener('click', () => {
            this.show();
        });
    }

    async show() {
        this.popover.show(() => {
            this.$content.$qs('.command_item').focus();
        });
    }

    bindCommand() {
        this.$content.querySelectorAll('.command_item').forEach((el) => {
            const func = () => {
                const command = el.getAttribute('command');
                this.excuteCommand(command);
            };

            el.addEventListener('click', () => {
                func();
            });

            bindEnter(el, () => {
                func();
            });
        });
    }

    async hide() {
        this.popover.hide();
    }

    async excuteCommand(command) {
        const { chatEngine, chatData } = this.chatView;
        try {
            getFirstUserContentOrThrow(chatEngine);

            await chatData.handleCommand(command, chatEngine);
            showTooltip('success');
        } catch (error) {
            showTooltip(`${command}:${error.message}`, true);
        }
    }
}
