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

export const zindexInfo = { global: 0, currentModal: null };
