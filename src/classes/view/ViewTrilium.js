import './styles/trilium.less';
import { htmlStrToElement } from '@/utils';
import View from './View';
import ViewTriliumToggle from './ViewTriliumToggle';
/* skeleton-flag */
const skeleton = ` `;
/* skeleton-flag */

export default class ViewTrilium extends View {
    initSkeleton(wrapperSelector = 'body') {
        const wrapper = document.$qs(wrapperSelector);
        this.$chatView = htmlStrToElement(skeleton);

        wrapper.appendChild(this.$chatView);
    }

    appendToggleBtn() {
        console.log(this);
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
