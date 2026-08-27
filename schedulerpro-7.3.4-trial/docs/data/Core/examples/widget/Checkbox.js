new Checkbox({
    appendTo : targetElement,
    text     : 'Unchecked'
});

new Checkbox({
    appendTo : targetElement,
    checked  : true,
    text     : 'Checked'
});

new Checkbox({
    appendTo : targetElement,
    disabled : true,
    text     : 'Disabled & checked',
    checked  : true
});

new Checkbox({
    appendTo : targetElement,
    disabled : true,
    text     : 'Disabled'
});
