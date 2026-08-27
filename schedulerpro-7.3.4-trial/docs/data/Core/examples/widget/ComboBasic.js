// combo with string items
new Combo({
    labelPosition : 'above',
    items         : ['Fanta', 'Loranga', 'Jaffa', 'Zingo', 'Orangina'],
    label         : 'Items as strings',
    appendTo      : targetElement
});

// combo with object items
new Combo({
    labelPosition : 'above',
    items         : [{ value : 'pepsi', text : 'Pepsi' }, { value : 'coke', text : 'Coca Cola' }],
    label         : 'Items as objects',
    appendTo      : targetElement
});

// non-editable combo (user can only pick from list)
new Combo({
    labelPosition : 'above',
    items         : [{ value : 'MtnDew', text : 'Mountain Dew' }, 'Sprite', '7up'],
    label         : 'Not editable',
    editable      : false,
    appendTo      : targetElement
});

// editable combo (user can type to filter)
new Combo({
    labelPosition : 'above',
    items         : ['Captain America', 'Hulk', 'She-Hulk', 'Hawkeye'],
    label         : 'Editable',
    editable      : true,
    appendTo      : targetElement
});
