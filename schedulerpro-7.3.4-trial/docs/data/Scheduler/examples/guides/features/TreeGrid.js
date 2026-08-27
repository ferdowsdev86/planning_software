const tree = new TreeGrid({
    appendTo : targetElement,

    autoHeight : true,

    data : [
        {
            name     : 'ABBA',
            iconCls  : 'fa fa-users',
            born     : '',
            children : [
                { name : 'Anni-Frid', born : 1945, iconCls : 'fa fa-user' },
                { name : 'Bjorn', born : 1945, iconCls : 'fa fa-user' },
                { name : 'Benny', born : 1946, iconCls : 'fa fa-user' },
                { name : 'Agnetha', born : 1950, iconCls : 'fa fa-user' }
            ]
        },
        {
            name     : 'Roxette',
            iconCls  : 'fa fa-users',
            born     : '',
            children : [
                { name : 'Per', born : 1959, iconCls : 'fa fa-user' },
                { name : 'Marie', born : 1958, iconCls : 'fa fa-user' }
            ]
        }
    ],

    columns : [
        { type : 'tree', field : 'name', text : 'Name', flex : 1 },
        { type : 'number', field : 'born', text : 'Born', flex : 1 }
    ]
});
