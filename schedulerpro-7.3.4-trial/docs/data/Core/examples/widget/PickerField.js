const field = new PickerField({
    appendTo : targetElement,
    picker   : {
        type         : 'panel',
        scrollAction : 'realign',
        height       : '20em',
        width        : '20em',
        layout       : {
            type : 'vbox',
            gap  : 10
        },
        align : {
            align    : 't0-b0',
            axisLock : true
        },

        items : {
            high : {
                type      : 'button',
                text      : 'High',
                onClick   : 'up.onPickerClick',
                rendition : 'filled',
                color     : 'b-red'
            },
            medium : {
                type      : 'button',
                text      : 'Medium',
                onClick   : 'up.onPickerClick',
                rendition : 'filled',
                color     : 'b-blue'
            },
            low : {
                type      : 'button',
                text      : 'Low',
                onClick   : 'up.onPickerClick',
                rendition : 'filled',
                color     : 'b-gray'
            }
        },

        bbar : {
            items : {
                close : {
                    text    : 'Close',
                    onClick : 'up.onCloseClick'
                }
            }
        },

        html : '<strong> Select priority</strong>'
    },
    triggers : {
        expand : {
            cls     : 'fa fa-arrow-down',
            handler : 'onTriggerClick',
            weight  : 200
        }
    },

    onPickerClick({ selection, source }) {
        this.value = source.text;
        this.picker.hide();
    },

    onCloseClick() {
        this.hidePicker();
    }
});
