new SlideToggle({
    insertFirst : targetElement,
    label       : 'Show close icon',
    checked     : true,
    onChange({ value }) {
        chipView.closable = value;
    }
});

// checkbox with default look
const chipView = new ChipView({
    appendTo : targetElement,
    style    : 'display:flex;gap:.5em',
    items    : [
        'Coke',
        'Pepsi',
        'Water',
        'Fanta',
        'Fernet'
    ]
});
