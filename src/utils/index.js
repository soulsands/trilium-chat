export * from './dom';
export * from './perf';
export * from './error';
export * from './trilium';
export * from './escape';

export async function sleep(duration) {
    await new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
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

export const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function wrapP(str) {
    return `<p>${str}</p>`;
}

export function toLowerCase(str) {
    return str.toLowerCase();
}
