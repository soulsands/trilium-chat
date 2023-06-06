export default class EleOption {
    constructor(view) {
        const $option = view.$chatView.$qs('.operate_btn_option');

        $option.addEventListener('click', () => {
            view.chatData.goOptions();
        });
    }
}
