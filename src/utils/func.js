export async function sleep(duration) {
    await new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}
export async function nap() {
    await sleep(10);
}

export const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function wrapP(str) {
    return `<p>${str}</p>`;
}
export function toLowerCase(str) {
    return str.toLowerCase();
}

export function debug(...args) {
    if (process.env.DEBUG) {
        console.warn(...args);
    }
}

export const arrayRemove = (array, target) => {
    const index = array.findIndex((v) => v === target);
    if (index !== -1) {
        array.splice(index, 1);
    }
};
