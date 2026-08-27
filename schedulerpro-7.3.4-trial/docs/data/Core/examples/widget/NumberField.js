new NumberField({
    appendTo      : targetElement,
    width         : 150,
    label         : 'Enter a number',
    rendition     : 'outlined',
    labelPosition : 'above'
});

new NumberField({
    appendTo      : targetElement,
    width         : 150,
    value         : 0.25,
    label         : 'Percentage',
    format        : '0%',
    style         : 'margin-right: .5em',
    labelPosition : 'above'
});

new NumberField({
    appendTo  : targetElement,
    clearable : true,
    width     : 150,
    label     : 'Currency, clearable',
    value     : 100,
    style     : 'margin-right: .5em',
    format    : {
        style    : 'currency',
        currency : 'USD'
    },
    labelPosition : 'above'
});

new NumberField({
    appendTo : targetElement,
    width    : 200,
    label    : 'With custom trigger',
    triggers : {
        plug : {
            cls     : 'fa fa-plug',
            tooltip : 'Do something special'
        }
    },
    style         : 'margin-right: .5em',
    labelPosition : 'above'
});
