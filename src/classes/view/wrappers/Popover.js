import { toggleEleFade, removeEle, nap, calculatePopoverPosition } from '@/utils';

import { clickOutside, zindexInfo } from './share';

const templateMap = {};
export default class Popover {
    /**
     * top right bottom right
     */
    constructor({
        useTransition = true,
        placement,
        offset,
        contentSelector,
        $edgeEle,
        $triggerEle,
        text,
        hideDelay,
        popoverClass,
    }) {
        this.placement = placement;
        this.useTransition = useTransition;
        this.offset = offset;
        this.hideDelay = hideDelay;
        this.popoverClass = popoverClass;

        this.$triggerEle = $triggerEle;

        this.$edgeEle = $edgeEle;

        if (text) {
            const $text = document.createElement('div');
            $text.classList.add('tooltip-text');
            $text.innerHTML = text;
            this.$content = $text;
        } else {
            templateMap[contentSelector] = templateMap[contentSelector] || removeEle($edgeEle.$qs(contentSelector));

            this.$content = templateMap[contentSelector].cloneNode(true);
        }

        this.$popover = null;
        this.isShow = false;
    }

    async show() {
        if (this.isShow) return;

        if (!this.$popover) {
            this.initPopover();
        }

        this.$edgeEle.appendChild(this.$popover);
        this.$popover.appendChild(this.$content);

        this.setPopoverStyle(this.$popover);

        await nap();

        toggleEleFade(this.$popover, true);

        this.OutsideUnbind = clickOutside(this.$popover, () => {
            if (zindexInfo.currentModal && zindexInfo.currentModal > this.$popover.style.zIndex) {
                return;
            }

            this.hide();
            this.OutsideUnbind();
        });

        this.isShow = true;

        if (this.hideDelay) {
            setTimeout(() => {
                this.hide();
            }, this.hideDelay);
        }
    }

    async setPopoverStyle($popover) {
        const edgeRect = this.$edgeEle.getBoundingClientRect();
        const triggerRect = this.$triggerEle.getBoundingClientRect();

        const { top, left, placement } = calculatePopoverPosition(
            edgeRect,
            triggerRect,
            $popover.offsetWidth,
            $popover.offsetHeight,
            this.offset,
            this.placement
        );

        const map = {
            top: ['bottom', 'scaleY(0.01)'],
            bottom: ['top', 'scaleY(0.01)'],
            left: ['right', 'scaleX(0.01)'],
            right: ['left', 'scaleX(0.01)'],
        };

        [$popover.style.transformOrigin, $popover.style.transform] = map[placement];

        $popover.style.top = `${top}px`;
        $popover.style.left = `${left}px`;
        $popover.style.zIndex = zindexInfo.global;
        zindexInfo.global += 1;

        await nap();

        if (this.useTransition) {
            $popover.style.transition = 'all .25s,opacity .2s';
        }
    }

    initPopover() {
        const el = document.createElement('div');
        el.classList.add('chat_popover');

        if (this.popoverClass) {
            el.classList.add(this.popoverClass);
        }

        this.$popover = el;
    }

    async hide() {
        if (!this.isShow) return;

        const handleTransitionEnd = () => {
            removeEle(this.$content);
            removeEle(this.$popover);

            this.OutsideUnbind();
            this.$popover.removeEventListener('transitionend', handleTransitionEnd);
        };

        this.$popover.addEventListener('transitionend', handleTransitionEnd);
        toggleEleFade(this.$popover, false);
        this.isShow = false;
    }
}

export const showPoptip = (text, $triggerEle, $edgeEle, placement = 'right') => {
    const tooltip = new Popover({
        placement,
        text,
        $edgeEle,
        $triggerEle,
        offset: 0,
        hideDelay: 1000,
    });
    tooltip.show();
};
