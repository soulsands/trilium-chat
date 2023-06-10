import { SHOW_CLASS_NAME, FADE_CLASS_NAME } from '@/constants';

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

export function removeEle(ele) {
    if (!ele.parentElement) return;
    return ele.parentElement.removeChild(ele);
}

export function closest(selector, element) {
    if (!element?.matches) return null;

    if (element.matches(selector)) {
        return element;
    }

    const parent = element.parentNode;

    return closest(selector, parent);
}

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
    let parsed = promptContent;
    const $selects = Array.from($wrapper.querySelectorAll('select'));
    $selects.forEach((select) => {
        const matched = optionReg.exec(parsed)[0];
        parsed = parsed.replace(matched, select.value);
    });

    optionReg.lastIndex = 0;
    return parsed;
};

export const htmlStrToElement = (str) => {
    const template = document.createElement('template');

    template.innerHTML = str;
    return template.content.lastChild;
};

const callbacks = new Map();
export function clickOutside(el, fn) {
    callbacks.set(el, fn);

    return function unbind() {
        callbacks.delete(el);
    };
}

function globalClick(e) {
    callbacks.forEach((fn, el) => {
        if (!el.contains(e.target)) {
            // click outside
            fn.call(el, e);
        }
    });
}
clickOutside.globalClick = globalClick;
document.addEventListener('click', globalClick);

export const zindexInfo = { global: 0, currentModal: null, stack: [] };
const enterElSet = new WeakSet();

export const bindEnter = (el, func) => {
    enterElSet.add(el);
    el.addEventListener('enter', func);
};
const escELSet = new WeakSet();
export const bindEsc = (el, func) => {
    escELSet.add(el);
    el.addEventListener('esc', func);
};

export const keydownHandler = (e) => {
    if (e.key === 'Enter') {
        if (!enterElSet.has(e.target)) return;
        e.stopImmediatePropagation();
        e.target.dispatchEvent(new CustomEvent('enter'));
        return;
    }
    if (e.key === 'Escape') {
        const popper = zindexInfo.stack.pop();
        if (popper) {
            e.stopImmediatePropagation();

            popper.hide();
        }
        if (escELSet.has(e.target)) {
            e.target.dispatchEvent(new CustomEvent('esc'));
        }
    }
};
