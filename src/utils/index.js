import { SHOW_CLASS_NAME, FADE_CLASS_NAME, STATUS_MESSAGE, ROLE, NO_THREAD } from '@/constants';

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

export function throwError(msg) {
    throw new Error(msg);
}

export function throwFalsyError(value) {
    if (!value) {
        throwError(`unexpected falsy value:${value}`);
    }
}

export function throwImplementationError(value) {
    if (!value) {
        throwError(`should implement in child classes`);
    }
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
    const mathFloor = (val) => Math.floor(val);
    const seconds = mathFloor((new Date() - new Date(date)) / 1000);
    let interval = mathFloor(seconds / 31536000);

    if (interval >= 1) {
        return `${interval} year${interval === 1 ? '' : 's'} ago`;
    }
    interval = mathFloor(seconds / 2592000);
    if (interval >= 1) {
        return `${interval} month${interval === 1 ? '' : 's'} ago`;
    }
    interval = mathFloor(seconds / 86400);
    if (interval >= 1) {
        return `${interval} day${interval === 1 ? '' : 's'} ago`;
    }
    interval = mathFloor(seconds / 3600);
    if (interval >= 1) {
        return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    }
    interval = mathFloor(seconds / 60);
    if (interval >= 1) {
        return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    }
    if (seconds === 0) {
        return 'just now';
    }
    return `${mathFloor(seconds)} second${mathFloor(seconds) === 1 ? '' : 's'} ago`;
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
        if (placement === 'left') {
            return calculatePopoverPosition(edgeRect, triggerRect, contentWidth, contentHeight, distance, 'right');
        }
    } else if (left + contentWidth > viewportWidth) {
        left = viewportWidth - contentWidth;

        if (placement === 'right') {
            return calculatePopoverPosition(edgeRect, triggerRect, contentWidth, contentHeight, distance, 'left');
        }
    }

    if (top < 0) {
        top = 0;
    } else if (top + contentHeight > viewportHeight) {
        top = viewportHeight - contentHeight;
    }

    return { left, top, placement };
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

export const isMsgExpected = (status) => [STATUS_MESSAGE.cancel, STATUS_MESSAGE.success].includes(status);

export const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

const enterElSet = new WeakSet();

export const bindEnter = (el, func) => {
    enterElSet.add(el);
    el.addEventListener('enter', func);
};

window.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (!enterElSet.has(e.target)) return;
    e.target.dispatchEvent(new CustomEvent('enter'));
});

export const htmlStrToElement = (str) => {
    const template = document.createElement('template');

    template.innerHTML = str;
    return template.content.lastChild;
};

export const getFirstUserContentOrThrow = (engine) => {
    const firstUserMsg = engine.thread.find((msg) => msg.role === ROLE.user);
    if (!firstUserMsg) {
        throwError(NO_THREAD);
    }
    return firstUserMsg.content;
};

export const showTooltip = (text, isError) => {
    if (process.env.IS_BROWSER) {
        window.alert('trilium only');
        return;
    }

    if (isError) {
        api.showError(text, 3000);
    } else {
        api.showMessage(text);
    }
};

export function wrapP(str) {
    return `<p>${str}</p>`;
}

export function threadToText(thread, useHtml) {
    let text = thread.map((v) => `role: ${v.role}\n${v.content}`).join('\n');

    if (useHtml) {
        text = thread.map((v) => `<p>role: ${v.role}</p><p>${v.content}</p>`).join('');
    }

    if (!text) {
        throwError('no content');
    }
    return text;
}

export const sliceTitle = (title) => title.slice(0, 20);
