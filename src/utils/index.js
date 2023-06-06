import { SHOW_CLASS_NAME, FADE_CLASS_NAME, STATUS_MESSAGE } from '@/constants';

const lock = {};
// eslint-disable-next-line import/prefer-default-export
export function animationFrame(callback, key = 'default') {
    if (lock[key]) {
        return false;
    }
    lock[key] = true;
    window.requestAnimationFrame((time) => {
        lock[key] = false;
        callback(time);
    });
    return true;
}

export function throttle(func, delay) {
    let lastTime = 0;
    return function wrapped(...args) {
        const now = new Date().getTime();
        if (now - lastTime >= delay) {
            func.apply(this, args);
            lastTime = now;
        }
    };
}

export function throwFalsyError(value) {
    if (!value) {
        throw new Error(`unexpected falsy value:${value}`);
    }
}

export function throwImplementationError(value) {
    if (!value) {
        throw new Error(`should implement in child classes`);
    }
}
export function throwCommandError(type, reason) {
    throw new Error(JSON.stringify({ type, reason }));
}

export function toggleClassName(ele, toggle, className) {
    if (typeof toggle === 'boolean') {
        if (toggle) {
            ele.classList.add(className);
        } else {
            ele.classList.remove(className);
        }
    } else if (ele.classList.contains(className)) {
        ele.classList.remove(className);
    } else {
        ele.classList.add(className);
    }
}

export function toggleEleShow(ele, show) {
    toggleClassName(ele, show, SHOW_CLASS_NAME);
}
export function toggleEleFade(ele, fadein) {
    toggleClassName(ele, fadein, FADE_CLASS_NAME);
}

export async function sleep(duration) {
    await new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}

export function checkNewKey(newObj, oldObj) {
    let has = false;
    Object.keys(newObj).forEach((key) => {
        if (!(key in oldObj)) {
            has = true;
        }
    });
    return has;
}

export function mergeOption(from, to) {
    const mixed = { ...to };
    Object.keys(from).forEach((key) => {
        if (key in to) {
            mixed[key] = from[key];
        }
    });
    return mixed;
}

export function removeEle(ele) {
    if (!ele.parentElement) return;
    return ele.parentElement.removeChild(ele);
}

export async function nap() {
    await sleep(10);
}

export function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
        return `${interval} year${interval === 1 ? '' : 's'} ago`;
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return `${interval} month${interval === 1 ? '' : 's'} ago`;
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return `${interval} day${interval === 1 ? '' : 's'} ago`;
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    }
    if (seconds === 0) {
        return 'just now';
    }
    return `${Math.floor(seconds)} second${Math.floor(seconds) === 1 ? '' : 's'} ago`;
}

export function closest(selector, element) {
    if (!element?.matches) return null;

    if (element.matches(selector)) {
        return element;
    }

    const parent = element.parentNode;

    return closest(selector, parent);
}

// trigger element might be coverd, but it can be avoid with proper placement
export function calculatePopoverPosition(edgeRect, triggerRect, contentWidth, contentHeight, distance, placement) {
    let left;
    let top;

    // console.log(edgeRect, triggerRect, contentHeight, contentWidth, distance, placement);
    switch (placement) {
        case 'top':
            left = triggerRect.left + triggerRect.width / 2 - contentWidth / 2;
            top = triggerRect.top - contentHeight - distance;
            break;
        case 'left':
            left = triggerRect.left - contentWidth - distance;
            top = triggerRect.top + triggerRect.height / 2 - contentHeight / 2;
            break;
        case 'right':
            left = triggerRect.left + triggerRect.width + distance;
            top = triggerRect.top + triggerRect.height / 2 - contentHeight / 2;
            break;
        case 'bottom':
            left = triggerRect.left + triggerRect.width / 2 - contentWidth / 2;
            top = triggerRect.top + triggerRect.height + distance;
            break;
        default:
            left = triggerRect.left + triggerRect.width / 2 - contentWidth / 2;
            top = triggerRect.top - contentHeight - distance;
    }

    left -= edgeRect.left;
    top -= edgeRect.top;

    // Adjust popover position if it goes out of the viewport
    const viewportWidth = edgeRect.width;
    const viewportHeight = edgeRect.height;

    if (left < 0) {
        left = 0;
    } else if (left + contentWidth > viewportWidth) {
        left = viewportWidth - contentWidth;
    }

    if (top < 0) {
        top = 0;
    } else if (top + contentHeight > viewportHeight) {
        top = viewportHeight - contentHeight;
    }

    return { left, top };
}

export const copy = (text) => {
    navigator.clipboard.writeText(text);
};

const optionReg = /{{([^}]+):([^}]+)}}/g;

export const promptToHtml = (content) => {
    let html = content;

    let result;
    // eslint-disable-next-line no-cond-assign
    while ((result = optionReg.exec(html)) !== null) {
        const matched = result[0];
        const label = result[1].trim();
        const options = result[2].split('|').map((v) => v.trim());

        const optionsHtml = options.map((v) => `<option value="${v}">${v}</option>`).join('');
        const totalHtml = `<select name="${label}">${optionsHtml}<select>`;
        html = html.replace(matched, totalHtml);
    }

    optionReg.lastIndex = 0;
    return html;
};
export const getParsedPromt = ($wrapper, promptContent) => {
    /* console.log(promptContent);
    console.log($wrapper); */

    let parsed = promptContent;
    const $selects = Array.from($wrapper.querySelectorAll('select'));
    $selects.forEach((select) => {
        const matched = optionReg.exec(parsed)[0];
        parsed = parsed.replace(matched, select.value);
    });

    optionReg.lastIndex = 0;
    return parsed;
};

export const isMsgExpected = (status) => {
    return [STATUS_MESSAGE.cancel, STATUS_MESSAGE.success].includes(status);
};
