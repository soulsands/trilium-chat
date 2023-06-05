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
                    content: `Sure, I'd love to tell you a story. Here's one I know:

                Once upon a time, in a far-off land, there was a poor farmer named Jack. Jack had a small piece of land and a few animals, but he struggled to make ends meet. One day, while plowing his field, Jack found a shiny golden egg. He couldn't believe his luck!
                
                Jack took the egg to the market and sold it for a good price. The next day, he found another golden egg. And the day after that, and the day after that. Every day, Jack found a new golden egg, and he became very rich.
                
                But Jack grew greedy. He thought to himself, "If I could get all the eggs at once, I'd be the richest man in the world!" So he killed the goose that laid the golden eggs, hoping to find all the eggs inside.
                
                But when he opened the goose, there were no eggs. Jack had killed the goose that had given him so much wealth and happiness.
                
                The moral of the story is: greed can lead to loss. It's important to be grateful for what we have and not to take it for granted.`,
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
