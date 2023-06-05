import LittleEvent from '@/classes/LittleEvent';
import { animationFrame } from '@/utils';
import { EVENT_VIEW, OPTION_KEY } from '@/constants';

export default class EleResizer extends LittleEvent {
    constructor(view) {
        super();
        this.view = view;
        this.$chatView = view.$chatView;

        this.$resizer = this.$chatView.$qs('.resizer');

        this.bindResize();
    }

    bindResize() {
        let initialX = -1;
        let initialWidth = -1;
        let newWidth = -1;

        const handleMousemove = (e) => {
            e.stopPropagation();

            animationFrame(() => {
                newWidth = initialWidth + (initialX - e.x);
                this.$chatView.style.width = `${newWidth}px`;
            }, 'handleMousemove');
        };
        const handleMouseup = (e) => {
            e.stopPropagation();

            // console.log(e, 'mouseup');
            document.body.style.cursor = null;

            this.view.chatData.setOption(OPTION_KEY.viewWidth, newWidth);

            document.removeEventListener('mousemove', handleMousemove, true);
            document.removeEventListener('mouseup', handleMouseup);
        };

        this.$resizer.addEventListener(
            'mousedown',
            (e) => {
                e.preventDefault();
                e.stopPropagation();

                // console.log(e, 'mousedown');
                document.body.style.cursor = 'e-resize';

                initialX = e.x;
                initialWidth = Number(window.getComputedStyle(this.$chatView).width.replace('px', ''));

                document.addEventListener('mousemove', handleMousemove, true);
                document.addEventListener('mouseup', handleMouseup);
            },
            true
        );
    }
}
