// Uneditable datefield (user only allowed to use picker)
new DateField({
    labelPosition : 'above',
    appendTo      : targetElement,
    label         : 'Not editable',
    editable      : false,
    style         : 'margin-right: .5em'
});

// Invalid datefield
new DateField({
    labelPosition : 'above',
    appendTo      : targetElement,
    label         : 'Invalid',
    min           : new Date(2018, 4, 18),
    value         : new Date(2018, 4, 17),
    editable      : true,
    style         : 'margin-right: .5em'
});

// DateField with step triggers
new DateField({
    labelPosition : 'above',
    appendTo      : targetElement,
    label         : 'Step triggers',
    step          : '1d',
    value         : new Date()
});
