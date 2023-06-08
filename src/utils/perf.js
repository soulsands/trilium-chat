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
