import { STATUS_MESSAGE, STATUS_DATA, EVENT_ENGINE } from '@/constants';

const STATUS_ENGINE = {
    [STATUS_MESSAGE.none]: 'Ready',
    [STATUS_MESSAGE.fetching]: 'Thinking...',
    [STATUS_MESSAGE.generating]: 'Typing...',
    [STATUS_MESSAGE.success]: 'On standby',
    [STATUS_MESSAGE.failed]: STATUS_MESSAGE.failed,
    [STATUS_MESSAGE.cancel]: STATUS_MESSAGE.cancel,
};

export default class EleStatus {
    constructor(view) {
        this.chatView = view;
        this.$status = view.$chatView.$qs('.operate_status');

        view.chatEngine.on(EVENT_ENGINE.setStatus, (status) => {
            this.handleMsgStatus(status);
        });
    }

    handleMsgStatus(status) {
        const text = STATUS_ENGINE[status];
        this.$status.textContent = text;
    }

    handleDataStatus(data) {
        // console.log(data);
        const { status, key, value } = data;
        if (status === STATUS_DATA.success) {
            this.$status.textContent = '';
        } else {
            this.$status.textContent = `${status}: ${key} - ${value}`;
        }
    }
}
