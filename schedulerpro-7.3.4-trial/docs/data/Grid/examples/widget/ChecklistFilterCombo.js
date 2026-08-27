new ChecklistFilterCombo({
    width        : '25em',
    appendTo     : targetElement,
    displayField : 'city',
    valueField   : 'city',
    value        : ['Paris'],
    store        : {
        fields : [
            'city'
        ],
        data : [
            { city : 'Stockholm' },
            { city : 'Barcelona' },
            { city : 'Paris' },
            { city : 'Dubai' },
            { city : 'New York' },
            { city : 'San Francisco' },
            { city : 'Washington' },
            { city : 'Montreal' }
        ]
    }
});
