import LittleEvent from '@/classes/LittleEvent';
import { removeEle, timeAgo, closest } from '@/utils';
import { EVENT_VIEW, ROLE } from '@/constants';
import Modal from '../wrappers/Modal';

export default class EleHistory extends LittleEvent {
    constructor(view) {
        super();
        this.view = view;

        this.$content = view.$chatView.$qs('.content_select_history');
        this.Modal = new Modal({ type: 'popup', $content: this.$content, $chatView: view.$chatView });

        this.$showBtn = view.$chatView.$qs('.operate_btn_history');

        this.$num = this.$content.$qs('.select_num');
        this.$closeBtn = this.$content.$qs('.select_close');
        this.$search = this.$content.$qs('.select_search_input');

        this.$list = this.$content.$qs('.select_list');
        this.$recordTpl = removeEle(this.$content.$qs('.select_item'));

        this.records = [];
        this.bindEvents();

        view.on(EVENT_VIEW.viewHide, () => {
            this.hide();
        });
    }

    hide() {
        this.Modal.hide();
    }

    bindEvents() {
        this.$showBtn.addEventListener('click', async (e) => {
            this.Modal.show(e);
            this.loadHistory();
        });
        this.$closeBtn.addEventListener('click', () => {
            this.hide();
        });
        this.$search.addEventListener('input', (e) => {
            this.renderSearch(e.target.value);
        });
        this.$list.addEventListener('click', (e) => {
            const $record = closest('[data-id]', e.target);
            if ($record) {
                const target = this.records.find((record) => record.id === $record.dataset.id);

                this.Modal.hide();

                this.view.chatEngine.loadThread(target);
            }
        });
    }

    async loadHistory() {
        const records = await this.view.chatData.getRecords();

        this.records = Object.keys(records).map((id) => {
            const record = records[id];
            return {
                id,
                ...record,
            };
        });

        const favored = this.records.filter((record) => record.favor).sort(this.sortByStamp);
        const unfavored = this.records.filter((record) => !record.favor).sort(this.sortByStamp);
        const sorted = [...favored, ...unfavored];

        this.renderCount(this.records.length);
        this.renderList(sorted);
    }

    sortByStamp(a, b) {
        const aLast = a.list[a.list.length - 1];
        const bLast = b.list[b.list.length - 1];

        return bLast.stamp - aLast.stamp;
    }

    renderCount(num) {
        this.$num.textContent = num;
    }

    renderList(list) {
        this.$list.innerHTML = '';

        const fragment = document.createDocumentFragment();

        list.forEach((record) => {
            const firstRes = record.list.find((msg) => msg.role === ROLE.assistant);
            const lastRes = record.list[record.list.length - 1];

            const $record = this.$recordTpl.cloneNode(true);

            if (record.favor) {
                const $fovar = document.createElement('div');
                $fovar.classList.add('favor');
                $record.appendChild($fovar);
            }

            $record.setAttribute('data-id', record.id);

            $record.$qs('.item_title').textContent = record.title || record.originTitle;
            $record.$qs('.item_stamp').textContent = timeAgo(lastRes.stamp);

            const $preview = $record.$qs('.item_preview');
            $preview.setAttribute('title', firstRes.content);
            $preview.textContent = firstRes.content;

            fragment.appendChild($record);
        });

        this.$list.appendChild(fragment);
    }

    renderSearch(keyword) {
        const filterList = this.records.filter((record) => record.list.some((msg) => msg.content.includes(keyword)));
        this.renderList(filterList);
    }
}
