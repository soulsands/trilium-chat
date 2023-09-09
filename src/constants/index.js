export const isDev = process.env.NODE_ENV === 'development';

if (isDev && !process.env.APIKEY) {
    throw new Error('APIKEY not found, please create .env.dev and set your APIKEY');
}

export const ROLE = {
    system: 'system',
    user: 'user',
    assistant: 'assistant',
    error: 'error',
};

export const EVENT_VIEW = {
    viewShow: 'viewShow',
    viewHide: 'viewHide',

    formSave: 'formSave',
    formCancel: 'formCancel',

    promptToggle: 'promptToggle',
    send: 'send',

    p: 'p', // prompts
    c: 'c', // command
    h: 'h', // history
};

export const EVENT_GLOBAL = {
    poperHide: 'ph',
};

export const EVENT_ENGINE = {
    create: 'create',
    append: 'append',
    replace: 'replace',
    cancel: 'cancel',
    setStatus: 'setStatus',
    load: 'load',
};

export const COMMAND_TYPE = {
    copy: 'copy',
    history: 'history',
    favor: 'favor',
    unfavor: 'unfavor',
    set: 'set',
    append: 'append',
    child: 'child',
    insert: 'insert',
};

export const EVENT_DATA = {
    setStatus: 'setStatus',
};

export const STATUS_DATA = {
    optionSyncing: 'optionSyncing',
    success: 'success',
    failed: 'failed',
};

export const STATUS_MESSAGE = {
    none: 'none',
    fetching: 'fetching',
    generating: 'generating',
    success: 'success',
    failed: 'failed',
    cancel: 'cancel',
};

export const SHOW_CLASS_NAME = 'show';
export const FADE_CLASS_NAME = 'fadein';

export const OPTION_KEY = {
    viewWidth: 'viewWidth',
    faces: 'faces',
    colors: 'colors',
};

export const TRILIUM_ONLY = 'TRILIUM_ONLY';

export const DATA_KEYS = {
    CHAT_OPTIONS: 'CHAT_OPTIONS',
    CHAT_PROMPTS: 'CHAT_PROMPTS',
    HISTORY_LABEL: 'CHAT_HISTORY_ID',
    HISTORY_HOME_LABEL: 'CHAT_HISTORY_HOME',
};

export const DEFAULT_OPTIONS = {
    viewWidth: 400,
    engine: 'ChatGpt',
    apiKey: process.env.APIKEY,
    requestUrls: {
        completion: 'https://api.openai.com/v1/chat/completions',
    },
    engineOptions: {
        model: 'gpt-3.5-turbo-16k',
        max_tokens: 2500,
        temperature: 0.3,
        top_p: 1,
        presence_penalty: 0.5,
        frequency_penalty: 0.5,
        stream: true,
        n: 1,
    },
    shortcut: {
        toggle: 'Alt+Q',
        hide: 'Esc',
    },
    faces: [
        'bx-smile',
        'bx-wink-smile',
        'bx-face',
        // 'bxs-face',
        // 'bx-wink-tongue',
        'bx-happy-alt',
        'bx-cool',
        'bx-laugh',
        'bx-upside-down',
        // 'bx-meh-alt',
        // 'bx-meh-alt',
        // 'bx-shocked',
    ],
    // colors: ['#e47b19', '#50a52c', '#e23f3b'],
    colors: ['var(--muted-text-color)'],
    autoSave: true,
    // systemPrompt: 'You are a helpful assistant for Trilium note-taking.',
    systemPrompt: '',
    checkUpdates: true,
};
export const DEFAULT_PROMPTS = [
    {
        id: 'official-0',
        name: 'translate',
        content: 'Translate the following content to {{language:English|Chinese|Czech}} language: \n{{message}}',
        order: 0,
    },
    {
        id: 'official-1',
        name: 'translateNote',
        content: 'Translate the following content to {{language:English|Chinese|Czech}} language: \n{{activeNote}}',
        order: 1,
    },
];

export const NOT_SUPPORTED = 'NOT SUPPORTED';
export const SUPPORT_TYPE = 'Only support text/code';

export const NO_THREAD = 'No thread';
