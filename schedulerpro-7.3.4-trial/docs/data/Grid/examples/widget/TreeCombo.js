new TreeCombo({
    labelPosition : 'above',
    label         : 'Choose tasks with a TreeGrid picker',
    width         : '45em',
    appendTo      : targetElement,
    value         : [1],
    picker        : {
        columns : [
            { type : 'tree', text : 'Tasks', field : 'name', flex : 1 },
            { type : 'percent', text : '% Done', field : 'percentDone', width : 130 },
            { text : 'Priority', field : 'prio' }
        ]
    },
    chipView : {
        itemTpl(record) {
            return StringHelper.xss`${record.name}`;
        }
    },
    store : {
        fields : [
            'prio',
            'percentDone'
        ],
        data : [
            {
                id       : 1,
                name     : 'Development Tasks',
                expanded : true,
                children : [
                    { id : 11, name : 'Improve React docs', prio : 'High', percentDone : '75' },
                    { id : 12, name : 'Build Angular module', prio : 'Low', percentDone : '100' },
                    { id : 13, name : 'Create Vue project', prio : 'Low', percentDone : '50' }
                ]
            },
            {
                id   : 2,
                name : 'Customer meeting',
                prio : 'Normal'
            },
            {
                id       : 3,
                name     : 'Customer Tasks',
                expanded : true,
                children : [
                    { id : 14, name : 'Intro meeting', prio : 'Normal', percentDone : '75' },
                    { id : 15, name : 'Build POC', prio : 'High', percentDone : '50' },
                    { id : 16, name : 'Documentation', prio : 'Low', percentDone : '25' }
                ]
            }
        ]
    }
});
