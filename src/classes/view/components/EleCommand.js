import LittleEvent from '@/classes/LittleEvent';
import { EVENT_VIEW } from '@/constants';
import { closest, showTooltip } from '@/utils';
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
            this.popover.show();
        });
    }

    bindCommand() {
        this.$content.addEventListener('click', (e) => {
            const $command = closest('[command]', e.target);
            if (!$command) return;
            const command = $command.getAttribute('command');

            this.excuteCommand(command, $command);
        });
    }

    async excuteCommand(command, $command) {
        const { $chatView, chatEngine, chatData } = this.chatView;
        try {
            await chatData.handleCommand(command, chatEngine);
            showTooltip('success', $command, $chatView);
        } catch (error) {
            console.error(error);
            showTooltip(JSON.parse(error.message).reason, $command, $chatView);
        }
    }
}
