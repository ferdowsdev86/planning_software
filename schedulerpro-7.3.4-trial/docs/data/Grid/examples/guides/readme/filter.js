targetElement.innerHTML = '<p>Click the filter icon on column headers to apply filters</p>';

const grid = new Grid({
    appendTo : targetElement,

    autoHeight : true,

    features : {
        filter : true
    },

    columns : [
        { field : 'name', text : 'Name', width : 200 },
        { field : 'age', text : 'Age', flex : 1 },
        { field : 'city', text : 'City', flex : 1 }
    ],

    store : {
        sorters : [
            { field : 'age', ascending : false } // descending
        ],
        data : [
            { id : 1, name : 'Spiderman', age : 18, city : 'New York' },
            { id : 2, name : 'Batman', age : 50, city : 'Gotham' },
            { id : 3, name : 'Superman', age : 45, city : 'Metropolis' },
            { id : 4, name : 'Wonder Woman', age : 35, city : 'Themyscira' },
            { id : 5, name : 'Iron Man', age : 36, city : 'Malibu' },
            { id : 6, name : 'Thor', age : 42, city : 'Asgard' },
            { id : 7, name : 'Black Widow', age : 41, city : 'Stalingrad' },
            { id : 8, name : 'The Flash', age : 26, city : 'Central City' },
            { id : 9, name : 'Black Panther', age : 36, city : 'Wakanda' }
        ]
    }
});
