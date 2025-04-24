import { throttle, removeEle, closest, htmlStrToElement, showTooltip } from '@/utils';
import { marked } from 'marked';
import { EVENT_ENGINE, EVENT_VIEW, ROLE } from '@/constants';
import Popover from '../wrappers/Popover';

export default class EleThread {
    constructor(view) {
        this.chatView = view;
        this.$thread = view.$chatView.$qs('.thread');
        this.$threadMsgs = this.$thread.$qs('.thread-messages');

        this.isHovering = false;

        this.Popover = new Popover({
            contentSelector: '.msg-command',
            $edgeEle: this.$thread,
        });

        this.clickedMsg = '';

        this.wrapFunction();

        this.bindMsgEvents();

        this.bindThreadHover();
        this.bindPromptToggle();

        this.bindDotClick();
        this.bindThreadScroll();
    }

    wrapFunction() {
        this.scrollToBottom = throttle(this.scrollToBottom, 300);
    }

    bindMsgEvents() {
        const { chatEngine, eleInput } = this.chatView;

        // user message is in control. use view event to render html
        eleInput.on(EVENT_VIEW.send, (content) => {
            // console.error(content);

            this.appendElByMessage({ content, role: ROLE.user });
        });

        chatEngine.on(EVENT_ENGINE.load, (thread) => {
            this.renderThread(thread);
        });

        chatEngine.on(EVENT_ENGINE.create, (message) => {
            if (message.role !== ROLE.user) {
                this.appendElByMessage(message);
            }
        });

        chatEngine.on(EVENT_ENGINE.append, (message) => {
            this.replaceCurrentElContent(message);
        });
        chatEngine.on(EVENT_ENGINE.replace, (message) => {
            this.replaceCurrentElContent(message);
        });
    }

    bindThreadHover() {
        this.$thread.addEventListener('mouseenter', () => {
            this.isHovering = true;
        });
        this.$thread.addEventListener('mouseleave', () => {
            this.isHovering = false;
        });
    }

    bindPromptToggle() {
        this.chatView.elePrompt.on(EVENT_VIEW.promptToggle, (height) => {
            // hacky
            this.$thread.style.height = `calc(100% - ${247 + height}px)`;
        });
    }

    bindDotClick() {
        this.$threadMsgs.addEventListener('click', (e) => {
            const isDot = e.target.classList.contains('dot');

            if (isDot) {
                this.clickedMsg = e.target.previousSibling.textContent;

                this.showMsgCommand(e.target);
            }
        });
    }

    showMsgCommand($dot) {
        this.Popover = new Popover({
            placement: closest('.message', $dot).classList.contains('sent') ? 'left' : 'right',
            contentSelector: '.msg-command',
            $edgeEle: this.$thread,
            $triggerEle: $dot,
            offset: 0,
        });

        this.Popover.show();

        this.bindCommand();
    }

    bindCommand() {
        this.Popover.$content.addEventListener('click', async (e) => {
            const $command = e.target;
            const command = $command.getAttribute('command');

            const { chatData } = this.chatView;
            try {
                await chatData.handleMsgCommand(command, this.clickedMsg, this.chatView.chatEngine);
                showTooltip('success');
            } catch (error) {
                showTooltip(`${command}:${error.message}`, true);
            }
        });
    }

    bindThreadScroll() {
        let willHide = false;
        this.$threadMsgs.addEventListener('scroll', () => {
            if (this.Popover.isShow && willHide === false) {
                willHide = true;
                setTimeout(() => {
                    this.Popover.hide();
                    willHide = false;
                }, 100);
            }
        });
    }

    renderThread(thread) {
        this.$threadMsgs.innerHTML = '';
        thread.forEach((message) => {
            this.appendElByMessage(message);
        });
    }

    appendElByMessage(message) {
        if (message.role === ROLE.system) return;

        let renderedContent = message.content; // Initialize with original content
        let thinkContent = '';
        let displayThinkButton = false;

        const thinkMatch = renderedContent.match(/<think>(.*?)<\/think>/s); // Match against the initial content
        if (thinkMatch) {
            thinkContent = thinkMatch[1].trim();
            renderedContent = renderedContent.replace(/<think>(.*?)<\/think>/s, '').trim(); // Update renderedContent
            displayThinkButton = true;
        }

        // Only parse if not a user message starting with '<'
        if (!(message.role === ROLE.user && renderedContent.trim().startsWith('<'))) {
            renderedContent = marked.parse(renderedContent);
        }

        const thinkButtonHtml = displayThinkButton ? `<button class="think-toggle-button">Show Thinking</button>` : '';
        const thinkContentHtml = displayThinkButton ? `<div class="think-content" style="display: none;">${marked.parse(thinkContent)}</div>` : '';


        const skeleton = `<div class='message ${
            message.role === 'user' ? 'sent' : 'received'
        }'>${thinkButtonHtml}${thinkContentHtml}<div class='message-text'>${renderedContent}</div><button  class='bx bx-dots-vertical-rounded dot icon-action'></button></div>`;

        const msgDom = htmlStrToElement(skeleton);

        this.$threadMsgs.appendChild(msgDom);

        if (displayThinkButton) {
            const thinkButton = msgDom.$qs('.think-toggle-button');
            const thinkContentDiv = msgDom.$qs('.think-content');
            thinkButton.addEventListener('click', () => {
                const isHidden = thinkContentDiv.style.display === 'none';
                thinkContentDiv.style.display = isHidden ? 'block' : 'none';
                thinkButton.textContent = isHidden ? 'Hide Thinking' : 'Show Thinking';
            });
        }


        this.scrollToBottom();
        return msgDom;
    }

    scrollToBottom() {
        this.$threadMsgs.scrollTop = 10e10;
    }

    getCurrentMsgDom() {
        const { children } = this.$threadMsgs;
        return children[children.length - 1];
    }

    // if responsed with html tags, really hard to tell how to treat it: code or styles. so render as plain text
    replaceCurrentElContent(content) {
        const currentMsgDom = this.getCurrentMsgDom();
        let renderedContent = content.content; // Initialize with original content
        let thinkContent = '';
        let displayThinkButton = false;

        const thinkMatch = renderedContent.match(/<think>(.*?)<\/think>/s); // Match against the initial content
        if (thinkMatch) {
            thinkContent = thinkMatch[1].trim();
            renderedContent = renderedContent.replace(/<think>(.*?)<\/think>/s, '').trim(); // Update renderedContent
            displayThinkButton = true;
        }

        // Only parse if not a user message starting with '<'
        if (!(content.role === ROLE.user && renderedContent.trim().startsWith('<'))) {
             currentMsgDom.$qs('.message-text').innerHTML = marked.parse(renderedContent); // Update only the message-text content
        } else {
             currentMsgDom.$qs('.message-text').innerHTML = renderedContent; // Keep as is if user message starting with '<'
        }


        // Update or add the think button and content if they exist
        let thinkButton = currentMsgDom.$qs('.think-toggle-button');
        let thinkContentDiv = currentMsgDom.$qs('.think-content');

        if (displayThinkButton) {
            if (!thinkButton) {
                // Add button and content if they don't exist
                const thinkButtonHtml = `<button class="think-toggle-button">Show Thinking</button>`;
                const thinkContentHtml = `<div class="think-content" style="display: none;">${marked.parse(thinkContent)}</div>`;
                // Insert before the message-text div (which is currentMsgDom.children[0])
                currentMsgDom.children[0].insertAdjacentHTML('beforebegin', thinkButtonHtml + thinkContentHtml);

                thinkButton = currentMsgDom.$qs('.think-toggle-button');
                thinkContentDiv = currentMsgDom.$qs('.think-content');

                 thinkButton.addEventListener('click', () => {
                    const isHidden = thinkContentDiv.style.display === 'none';
                    thinkContentDiv.style.display = isHidden ? 'block' : 'none';
                    thinkButton.textContent = isHidden ? 'Hide Thinking' : 'Show Thinking';
                });

            } else {
                // Update content if they exist
                thinkContentDiv.innerHTML = marked.parse(thinkContent);
            }
        } else {
            // Remove button and content if they exist but shouldn't
            if (thinkButton) removeEle(thinkButton);
            if (thinkContentDiv) removeEle(thinkContentDiv);
        }


        if (!this.isHovering) {
            this.scrollToBottom();
        }
    }

    removeCurrentEl() {
        const currentMsgDom = this.getCurrentMsgDom();
        removeEle(currentMsgDom);
    }
}
