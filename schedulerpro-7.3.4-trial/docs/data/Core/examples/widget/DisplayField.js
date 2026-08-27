new DisplayField({
    appendTo      : targetElement,
    width         : 200,
    label         : 'Label text',
    value         : 'A static text',
    rendition     : 'outlined',
    labelPosition : 'above'
});

new DisplayField({
    appendTo      : targetElement,
    width         : 200,
    label         : 'Or use a template string',
    value         : 25,
    template      : age => `${age} years old`,
    rendition     : 'filled',
    labelPosition : 'above'
});
