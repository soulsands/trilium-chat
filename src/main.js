import ChatGpt from '@/classes/engine/ChatGpt';
import ViewDev from '@/classes/view/ViewDev';
import ViewTrilium from '@/classes/view/ViewTrilium';
import DataDev from '@/classes/data/DataDev';
import DataTrilium from '@/classes/data/DataTrilium';
import { EVENT_ENGINE, EVENT_DATA } from '@/constants';
import { nap } from '@/utils';

// el.*\.on
// Data.on
// Engine.on
// only called in this file.
class TriliumChat {
    constructor() {
        this.init();
    }

    async init() {
        const chatData = this.setChatData();
        const options = await chatData.initOptions();
        await chatData.initPrompts();
        const chatEngine = this.getEngine(options);

        this.setView({ chatData, options, chatEngine });

        chatEngine.newChat();
    }

    setChatData() {
        this.chatData = process.env.IS_BROWSER ? new DataDev() : new DataTrilium();

        this.chatData.on(EVENT_DATA.setStatus, (data) => {
            this.chatView.eleStatus.handleDataStatus(data);
        });

        return this.chatData;
    }

    getEngine(options) {
        let chatEngine;
        if (options.engine.toLowerCase() === 'chatgpt') {
            chatEngine = new ChatGpt(options);
        }

        chatEngine.on(EVENT_ENGINE.setStatus, (status) => {
            if (options.autoSave) {
                this.chatData.handleMsgStatus(status, chatEngine);
            }
        });

        return chatEngine;
    }

    async setView(viewParams) {
        const ViewClass = process.env.IS_BROWSER ? ViewDev : ViewTrilium;

        this.chatView = new ViewClass(viewParams);
    }
}

Element.prototype.$qs = Element.prototype.querySelector;
Document.prototype.$qs = Document.prototype.querySelector;

await nap();
window._triliumChat = new TriliumChat();
