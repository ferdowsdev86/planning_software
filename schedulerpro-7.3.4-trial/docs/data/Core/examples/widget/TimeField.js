new TimeField({
    labelPosition : 'above',
    label         : 'Not editable',
    editable      : false,
    style         : 'margin-right: .5em',
    appendTo      : targetElement
});

new TimeField({
    labelPosition : 'above',
    label         : 'Editable',
    editable      : true,
    appendTo      : targetElement,
    value         : new Date(2024, 0, 1),
    step          : '5 minutes'
});
