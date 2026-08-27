let voices;

const chatPanel = new ChatPanel({
    appendTo      : targetElement,
    title         : 'Acme Sales Support',
    height        : '30em',
    showTimestamp : true,
    style         : 'margin-inline:auto;margin-block:5em',
    hidden        : false,
    floating      : false, // force panel to stay in the normal DOM flow
    messages      : [
        {
            fromOther : true,
            text      : `Hello, I am a fake chat agent in a docs app. I don't know anything but feel 
        free to ask me anything.`
        }
    ],
    bubbleTools : {
        readMessage : {
            class   : 'fa fa-volume-high',
            tooltip : 'Read message'
        }
    },

    intro : {
        html : `<h4 style="margin:0">We typically reply in a few minutes</h4>
            <br>You can contact our support team if you've checked our docs and still need help.`
    },
    // Avatar image url
    avatar : './data/Core/images/lisa.png',

    items : {
        messageField : {
            placeholder : 'Ask me anything'
        }
    },
    tools : {
        settings : {
            cls : 'b-fa b-fa-ellipsis',
            onClick({ source }) {
                if (!this.menu) {
                    this.menu = new Menu({
                        anchor : true,
                        owner  : this,
                        items  : [
                            {
                                text   : 'Clear chat',
                                onItem : 'up.onClearChatClick'
                            }
                        ]
                    });
                }
                this.menu.showBy(source.element);
            }
        }
    },

    onClearChatClick() {
        this.messages = [];
    },

    onBubbleToolClick({ tool, message }) {
        if (tool === 'readMessage') {
            const
                voices = window.speechSynthesis.getVoices(),
                utterance = new SpeechSynthesisUtterance(message.text);

            utterance.voice = voices.find(voice => voice.name.includes('Female') || voice.gender === 'female') || voices[0];

            globalThis.speechSynthesis.speak(utterance);
        }
    },

    onLocalMessage({ text }) {
        // Fake a response
        setTimeout(() => {
            this.addMessage({
                fromOther : true,
                text      : 'Sorry, no clue about that. Try hooking me up to an AI agent instead?'
            });
        }, 1500);
    }
});

window.speechSynthesis.onvoiceschanged = function() {
    voices = window.speechSynthesis.getVoices();
};

chatPanel.widgetMap.messageField.focus();

const settingsPanel = new Panel({
    appendTo        : targetElement,
    width           : '20em',
    height          : '100%',
    title           : 'Settings',
    labelPosition   : 'align-before',
    cls             : 'b-fiddle-settings',
    inputFieldAlign : 'end',    // align toggles to the right
    items           : [
        {
            type    : 'slidetoggle',
            label   : 'Show avatar',
            checked : true,
            onChange({ value }) {
                chatPanel.avatar = value ? chatPanel.initialConfig.avatar : null;
            }
        },
        {
            type    : 'slidetoggle',
            label   : 'Show intro text',
            checked : true,
            onChange({ value }) {
                chatPanel.intro = value ?  chatPanel.initialConfig.intro : null;
            }
        },
        {
            type    : 'slidetoggle',
            label   : 'Show timestamps',
            checked : true,
            onChange({ value }) {
                chatPanel.showTimestamp = value;
            }
        },
        {
            type    : 'slidetoggle',
            label   : 'Show bubble tools',
            checked : true,
            onChange({ value }) {
                chatPanel.bubbleTools = value ? {
                    readMessage : {
                        class   : 'fa fa-volume-high',
                        tooltip : 'Read message'
                    }
                } : null;
            }
        }
    ]
});
