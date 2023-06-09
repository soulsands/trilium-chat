import './styles/main.less';
import LittleEvent from '@/classes/LittleEvent';
import { SHOW_CLASS_NAME, EVENT_VIEW, OPTION_KEY } from '@/constants';
import { throwImplementationError } from '@/utils';

import EleThread from './components/EleThread';
import EleResizer from './components/EleResizer';
import EleGenerate from './components/EleGenerate';
import EleInput from './components/EleInput';
import EleStatus from './components/EleStatus';
import EleFace from './components/EleFace';
import EleCollapse from './components/EleCollapse';
import EleHistory from './components/EleHistory';
import EleNewChat from './components/EleNewChat';
import EleCommand from './components/EleCommand';
import ElePrompt from './components/ElePrompt';
import EleOption from './components/EleOption';

export default class View extends LittleEvent {
    constructor({ options, chatData, chatEngine }) {
        super();
        this.options = options;
        this.chatData = chatData;
        this.chatEngine = chatEngine;

        this.appendEleToHost();

        this.$chatView = null;
        this.initSkeleton();
        this.activateElements();

        this.initViewWidth();

        this.bindListeners();
    }

    appendEleToHost() {
        this.appendToggleBtn();
    }

    appendToggleBtn() {
        throwImplementationError();
    }

    initSkeleton() {
        throwImplementationError();
    }

    activateElements() {
        this.elePrompt = new ElePrompt(this);
        this.eleInput = new EleInput(this);
        this.eleResizer = new EleResizer(this);
        this.eleThread = new EleThread(this);
        this.eleGenerate = new EleGenerate(this);
        this.eleStatus = new EleStatus(this);
        this.eleFace = new EleFace(this);
        this.eleCollapse = new EleCollapse(this);
        this.eleHistory = new EleHistory(this);
        this.eleNewChat = new EleNewChat(this);
        this.eleCommand = new EleCommand(this);
        // eslint-disable-next-line no-new
        new EleOption(this);
    }

    initViewWidth() {
        this.$chatView.style.width = `${this.options[OPTION_KEY.viewWidth]}px`;
    }

    bindListeners() {
        this.bindShortcut();
    }

    bindShortcut() {
        throwImplementationError();
    }

    showView() {
        this.emit(EVENT_VIEW.viewShow);

        this.$chatView.classList.add(SHOW_CLASS_NAME);
    }

    hideView() {
        this.emit(EVENT_VIEW.viewHide);

        this.$chatView.classList.remove(SHOW_CLASS_NAME);
    }

    isViewShow() {
        return this.$chatView.classList.contains(SHOW_CLASS_NAME);
    }

    toggleView() {
        if (this.isViewShow()) {
            this.hideView();
        } else {
            this.showView();
        }
    }
}
