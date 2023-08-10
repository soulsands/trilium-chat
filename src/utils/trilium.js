import { STATUS_MESSAGE, NO_THREAD, ROLE } from '@/constants';
import { debug } from './func';
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

export function contentToHtml(str) {
    if (typeof str !== 'string') {
        throw new TypeError('should be string');
    }
    const reg = /[^\n]+\n?/g;
    const handler = str.match(reg).reduce(
        (config, p, index, arr) => {
            const codeReg = /```/;
            const codeCatched = codeReg.test(p);

            if (codeCatched) {
                config.inCode = !config.inCode;

                if (config.codeStr) {
                    config.strs.push(`<pre><code>${config.codeStr}</code></pre>`);
                    config.codeStr = '';
                }
            } else if (config.inCode) {
                config.codeStr += p;
            } else {
                config.strs.push(`<p>${p.replace('\n', '')}</p>`);
            }

            if (index === arr.length - 1 && config.inCode) {
                config.strs.push(`<pre><code>${config.codeStr}</code></pre>`);
            }

            return config;
        },
        { inCode: false, strs: [], codeStr: '' }
    );
    debug(handler);
    return handler.strs.join('');
}

export function threadToText(thread, useHtml) {
    let text = thread.map((v) => `role: ${v.role}\n${v.content}`).join('\n');

    if (useHtml) {
        text = thread.map((v) => `<p>role: ${v.role}</p>${contentToHtml(v.content)}`).join('');
    }

    if (!text) {
        throwError('no content');
    }
    return text;
}

export const sliceTitle = (title) => title.slice(0, 50);
