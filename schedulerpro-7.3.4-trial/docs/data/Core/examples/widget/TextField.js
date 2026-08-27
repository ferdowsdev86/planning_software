// <code-header>
targetElement.toolbarItems = [
    {
        type : 'label',
        text : 'Label position'
    },
    {
        type        : 'buttongroup',
        toggleGroup : true,
        rendition   : 'tonal',
        items       : {
            before : {
                text    : 'Before',
                setting : 'before'
            },
            above : {
                text    : 'Above',
                pressed : true,
                setting : 'above'
            },
            default : {
                text    : 'Default',
                setting : null
            }
        },
        onToggle({ source }) {
            if (source.pressed) {
                for (const textField of source.up('fiddlepanel').widgets) {
                    textField.labelPosition = source.setting;
                }
            }
        }
    }
];
// </code-header>

const outlinedField = new TextField({
    appendTo      : targetElement,
    width         : '70%',
    label         : 'Outlined',
    labelPosition : 'above',
    labelWidth    : '5em',
    style         : 'margin-bottom :1em'
});

const filledField = new TextField({
    appendTo      : targetElement,
    width         : '70%',
    label         : 'Filled',
    rendition     : 'filled',
    labelPosition : 'above',
    labelWidth    : '5em'
});

// <code-footer>
targetElement.widgets = [outlinedField, filledField];
// </code-footer>
