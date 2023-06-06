import { DEFAULT_OPTIONS, EVENT_DATA, STATUS_DATA, STATUS_MESSAGE, ROLE, COMMAND_TYPE } from '@/constants';
import { throwImplementationError, checkNewKey, mergeOption, copy, throwOpError, isMsgExpected } from '@/utils';
import LittleEvent from '../LittleEvent';

export default class Data extends LittleEvent {
    async initOptions() {
        const existedOption = await this.getOptions();
        if (!existedOption) return this.setDefaultOptions();

        const hasNewKey = checkNewKey(DEFAULT_OPTIONS, existedOption);
        if (!hasNewKey) return existedOption;

        const mixedOption = mergeOption(existedOption, DEFAULT_OPTIONS);
        return this.setOptions(mixedOption);
    }

    async initPrompts() {
        const existedPrompts = await this.getPrompts();
        if (!existedPrompts) return this.setDefaultPrompts();
    }

    async getOptions() {
        throwImplementationError();
    }

    async setOption(key, value) {
        this.emit(EVENT_DATA.setStatus, { status: STATUS_DATA.optionSyncing, key, value });

        const options = await this.getOptions();
        options[key] = value;
        await this.setOptions(options);

        this.emit(EVENT_DATA.setStatus, { status: STATUS_DATA.success, key, value });
    }

    async setOptions() {
        throwImplementationError();
    }

    async setDefaultOptions() {
        throwImplementationError();
    }

    async getOption(key) {
        const options = await this.getOptions();
        return options[key];
    }

    // >>prompt
    async getPrompts() {
        throwImplementationError();
    }

    async setPrompts() {
        throwImplementationError();
    }

    async setDefaultPrompts() {
        throwImplementationError();
    }

    async createPrompt(prompt) {
        const allPrompts = await this.getPrompts();
        const orderPrompt = {
            ...prompt,
            order: allPrompts.length,
        };

        allPrompts.push(orderPrompt);
        await this.setPrompts(allPrompts);
    }

    async updatePrompt(prompt, isDelete) {
        const allPrompts = await this.getPrompts();
        const index = allPrompts.findIndex((_prompt) => _prompt.id === prompt.id);
        if (index === -1) {
            throw new Error(`can't find target prompt`);
        }
        if (isDelete) {
            allPrompts.splice(index, 1);
        } else {
            allPrompts.splice(index, 1, prompt);
        }
        await this.setPrompts(allPrompts);
    }

    async deletePrompt(prompt) {
        await this.updatePrompt(prompt, true);
    }

    getAcitveNoteContent() {
        throwImplementationError();
    }

    // <<prompt

    // >> command
    async handleCommand(command, engine) {
        console.log(command, engine);
        const map = {
            copy: this.handleCopy.bind(this),
            favor: this.handleFavor.bind(this),
            unfavor: this.handleUnfavor.bind(this),
            set: this.handleSetNote.bind(this),
            append: this.handleAppend.bind(this),
            child: this.handleSaveChild.bind(this),
            history: this.handleSaveHistory.bind(this),
        };
        if (map[command]) {
            await map[command](engine);
        }
    }

    threadToText(engine, type, isCopy) {
        let text = engine.thread.map((v) => `<p>role: ${v.role}</p><p>${v.content}</p>`).join('');

        if (isCopy) {
            text = engine.thread.map((v) => `role: ${v.role}\n${v.content}`).join('\n');
        }

        if (!text) {
            throwOpError(type, 'no content');
        }
        return text;
    }

    handleCopy(engine) {
        const text = this.threadToText(engine, COMMAND_TYPE.copy, true);
        copy(text);
    }

    async handleFavor(engine) {
        await this.toggleFavor(engine, true);
    }

    async handleUnfavor(engine) {
        await this.toggleFavor(engine, false);
    }

    async toggleFavor(engine, favor) {
        const record = await this.getRecord(engine.threadId);
        if (!record) {
            throwOpError(favor ? COMMAND_TYPE.favor : COMMAND_TYPE.unfavor, 'no thread');
        }
        record.favor = favor;
        await this.saveRecord(record);
    }

    handleSetNote() {
        throwImplementationError();
    }

    handleAppend() {
        throwImplementationError();
    }

    handleSaveChild() {
        throwImplementationError();
    }

    async handleSaveHistory(engine) {
        await this.saveRecordFromEngine(engine);
    }
    // << command

    // >> history
    async getRecords() {
        throwImplementationError();
    }

    async saveRecord() {
        throwImplementationError();
    }

    async handleMsgStatus(status, engine) {
        if (!engine.thread.length) return;

        // should save on cancel?
        const statusPass = isMsgExpected(status);
        const rolePass = engine.lastMessage.role === ROLE.assistant;

        if (statusPass && rolePass) {
            this.saveRecordFromEngine(engine);
        }
    }

    async saveRecordFromEngine(engine) {
        const firstUserMsg = engine.thread.find((msg) => msg.role === ROLE.user);
        if (!firstUserMsg) {
            throwOpError(COMMAND_TYPE.history, 'no content');
        }

        const newRecord = {
            id: engine.threadId,
            originTitle: firstUserMsg.content,
            list: engine.thread.map((msg) => {
                const record = { ...msg };
                delete record.status;
                return record;
            }),
        };

        await this.saveRecord(newRecord);
    }
    // << history

    // << options
    async goOptions() {
        throwImplementationError();
    }
    // >> options
}
