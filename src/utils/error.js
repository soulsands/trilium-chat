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
