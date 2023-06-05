import LittleEvent from '@/classes/LittleEvent';

export default class EleNewChat extends LittleEvent {
    constructor(view) {
        super();

        this.$newBtn = view.$chatView.$qs('.operate_btn_new');

        this.$newBtn.addEventListener('click', () => {
            view.chatEngine.newChat();
        });
    }
}
