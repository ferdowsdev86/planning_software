const grid = new Grid({
    appendTo : targetElement,

    // makes grid as high as it needs to be to fit rows
    autoHeight : true,

    features : {
        // group by food
        group : 'foods'
    },

    store : {
        fields : [
            'name',
            { name : 'foods', type : 'array' },
            'city'
        ]
    },

    data : [
        {
            id    : 1,
            name  : 'Bruce Wayne',
            foods : ['Pizza', 'Sushi', 'Burgers'],
            city  : 'Gotham'
        },
        {
            id    : 2,
            name  : 'Clark Kent',
            foods : ['Pizza', 'Burgers'],
            city  : 'Metropolis'
        },
        {
            id    : 3,
            name  : 'Barry Allen',
            foods : ['Pizza', 'Sushi'],
            city  : 'Central City'
        },
        {
            id    : 4,
            name  : 'Diana Prince',
            foods : ['Burgers', 'Sushi'],
            city  : 'Themyscira'
        }
    ],

    columns : [
        { field : 'name', text : 'Name', flex : 1 },
        {
            field    : 'foods',
            text     : 'Favorite foods',
            flex     : 1,
            renderer : ({ record, value }) => {
                if (record.isGroupHeader) {
                    return value;
                }
                return value.join(', ');
            }
        },
        { field : 'city', text : 'City', flex : 1 }
    ]
});
