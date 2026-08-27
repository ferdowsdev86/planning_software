// grid with TreeColumn
const grid = new Grid({
    appendTo : targetElement,

    // makes grid as high as it needs to be to fit rows
    autoHeight : true,

    features : {
        tree : true
    },

    store : {
        tree : true,
        data : [
            {
                id       : 1,
                name     : 'ABBA',
                iconCls  : 'fa fa-users',
                expanded : true,
                children : [
                    { id : 11, name : 'Anni-Frid', iconCls : 'fa fa-user' },
                    { id : 12, name : 'Bjorn', iconCls : 'fa fa-user' },
                    { id : 13, name : 'Benny', iconCls : 'fa fa-user' },
                    { id : 14, name : 'Agnetha', iconCls : 'fa fa-user' }
                ]
            },
            {
                id       : 2,
                expanded : true,
                name     : 'Roxette',
                iconCls  : 'fa fa-users',
                children : [
                    { id : 21, name : 'Per', iconCls : 'fa fa-user' },
                    { id : 22, name : 'Marie', iconCls : 'fa fa-user' }
                ]
            }
        ]
    },

    columns : [
        { type : 'tree', field : 'name', text : 'Name', flex : 1 }
    ]
});
