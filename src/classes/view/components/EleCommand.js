import LittleEvent from '@/classes/LittleEvent';
import { EVENT_VIEW } from '@/constants';
import { closest } from '@/utils';
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
        this.bindClickCommand();
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

    bindClickCommand() {
        this.$content.addEventListener('click', (e) => {
            const $command = closest('[command]', e.target);
            if (!$command) return;
            const command = $command.getAttribute('command');

            this.excuteCommand(command);
        });
    }

    async excuteCommand(command) {
        try {
            await this.chatView.chatData.handleCommand(command, this.chatView.chatEngine);
            this.handleCommandSuccess(command);
        } catch (error) {
            console.error(error);
            this.handleCommandFail(JSON.parse(error.message));
        }
    }

    get$commandByType(command) {
        return this.$content.$qs(`[command=${command}]`);
    }

    showTooltip(text, $command) {
        const tooltip = new Popover({
            placement: 'right',
            text,
            $edgeEle: this.chatView.$chatView,
            $triggerEle: $command,
            offset: 0,
            hideDelay: 1000,
        });
        tooltip.show();
    }

    handleCommandSuccess(command) {
        const $command = this.get$commandByType(command);

        this.showTooltip('success', $command);
    }

    handleCommandFail({ type, reason }) {
        const $command = this.get$commandByType(type);

        this.showTooltip(reason, $command);
    }
}
