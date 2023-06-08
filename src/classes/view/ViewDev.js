import { ROLE, isDev } from '@/constants';
import View from './View';

export default class ViewDev extends View {
    initSkeleton() {
        this.$chatView = document.$qs('.chat-wrapper');
        this.$chatView.style.display = 'flex';
    }

    appendEleToHost() {
        this.appendToggleBtn();
        if (isDev) {
            this.appendCreateMsgBtn();
        }
    }

    appendToggleBtn() {
        const eleOperation = document.$qs('.operation');

        const eleToggle = document.createElement('button');

        eleToggle.textContent = 'toggle';

        eleToggle.addEventListener('click', () => {
            this.toggleView();
        });

        eleOperation.appendChild(eleToggle);
    }

    appendCreateMsgBtn() {
        const eleOperation = document.$qs('.operation');

        const eleCreateMsg = document.createElement('button');
        eleCreateMsg.textContent = 'createMsg';

        eleCreateMsg.addEventListener('click', () => {
            const testMsgs = [
                { role: ROLE.user, content: 'this is a test message' },
                { role: ROLE.assistant, content: 'true' },
                { role: ROLE.user, content: 'can you tell me a story?' },
                {
                    role: ROLE.assistant,
                    //                     content: `Sure, I'd love to tell you a story. Here's one I know:

                    // Once upon a time, in a far-off land, there was a poor farmer named Jack. Jack had a small piece of land and a few animals, but he struggled to make ends meet. One day, while plowing his field, Jack found a shiny golden egg. He couldn't believe his luck!

                    // Jack took the egg to the market and sold it for a good price. The next day, he found another golden egg. And the day after that, and the day after that. Every day, Jack found a new golden egg, and he became very rich.

                    // But Jack grew greedy. He thought to himself, "If I could get all the eggs at once, I'd be the richest man in the world!" So he killed the goose that laid the golden eggs, hoping to find all the eggs inside.

                    // But when he opened the goose, there were no eggs. Jack had killed the goose that had given him so much wealth and happiness.

                    // The moral of the story is: greed can lead to loss. It's important to be grateful for what we have and not to take it for granted.`,
                    content: `"<p><a class="reference-link" href="#root/GpeobkXSGVI3/4RzxyjqHRLKT/Pnt5tLZUsC19/ktRUJR45zPb3" data-note-path="root/GpeobkXSGVI3/4RzxyjqHRLKT/Pnt5tLZUsC19/ktRUJR45zPb3">定义笔记关系</a></p><p>&nbsp;</p><p>关闭客户端到时候如果发现还有没更新的，应该可以等待更新了再关吧</p><p><a href="https://github.com/zadam/trilium/wiki/Backup">https://github.com/zadam/trilium/wiki/Backup</a>&nbsp;</p><blockquote><p>If you have configured sync then you need to do it across all members of the sync cluster, otherwise older version (restored backup) of the document will be detected and synced to the newer version</p></blockquote><p>根据这个版本备份策略，如果还原版本，则会把自己的自己的老本同步到新版本里面去。就是说如果本地是老版本，server是新版本，同步的时候可能用本地的覆盖了远程的。</p><p>如果折腾更新版本，一定要注意。</p><p>但这种版本冲突的情况，版本会在note revisions里面有所保留。可以先查看recent changes然后再到对应的文档里面去更新就好。这里需要找到是更新了内容的文档，如果是新增文档，没有冲突，则不会覆盖。</p><p>&nbsp;</p><p>&nbsp;</p><p>tray 是什么？ 是electron的，用来 在windows里面创建任务栏下面图标的。</p><p>&nbsp;</p><section class="include-note" data-note-id="RNtnOxLQLSQk" data-box-size="medium">&nbsp;</section><p>&nbsp;</p>"`,
                },
            ];

            testMsgs.forEach((msg) => {
                this.eleThread.appendElByMessage(msg);
            });
        });

        eleOperation.appendChild(eleCreateMsg);
    }

    bindShortcut() {
        window.addEventListener(
            'keydown',
            (e) => {
                if (e.altKey && e.key === 'q') {
                    this.toggleView();
                    return;
                }

                if (e.key === 'Escape') {
                    console.log(e);
                    if (this.isViewShow()) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.hideView();
                    }
                }
            },
            true
        );
    }
}
