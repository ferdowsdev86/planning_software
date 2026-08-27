targetElement.innerHTML = '<p>Tree feature requires a store with <code>{ tree: true }</code> and a TreeColumn among columns</p>';

const grid = new Grid({
    appendTo : targetElement,

    height : 500,

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
                children : [
                    { id : 11, name : 'Anni-Frid', iconCls : 'fa fa-user' },
                    { id : 12, name : 'Bjorn', iconCls : 'fa fa-user' },
                    { id : 13, name : 'Benny', iconCls : 'fa fa-user' },
                    { id : 14, name : 'Agnetha', iconCls : 'fa fa-user' }
                ]
            },
            {
                id       : 2,
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
