targetElement.innerHTML = '<p>Right-click and select <b>New Chart</b> to create a chart from current selection</p>';

// grid with basic configuration
const grid = new Grid({
    // makes grid as high as it needs to be to fit rows
    autoHeight : true,
    appendTo   : targetElement,
    features   : {
        charts : true
    },
    selectionMode : {
        cell       : true,
        dragSelect : true
    },
    data    : DataGenerator.generateData(10),
    columns : [
        { field : 'name', text : 'Name', flex : 1 },
        { field : 'age', text : 'Age', flex : 1 },
        { field : 'score', text : 'Score', flex : 1 },
        { field : 'rank', text : 'Rank', width : 180 }
    ]
});

grid.selectCellRange({ id : 1, column : grid.columns.first }, { id : 10, column : grid.columns.last });
