import { OPTION_KEY, EVENT_VIEW } from '@/constants';

export default class EleFace {
    constructor(view) {
        this.options = view.options;
        this.view = view;

        this.$face = view.$chatView.$qs('.header_face');

        view.on(EVENT_VIEW.viewShow, () => {
            this.refreshFace();
        });
    }

    refreshFace() {
        const faceArray = this.options[OPTION_KEY.faces];
        const colors = this.options[OPTION_KEY.colors];

        const faceIndex = Math.floor(Math.random() * faceArray.length);
        const randomFace = faceArray[faceIndex];

        const colorIndex = Math.floor(Math.random() * colors.length);
        const color = colors[colorIndex];

        this.$face.classList.forEach((name) => {
            if (/bx.+/.test(name)) {
                this.$face.classList.remove(name);
            }
        });
        this.$face.style.color = color;
        this.$face.classList.add(randomFace);
    }
}
