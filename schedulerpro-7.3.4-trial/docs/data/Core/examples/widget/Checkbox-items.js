new Checkbox({
    appendTo     : targetElement,
    text         : 'Single item',
    autoCollapse : true,
    checked      : true,
    container    : [{
        type        : 'textfield',
        placeholder : 'Additional info...',
        flex        : 1
    }]
});

new Checkbox({
    appendTo     : targetElement,
    text         : 'Two items',
    autoCollapse : true,
    inline       : true,  // can also use false to wrap a single item
    container    : {
        from : {
            type        : 'textfield',
            placeholder : 'From...',
            flex        : 1
        },
        to : {
            type        : 'textfield',
            placeholder : 'To...',
            flex        : 1,
            style       : 'margin-inline-start: 1em'
        }
    }
});

new Checkbox({
    appendTo     : targetElement,
    text         : 'Child form',
    autoCollapse : true,
    checked      : true,
    container    : {
        from : {
            labelPosition : 'above',
            type          : 'textfield',
            label         : 'From',
            width         : 'auto'
        },
        to : {
            labelPosition : 'above',
            type          : 'textfield',
            label         : 'To',
            width         : 'auto'
        }
    }
});
