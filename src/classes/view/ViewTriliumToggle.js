const TPL = `<div class="chat-toggle-wrapper flex-row-reverse"><button class="button-widget bx icon-action"
      data-toggle="tooltip"
      title=""></button></div>`;

export default function ViewTriliumToggleWrapper() {
    return class ViewTriliumToggle extends api.NoteContextAwareWidget {
        isEnabled() {
            return true;
        }

        constructor(options) {
            super();

            this.options = options;
        }

        doRender() {
            this.$widget = $(TPL);
            const btn = this.$widget.find('.button-widget');

            btn.attr('data-placement', 'bottom');

            btn.tooltip({
                html: true,
                title: 'Chat',
                trigger: 'hover',
            });

            btn.addClass('bx-message-square-dots');

            btn.on('click', this.options.onClick);

            this.$btn = btn;
            super.doRender();
        }
    };
}
