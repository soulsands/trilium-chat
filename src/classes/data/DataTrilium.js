import { DEFAULT_OPTIONS, DATA_KEYS, COMMAND_TYPE, DEFAULT_PROMPTS, EVENT_DATA, STATUS_DATA } from '@/constants';
import { throwOpError } from '@/utils';

import Data from './Data';

export default class DataTrilium extends Data {
    // >>options
    async getOptions() {
        return api.runOnBackend(
            async (label) => {
                const targetNote = api.getNoteWithLabel(label);
                if (!targetNote) return null;

                const options = targetNote.getJsonContent();
                if (!options) return null;

                return options;
            },
            [DATA_KEYS.CHAT_OPTIONS]
        );
    }

    async setOptions(value) {
        await api.runOnBackend(
            async (label, content) => {
                const strContent = JSON.stringify(content, null, '\t');

                const existedNote = api.getNoteWithLabel(label);
                if (existedNote) {
                    existedNote.setContent(strContent);
                } else {
                    const newNote = api.createNewNote({
                        parentNoteId: api.currentNote.noteId,
                        title: 'CHAT_OPTIONS: reload to take effect',
                        content: strContent,
                        type: 'code',
                        mime: 'application/json',
                    }).note;

                    newNote.setLabel(label);
                }
            },
            [DATA_KEYS.CHAT_OPTIONS, value]
        );

        return { ...value };
    }

    async setDefaultOptions() {
        return this.setOptions(DEFAULT_OPTIONS);
    }
    // <<options

    // >>prompts
    async getPrompts() {
        return api.runOnBackend(
            async (label) => {
                const targetNote = api.getNoteWithLabel(label);
                if (!targetNote) return null;

                const options = targetNote.getJsonContent();
                if (!options) return null;

                return options;
            },
            [DATA_KEYS.CHAT_PROMPTS]
        );
    }

    async setPrompts(value) {
        await api.runOnBackend(
            async (label, content) => {
                const strContent = JSON.stringify(content, null, '\t');

                const existedNote = api.getNoteWithLabel(label);
                if (existedNote) {
                    existedNote.setContent(strContent);
                } else {
                    const newNote = api.createNewNote({
                        parentNoteId: api.currentNote.noteId,
                        title: 'CHAT_PROMPTS',
                        content: strContent,
                        type: 'code',
                        mime: 'application/json',
                    }).note;

                    newNote.setLabel(label);
                }
            },
            [DATA_KEYS.CHAT_PROMPTS, value]
        );

        return { ...value };
    }

    async setDefaultPrompts() {
        return this.setPrompts(DEFAULT_PROMPTS);
    }

    /**
     * @returns {Promise}
     */
    async getAcitveNoteContent() {
        const acviteNote = api.getActiveContextNote();
        let content = null;
        if (acviteNote.type === 'text') {
            const editWidget = document.querySelector('.note-detail-editable-text');
            const isEdit = window.getComputedStyle(editWidget).display === 'block';
            if (isEdit) {
                content = editWidget.querySelector('.note-detail-editable-text-editor').textContent;
            } else {
                content = document.querySelector('.note-detail-readonly-text-content').textContent;
            }
        } else if (acviteNote.type === 'code') {
            content = (await acviteNote.getNoteComplement()).content;
        }

        if (content === null) {
            this.emit(EVENT_DATA.setStatus, {
                status: STATUS_DATA.faild,
                key: 'acitveNote',
                value: `type ${acviteNote.type} not supported`,
            });
            throw new Error(`not supported`);
        }
        this.emit(EVENT_DATA.setStatus, {
            status: STATUS_DATA.success,
        });
        return content;
    }
    // <<prompts

    // >>history
    async getRecords() {
        return api.runOnBackend(
            async (label) => {
                const targetNotes = api.getNotesWithLabel(label) || [];

                return targetNotes.map((note) => ({ ...note.getJsonContent(), title: note.title }));
            },
            [DATA_KEYS.HISTORY_LABEL]
        );
    }

    async getRecord(id) {
        return api.runOnBackend(
            async (label, recordId) => {
                const targetNote = api.getNoteWithLabel(label, recordId);
                if (!targetNote) return null;

                return { ...targetNote.getJsonContent(), title: targetNote.title };
            },
            [DATA_KEYS.HISTORY_LABEL, id]
        );
    }

    async saveRecord(record) {
        await api.runOnBackend(
            async (homeLabel, historyLabel, _record) => {
                const existedNote = api.getNoteWithLabel(historyLabel, `${_record.id}`);
                const strContent = JSON.stringify(_record, null, '\t');

                if (existedNote) {
                    existedNote.setContent(strContent);
                } else {
                    const homeNote = api.getNoteWithLabel(homeLabel) || api.currentNote;

                    // allow user to modify history note's title
                    const newNote = api.createNewNote({
                        parentNoteId: homeNote.noteId,
                        title: _record.originTitle,
                        content: strContent,
                        type: 'code',
                        mime: 'application/json',
                    }).note;

                    newNote.setLabel(historyLabel, _record.id);
                }
            },
            [DATA_KEYS.HISTORY_HOME_LABEL, DATA_KEYS.HISTORY_LABEL, record]
        );
        return { ...record };
    }

    // <<history

    // >> command
    async handleSetNote(engine) {
        const text = this.threadToText(engine, COMMAND_TYPE.set);
        const acviteNote = api.getActiveContextNote();

        try {
            await api.runOnBackend(
                async (id, content) => {
                    const activeNote = api.getNote(id);
                    if (!activeNote) throw new Error('[no active note]');
                    if (activeNote.type !== 'text') throw new Error('[not text note]');
                    activeNote.setContent(content);
                    return true;
                },
                [acviteNote.noteId, text]
            );
        } catch (error) {
            this.throwServerError(COMMAND_TYPE.set, error.message);
        }
    }

    throwServerError(type, msg) {
        const normalizedMsg = msg.match(/\[(.*)\]/)[1];
        throwOpError(type, normalizedMsg);
    }

    async handleAppend(engine) {
        const text = this.threadToText(engine, COMMAND_TYPE.append);

        //todo: use frontedend api ，use editor instance. check  text/code
        const acviteNote = api.getActiveContextNote();

        try {
            await api.runOnBackend(
                async (id, content) => {
                    const activeNote = api.getNote(id);
                    if (!activeNote) throw new Error('[no active note]');
                    if (activeNote.type !== 'text') throw new Error('[not text note]');

                    const oldContent = activeNote.getContent();
                    activeNote.setContent(`${oldContent}${content}`);
                },
                [acviteNote.noteId, text]
            );
        } catch (error) {
            this.throwServerError(COMMAND_TYPE.append, error.message);
        }
    }

    async handleSaveChild(engine) {
        const text = this.threadToText(engine, COMMAND_TYPE.child);
        const acviteNote = api.getActiveContextNote();
        const firstMsg = engine.thread[0];
        try {
            await api.runOnBackend(
                async (id, title, content) => {
                    const activeNote = api.getNote(id);
                    if (!activeNote) throw new Error('[no active note]');

                    return api.createNewNote({
                        parentNoteId: id,
                        title,
                        content,
                        type: 'text',
                    }).note;
                },
                [acviteNote.noteId, firstMsg.content, text]
            );
        } catch (error) {
            this.throwServerError(COMMAND_TYPE.child, error.message);
        }
    }
    // << command

    // << options
    async goOptions() {
        const optionNote = await api.runOnBackend(
            async (label) => {
                return api.getNoteWithLabel(label);
            },
            [DATA_KEYS.CHAT_OPTIONS]
        );
        api.activateNote(optionNote.noteId);
    }
    // >> options
}
