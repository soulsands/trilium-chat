import { nap, sleep, throwError } from '@/utils';
import { DEFAULT_OPTIONS, DEFAULT_PROMPTS, DATA_KEYS, TRILIUM_ONLY, EVENT_DATA, STATUS_DATA } from '@/constants';

import Data from './Data';

async function getLocalItem(key) {
    await sleep(200);
    const res = localStorage.getItem(key);
    return JSON.parse(res);
}

async function setLocalItem(key, value) {
    await sleep(200);

    localStorage.setItem(key, JSON.stringify(value));

    return { ...value };
}
export default class DataDev extends Data {
    async getOptions() {
        return getLocalItem(DATA_KEYS.CHAT_OPTIONS);
    }

    async setOptions(value) {
        return setLocalItem(DATA_KEYS.CHAT_OPTIONS, value);
    }

    async setDefaultOptions() {
        return setLocalItem(DATA_KEYS.CHAT_OPTIONS, DEFAULT_OPTIONS);
    }

    // >>prompt
    getPrompts() {
        return getLocalItem(DATA_KEYS.CHAT_PROMPTS);
    }

    async setPrompts(value) {
        return setLocalItem(DATA_KEYS.CHAT_PROMPTS, value);
    }

    async setDefaultPrompts() {
        return setLocalItem(DATA_KEYS.CHAT_PROMPTS, DEFAULT_PROMPTS);
    }

    async getAcitveNoteContent() {
        await nap();
        this.emit(EVENT_DATA.setStatus, { status: STATUS_DATA.faild, key: 'noteId', value: 'file' });
        throw new Error('not supported');
    }

    // <<prompt

    // >> history
    async getRecords() {
        return (await getLocalItem(DATA_KEYS.HISTORY_HOME_LABEL)) || [];
    }

    async getRecord(id) {
        const allRecords = await this.getRecords();
        return allRecords.find((record) => record.id === id);
    }

    /*   async getRecord(id) {
        const records = await this.getRecords();

        return records.find((record) => record.id === id);
    } */

    /**
     * @param {Object} record
     * @param {date} record.id
     * @param {boolean} record.favor
     * @param {Object[]} record.list
     * @param {string} record.list[].role
     * @param {string} record.list[].content
     * @param {date} record.list[].stamp
     * @param {boolean} record.list[].favor
     */
    async saveRecord(record) {
        const records = await this.getRecords();

        const originRecordIndex = records.findIndex((originRecord) => originRecord.id === record.id);

        if (originRecordIndex !== -1) {
            records.splice(originRecordIndex, 1, record);
        } else {
            records.push(record);
        }

        return setLocalItem(DATA_KEYS.HISTORY_HOME_LABEL, records);
    }

    setNoteWith() {
        throwError(TRILIUM_ONLY);
    }

    appendToNote() {
        throwError(TRILIUM_ONLY);
    }

    saveToChild() {
        throwError(TRILIUM_ONLY);
    }

    insertContent() {
        throwError(TRILIUM_ONLY);
    }

    // << options
    async goOptions() {
        window.alert('preview: options is stored in localstorage');
    }
    // >> options
}
