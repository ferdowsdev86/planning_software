const grid = new Grid({
    height        : 300,
    appendTo      : targetElement,
    selectionMode : {
        row          : true,
        checkbox     : { region : 'locked' },
        showCheckAll : true
    },
    columns : [
        { text : 'Id', field : 'id' },
        { text : 'First name', field : 'firstName', width : 150 },
        { text : 'Surname', field : 'surName', width : 150 }
    ],

    data : DataGenerator.generateData(10)
});

grid.selectedRecords = [1, 2, 3];
