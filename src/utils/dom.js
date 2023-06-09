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
