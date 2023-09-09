import { DEFAULT_OPTIONS, DATA_KEYS, DEFAULT_PROMPTS, EVENT_DATA, STATUS_DATA, SUPPORT_TYPE } from '@/constants';
import { throwError, threadToText, escape, contentToHtml } from '@/utils';

import Data from './Data';

const supportedType = ['text', 'code'];
function getSupportedActiveNoteOrThrow() {
    const activeNote = api.getActiveContextNote();
    if (!activeNote) throwError('no active note');
    if (!supportedType.includes(activeNote.type)) {
        throwError(SUPPORT_TYPE);
    }
    return activeNote;
}

function getModalFragment(content, isThread, editor) {
    if (isThread) {
        content = threadToText(content, true);
    } else {
        content = contentToHtml(content);
    }

    // https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_model-Model.html#function-insertContent
    // https://stackoverflow.com/questions/61728192/replace-ckeditor-content-and-add-undo-history-entry
    const viewFragment = editor.data.processor.toView(content);
    const modelFragment = editor.data.toModel(viewFragment);

    return modelFragment;
}

async function getActiveEditor(content) {
    const isThread = Array.isArray(content);

    const activeNote = getSupportedActiveNoteOrThrow();

    await glob.appContext.initialized;
    const noteCtx = glob.appContext.tabManager.children.find((ctx) => ctx.noteId === activeNote.noteId);
    if (await noteCtx.isReadOnly()) {
        throwError('note is readOnly');
    }

    let editor;
    if (activeNote.type === 'text') {
        editor = await api.getActiveContextTextEditor();

        return {
            insert() {
                editor.model.change((writer) => {
                    const insertPosition = editor.model.document.selection.getLastPosition();
                    writer.insertText(content, insertPosition);
                });
            },
            set() {
                const range = editor.model.createRangeIn(editor.model.document.getRoot());
                editor.model.insertContent(getModalFragment(content, isThread, editor), range);
            },
            append() {
                editor.model.change((writer) => {
                    writer.append(getModalFragment(content, isThread, editor), editor.model.document.getRoot());
                });
            },
        };
    }
    if (activeNote.type === 'code') {
        editor = await api.getActiveContextCodeEditor();
        const doc = editor.getDoc();

        return {
            insert() {
                const cursor = doc.getCursor();

                doc.replaceRange(content, cursor);
            },
            set() {
                if (isThread) {
                    content = threadToText(content);
                }

                doc.setValue(content);
            },
            append() {
                editor.replaceRange(content, { line: Infinity });
            },
        };
    }
}

async function parseTextNote(content) {
    const includeReg = /<section\s+class="include-note"\s+data-note-id="([\w-]+)"[^>]+>.*<\/section>/gi;
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = includeReg.exec(content)) !== null) {
        const noteId = match[1];
        // console.error(match);

        // eslint-disable-next-line no-await-in-loop
        const { title } = await api.getNote(noteId);
        content = content.replace(
            match[0],
            `<a class="reference-link" data-note-path="${noteId}"<span class="bx bx-note"></span>${title}</a>`
        );
    }
    // console.error(content);
    return content;
}

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
        const isExisted = await api.runOnBackend(
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

                return existedNote;
            },
            [DATA_KEYS.CHAT_OPTIONS, value]
        );

        if (!isExisted) {
            this.goOptions();
        }

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
     *
     * provide two kinds of messages. engine for chatgpt, view for innerHtml
     * @returns {Promise}
     */
    async getActiveNoteContent() {
        try {
            const activeNote = getSupportedActiveNoteOrThrow();
            const { content } = await activeNote.getNoteComplement();

            return {
                engine: content,
                view: activeNote.type === 'text' ? await parseTextNote(content) : escape(content),
            };
        } catch (error) {
            this.emit(EVENT_DATA.setStatus, {
                status: STATUS_DATA.failed,
                key: 'activeNote',
                value: error.message,
            });
            throwError(error.message);
        }
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

    async goHistorys() {
        const note = await api.runOnBackend(
            async (label) => api.getNoteWithLabel(label) || api.currentNote,
            [DATA_KEYS.HISTORY_HOME_LABEL]
        );
        api.activateNote(note.noteId);
    }

    async goHistory(hid) {
        const note = await api.runOnBackend(
            async (label, id) => api.getNoteWithLabel(label, id),
            [DATA_KEYS.HISTORY_LABEL, hid]
        );
        api.activateNote(note.noteId);
    }
    // <<history

    // >> command
    async setNoteWith(text) {
        (await getActiveEditor(text)).set();
    }

    async appendToNote(text) {
        (await getActiveEditor(text)).append();
    }

    async saveToChild(_title, _content) {
        const activeNote = api.getActiveContextNote();
        await api.runOnBackend(
            async (id, title, content) =>
                api.createNewNote({
                    parentNoteId: id,
                    title,
                    content,
                    type: 'text',
                }).note,
            [activeNote.noteId, _title, _content]
        );
    }

    async insertContent(text) {
        (await getActiveEditor(text)).insert();
    }
    // << command

    // << options
    async goOptions() {
        const optionNote = await api.runOnBackend(
            async (label) => api.getNoteWithLabel(label),
            [DATA_KEYS.CHAT_OPTIONS]
        );
        api.activateNote(optionNote.noteId);
    }
    // >> options
}
