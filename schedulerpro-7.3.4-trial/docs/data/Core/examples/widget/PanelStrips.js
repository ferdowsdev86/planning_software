//<code-header>
CSSHelper.insertRule('.strips-panel .b-sidebar .b-panel-body-wrap { background : var(--b-neutral-97)}', targetElement);
CSSHelper.insertRule('strong { font-weight : 600 !important; }', targetElement);
//</code-header>
// This example show the Panel widget using the strips feature.
const invoicePanel = new Panel({
    appendTo      : targetElement,
    cls           : 'strips-panel',
    title         : 'Application Form',
    width         : 700,
    height        : 270,
    labelPosition : 'align-before',
    items         : {
        name : {
            type  : 'textfield',
            label : 'Name',
            value : 'Johnny Coder'
        },
        skills : {
            type        : 'combo',
            label       : 'Skills',
            multiSelect : true,
            items       : ['Coding', 'UX', 'Design', 'Database'],
            value       : ['Coding', 'UX'],
            editable    : false
        },
        framework : {
            type    : 'radiogroup',
            label   : 'Favorite JS Framework',
            value   : 'D',
            inline  : true,
            options : {
                A : 'React',
                B : 'Angular',
                C : 'Vue',
                D : 'Svelte'
            }
        },
        jsOrTs : {
            type    : 'radiogroup',
            label   : 'JS or TS',
            hidden  : true,
            value   : 'B',
            name    : 'jsOrTs',
            inline  : true,
            options : {
                A : 'JS',
                B : 'TS'
            }
        },
        tabsOrSpaces : {
            type    : 'radiogroup',
            label   : 'Tabs or Spaces',
            hidden  : true,
            value   : 'A',
            name    : 'tabsOrSpaces',
            inline  : true,
            options : {
                A : 'Tabs',
                B : 'Spaces'
            }
        }
    },
    strips : {
        right : {
            type          : 'panel',
            dock          : 'right',
            collapsible   : true,
            width         : '15em',
            header        : false,
            cls           : 'b-sidebar',
            collapsed     : true,
            layout        : 'vbox',
            labelPosition : 'before',
            items         : {
                label : {
                    tag  : 'strong',
                    html : 'Settings'
                },
                toughQuestion : {
                    type     : 'slidetoggle',
                    label    : 'Show tough questions',
                    onChange : 'up.onShowToughQuestionsChange'
                }
            }
        }
    },
    tools : [
        {
            cls     : 'fa fa-bars',
            onClick : 'up.onToggleSettingsClick'
        }
    ],

    onToggleSettingsClick() {
        this.strips.right.toggleCollapsed();
    },

    onShowToughQuestionsChange({ value }) {
        this.widgetMap.jsOrTs.hidden = !value;
        this.widgetMap.tabsOrSpaces.hidden = !value;
    }
});
