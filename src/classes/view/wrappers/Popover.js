import { toggleEleShow, toggleEleFade, removeEle, nap, calculatePopoverPosition } from '@/utils';

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

        this.setPopoverStyle();
        toggleEleShow(this.$popover, true);

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

    setPopoverStyle() {
        const edgeRect = this.$edgeEle.getBoundingClientRect();
        const triggerRect = this.$triggerEle.getBoundingClientRect();

        console.log(edgeRect);
        console.log(triggerRect);

        const { top, left } = calculatePopoverPosition(
            edgeRect,
            triggerRect,
            this.$popover.offsetWidth,
            this.$popover.offsetHeight,
            this.offset,
            this.placement
        );

        this.$popover.style.top = `${top}px`;
        this.$popover.style.left = `${left}px`;
        this.$popover.style.bottom = `initial`;

        zindexInfo.global += 1;
        this.$popover.style.zIndex = zindexInfo.global;
    }

    initPopover() {
        const el = document.createElement('div');
        el.classList.add('chat_popover');

        if (this.popoverClass) {
            el.classList.add(this.popoverClass);
        }

        const map = {
            top: ['bottom', 'scaleY(0.01)'],
            bottom: ['top', 'scaleY(0.01)'],
            left: ['right', 'scaleX(0.01)'],
            right: ['left', 'scaleX(0.01)'],
        };

        [el.style.transformOrigin, el.style.transform] = map[this.placement];

        if (this.useTransition) {
            el.style.transition = 'all .25s,opacity .2s';
        }

        this.$popover = el;
    }

    async hide() {
        if (!this.isShow) return;

        const handleTransitionEnd = () => {
            toggleEleShow(this.$popover, false);
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
