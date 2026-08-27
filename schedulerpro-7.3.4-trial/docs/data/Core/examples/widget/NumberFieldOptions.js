new NumberField({
    appendTo : targetElement,
    label    : 'Enter a number',
    style    : 'margin-right: .5em'
});

new NumberField({
    appendTo  : targetElement,
    clearable : true,
    label     : 'Clearable',
    value     : 100,
    style     : 'margin-right: .5em'
});

new NumberField({
    appendTo : targetElement,
    label    : 'With custom trigger',
    triggers : {
        plug : {
            cls     : 'fa fa-plug',
            tooltip : 'Do something special'
        }
    },
    style : 'margin-right: .5em'
});
