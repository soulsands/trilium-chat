import LittleEvent from '@/classes/LittleEvent';
import { toggleEleShow } from '@/utils';
import { EVENT_ENGINE, STATUS_MESSAGE } from '@/constants';

export default class EleGenerate extends LittleEvent {
    constructor(view) {
        super();
        this.chatView = view;

        this.$stop = view.$chatView.$qs('.thread_op_stop');

        this.$stop.addEventListener('click', () => {
            view.chatEngine.cencelGenerating();
        });

        this.$regenerate = view.$chatView.$qs('.thread_op_regenerate');

        this.$regenerate.addEventListener('click', () => {
            view.chatEngine.regenerate();
        });

        this.bindEngineEvents();
    }

    bindEngineEvents() {
        this.chatView.chatEngine.on(EVENT_ENGINE.setStatus, (status) => {
            this.toggleStopGenerating([STATUS_MESSAGE.generating, STATUS_MESSAGE.fetching].includes(status));
            this.toggleRegenerate([STATUS_MESSAGE.cancel, STATUS_MESSAGE.failed].includes(status));
        });
    }

    toggleStopGenerating(show) {
        toggleEleShow(this.$stop, show);
    }

    toggleRegenerate(show) {
        toggleEleShow(this.$regenerate, show);
    }
}
