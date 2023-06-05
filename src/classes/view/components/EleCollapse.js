export default class EleCollapse {
    constructor(view) {
        this.chatView = view;
        this.$collapse = view.$chatView.$qs('.header_hide');

        this.bindCollapse();
    }

    bindCollapse() {
        this.$collapse.addEventListener('click', () => {
            this.chatView.hideView();
        });
    }
}
