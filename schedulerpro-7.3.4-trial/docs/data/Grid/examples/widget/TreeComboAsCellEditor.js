class User extends Model {
    static fields = [
        { name : 'id', type : 'int' },
        { name : 'name', type : 'string' },
        { name : 'email', type : 'string' },
        { name : 'phone', type : 'string' },
        { name : 'orgUnit', type : 'int' }
    ];
}

const grid = new Grid({
    appendTo : targetElement,
    height   : 300,
    store    : {
        modelClass : User,
        data       : [
            {
                id      : 1,
                name    : 'Alice Johnson',
                email   : 'alice.johnson@example.com',
                phone   : '555-123-2414',
                orgUnit : 11
            },
            {
                id      : 2,
                name    : 'Bob Smith',
                email   : 'bob.smith@example.org',
                phone   : '555-567-2158',
                orgUnit : 12
            },
            {
                id      : 3,
                name    : 'Charlie Brown',
                email   : 'charlie.brown@example.net',
                phone   : '555-901-1252',
                orgUnit : 11
            },
            {
                id      : 4,
                name    : 'Diana Miller',
                email   : 'diana.miller@example.com',
                phone   : '555-345-1216',
                orgUnit : 22
            },
            {
                id      : 5,
                name    : 'Ethan Davis',
                email   : 'ethan.davis@example.org',
                phone   : '555-789-2020',
                orgUnit : 21
            }
        ]
    },
    columns : [
        { text : 'Name', field : 'name', flex : 1 },
        { text : 'Email', field : 'email', flex : 1, editor : { inputType : 'email' } },
        { text : 'Phone', field : 'phone', flex : 1, editor : { inputType : 'tel', inputAttributes : { pattern : '[0-9]{3}-[0-9]{3}-[0-9]{4}' } } },
        {
            id       : 'orgUnit',
            text     : 'Org Unit',
            field    : 'orgUnit',
            flex     : 1,
            renderer : ({ value, column }) => column.editor.store.getById(value)?.name,
            editor   : {
                type   : 'treecombo',
                picker : {
                    // Define the columns to show in the grid
                    columns : [
                        { type : 'tree', text : 'Org unit', field : 'name', flex : 1 }
                    ]
                },
                items : [
                    {
                        id       : 1,
                        name     : 'Electronics',
                        expanded : true,
                        children : [
                            { id : 11, name : 'Mobile Phones' },
                            { id : 12, name : 'Laptops' }
                        ]
                    },
                    {
                        id       : 2,
                        name     : 'Home Appliances',
                        expanded : true,
                        children : [
                            { id : 21, name : 'Refrigerators' },
                            { id : 22, name : 'Washing Machines' }
                        ]
                    }
                ],
                multiSelect  : false,
                displayField : 'name',
                valueField   : 'id',
                editable     : true
            }
        }
    ]
});

grid.startEditing({ id : 1, columnId : 'orgUnit' });
