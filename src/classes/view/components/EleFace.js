import { OPTION_KEY, EVENT_VIEW } from '@/constants';
import { random } from '@/utils';

export default class EleFace {
    constructor(view) {
        this.view = view;
        const $face = view.$chatView.$qs('.header_face');

        view.on(EVENT_VIEW.viewShow, () => {
            this.refreshFace($face, view.options);
        });

        this.handleCheckUpdates($face, view.options);
    }

    async handleCheckUpdates($face, options) {
        if (!options.checkUpdates) return;
        try {
            const URL = 'https://api.github.com/repos/soulsands/trilium-chat/releases/latest';
            const resp = await fetch(URL);
            const info = await resp.json();

            const latestVersion = info?.tag_name;
            const current = window.__triliumChatVersion || '1.1.1'; // dev test

            if (latestVersion > current) {
                $face.classList.add('dot');
                $face.setAttribute('title', 'New version found, click to download');

                $face.addEventListener(
                    'click',
                    async (e) => {
                        e.preventDefault();
                        try {
                            const downloadUrl = info.assets[0].browser_download_url;
                            window.open(downloadUrl);
                        } catch (error) {
                            console.error(error);
                        }
                    },
                    true
                );
            }
        } catch (error) {}
    }

    refreshFace($face, options) {
        const faceArray = options[OPTION_KEY.faces];
        const colors = options[OPTION_KEY.colors];

        const randomFace = random(faceArray);
        const randomColor = random(colors);

        $face.classList.forEach((name) => {
            if (/bx.+/.test(name)) {
                $face.classList.remove(name);
            }
        });
        $face.style.color = randomColor;
        $face.classList.add(randomFace);
    }
}
