// on/off/emit for custom events

export default class LittleEvent {
    constructor() {
        this.listeners = {};
    }

    addEventListener(type, listener) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        if (this.listeners[type].indexOf(listener) === -1) {
            this.listeners[type].push(listener);
        }
    }

    on(type, listener) {
        return this.addEventListener(type, listener);
    }

    removeEventListener(type, listener) {
        if (!this.listeners[type]) {
            return;
        }
        const filtered = [];
        for (let i = 0; i < this.listeners[type].length; i += 1) {
            if (this.listeners[type][i] !== listener) {
                filtered.push(this.listeners[type][i]);
            }
        }
        if (this.listeners[type].length === 0) {
            delete this.listeners[type];
        } else {
            this.listeners[type] = filtered;
        }
    }

    off(type, listener) {
        return this.removeEventListener(type, listener);
    }

    // dispatchEvent
    dispatchEvent(event) {
        if (!event) {
            return true;
        }
        // eslint-disable-next-line no-param-reassign
        event.source = this;
        // set onHandler to on + event type
        const onHandler = `on${event.type}`;
        // check if the onHandler has own property named same as onHandler

        if (Object.hasOwnProperty.call(this, onHandler)) {
            // call the onHandler
            this[onHandler].call(this, event);
            // check if the event is default prevented
            if (event.defaultPrevented) {
                return false;
            }
        }
        // check if the event type is in the listeners
        if (this.listeners[event.type]) {
            return this.listeners[event.type].every((callback) => {
                callback(event);
                return !event.defaultPrevented;
            });
        }
        return true;
    }

    emit(eventType, ...rest) {
        if (this.listeners[eventType]) {
            this.listeners[eventType].forEach((callback) => {
                callback(...rest);
            });
        }
    }
}
