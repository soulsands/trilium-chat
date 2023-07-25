import './styles/trilium.less';
import View from './View';
import ViewTriliumToggle from './ViewTriliumToggle';

export default class ViewTrilium extends View {
    appendToggleBtn() {
        const ViewTriliumToggleClass = ViewTriliumToggle();
        const showBtn = new ViewTriliumToggleClass({
            onClick: () => {
                showBtn.$btn.tooltip('hide');

                this.toggleView();
            },
        });

        const $ribbonButtonContainer = $('.tab-row-filler');

        $ribbonButtonContainer.prepend(showBtn.render());
    }

    bindShortcut() {
        const { toggle, hide } = this.options.shortcut;

        api.bindGlobalShortcut(toggle, () => {
            this.toggleView();
        });

        api.bindGlobalShortcut(hide, () => {
            this.hideView();
        });
    }
}
