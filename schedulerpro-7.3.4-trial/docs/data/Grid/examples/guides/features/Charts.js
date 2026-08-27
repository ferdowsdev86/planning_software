const grid = new Grid({
    appendTo : targetElement,

    // makes grid as high as it needs to be to fit rows
    autoHeight : true,

    features : {
        charts : true
    },

    data : DataGenerator.generateData(15),

    columns : [
        { field : 'name', text : 'Name', flex : 1 },
        { field : 'score', text : 'Score', flex : 1 },
        { type : 'number', field : 'age', text : 'Age', flex : 1 }
    ]
});

grid.selectAll();
