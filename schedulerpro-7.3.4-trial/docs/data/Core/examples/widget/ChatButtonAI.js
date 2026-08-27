targetElement.style.height = '40em';

const chatPanel = new ChatButton({
    appendTo  : targetElement,
    chatPanel : {
        type  : 'aichatpopup',
        width : '30em',
        title : `<strong style="font-weight: 500;font-size:1.1em">Bryntum AI Agent</strong>
                 <small style="display:block;color: hsl(207 90% 91% / 1);">ChatGPT-4-1</small>`,
        icon : {
            tag : 'img',
            src : '../docs/data/Core/images/bryntum-white.svg'
        },
        showTimestamp : true,
        scrollAction  : 'realign',
        closable      : true,
        messages      : [
            {
                fromOther : true,
                text      : `Hey there, how can I help you today?`
            }
        ],

        intro : {
            html : `<h4 style="margin:0">Try the Bryntum AI Panel</h4>`
        },

        tools : {
            close : {
                cls : 'b-fa b-fa-chevron-down'
            },
            settings : {
                cls : 'b-fa b-fa-ellipsis',
                onClick({ source }) {
                    if (!this.menu) {
                        this.menu = new Menu({
                            anchor : true,
                            owner  : this,
                            items  : [
                                {
                                    text : 'Voice',
                                    icon : 'b-fa b-fa-comment',
                                    menu : [
                                        { text : 'Juniper' },
                                        { text : 'Ember' },
                                        { text : 'Cove' },
                                        { text : 'TODO' }
                                    ]
                                },
                                {
                                    text : 'Language',
                                    icon : 'b-fa b-fa-language',
                                    menu : [
                                        { text : 'English' },
                                        { text : 'German' },
                                        { text : 'Swedish' }
                                    ]
                                },
                                {
                                    text    : 'Announce replies',
                                    checked : false,
                                    onItem  : 'up.onHelpMenuItem'
                                },
                                {
                                    text   : 'Clear chat',
                                    icon   : 'b-fa b-fa-trash',
                                    onItem : 'up.onClearChatClick'
                                },
                                {
                                    text      : 'Show sample prompts',
                                    icon      : 'b-fa b-fa-terminal',
                                    separator : true,
                                    onItem    : 'up.onShowSamplePromptsItem'
                                },
                                {
                                    text   : 'Help',
                                    icon   : 'b-fa b-fa-question',
                                    onItem : 'up.onHelpMenuItem'
                                }
                            ]
                        });
                    }
                    this.menu.showBy(source.element);
                }
            }
        }
    }
});
