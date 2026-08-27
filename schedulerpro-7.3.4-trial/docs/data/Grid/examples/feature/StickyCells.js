const grid = new Grid({
    appendTo : targetElement,

    height    : 300,
    rowHeight : 200,

    features : {
        stickyCells : true
    },

    data : DataGenerator.generateData(10),

    columns : [
        { field : 'name', text : 'Name', flex : 1 },
        { field : 'city', text : 'City', flex : 1 },
        { field : 'food', text : 'Favorite food', flex : 1 }
    ]
});
