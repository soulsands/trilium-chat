import { STATUS_MESSAGE, NO_THREAD, ROLE } from '@/constants';

import { throwError } from './error';

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
export const isMsgExpected = (status) => [STATUS_MESSAGE.cancel, STATUS_MESSAGE.success].includes(status);

export const getFirstUserContentOrThrow = (engine) => {
    const firstUserMsg = engine.thread.find((msg) => msg.role === ROLE.user);
    if (!firstUserMsg) {
        throwError(NO_THREAD);
    }
    return firstUserMsg.content;
};

export const showTooltip = (text, isError) => {
    if (process.env.IS_BROWSER) {
        window.alert(text);
        return;
    }

    if (isError) {
        api.showError(text, 3000);
    } else {
        api.showMessage(text);
    }
};

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

export const sliceTitle = (title) => title.slice(0, 50);
