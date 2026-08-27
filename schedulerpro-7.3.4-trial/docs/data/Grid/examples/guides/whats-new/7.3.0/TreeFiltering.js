const grid = new TreeGrid({
    appendTo : targetElement,

    height : 500,

    features : {
        filterBar : true
    },

    columns : [
        { type : 'tree', field : 'name', text : 'Name', flex : 2 },
        { field : 'role', text : 'Role', flex : 1 }
    ],

    store : {
        data : [
            {
                id       : 1,
                name     : 'Rock',
                expanded : true,
                children : [
                    {
                        id       : 11,
                        name     : 'ABBA',
                        expanded : true,
                        children : [
                            { id : 111, name : 'Anni-Frid', role : 'Vocals' },
                            { id : 112, name : 'Bjorn', role : 'Guitar' },
                            { id : 113, name : 'Benny', role : 'Keyboard' },
                            { id : 114, name : 'Agnetha', role : 'Vocals' }
                        ]
                    },
                    {
                        id       : 12,
                        name     : 'Roxette',
                        expanded : true,
                        children : [
                            { id : 121, name : 'Per', role : 'Guitar' },
                            { id : 122, name : 'Marie', role : 'Vocals' }
                        ]
                    }
                ]
            },
            {
                id       : 2,
                name     : 'Pop',
                expanded : true,
                children : [
                    {
                        id       : 21,
                        name     : 'Ace of Base',
                        expanded : true,
                        children : [
                            { id : 211, name : 'Jenny', role : 'Vocals' },
                            { id : 212, name : 'Malin', role : 'Vocals' },
                            { id : 213, name : 'Jonas', role : 'Keyboard' },
                            { id : 214, name : 'Ulf', role : 'Producer' }
                        ]
                    }
                ]
            }
        ]
    },

    tbar : {
        items : [
            {
                type    : 'slidetoggle',
                text    : 'Includes children',
                tooltip : 'A matching parent includes all its descendants',
                onChange({ checked }) {
                    grid.store.filterIncludesChildren = checked;
                }
            },
            {
                type    : 'slidetoggle',
                text    : 'Excludes children',
                tooltip : 'A non-matching parent excludes all its descendants',
                onChange({ checked }) {
                    grid.store.filterExcludesChildren = checked;
                }
            },
            {
                type    : 'slidetoggle',
                text    : 'Excludes parents',
                tooltip : 'Non-matching ancestors are dropped, matching descendants are lifted up',
                onChange({ checked }) {
                    grid.store.filterExcludesParents = checked;
                }
            }
        ]
    }
});
