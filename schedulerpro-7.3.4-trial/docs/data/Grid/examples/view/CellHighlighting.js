const grid = new Grid({
    appendTo   : targetElement,
    autoHeight : true,
    data       : DataGenerator.generateData(5),
    columns    : [
        { field : 'name', text : 'Name', flex : 1 },
        { field : 'city', text : 'City', width : 150 },
        { type : 'number', field : 'age', text : 'Age', width : 100 },
        { field : 'food', text : 'Food', width : 150 }
    ],
    tbar : [
        {
            text      : 'Highlight',
            rendition : 'outlined',
            onClick   : ({ source }) => {
                source.up('grid').highlightCells({
                    cells : [
                        { id : 1, field : 'city' },
                        { id : 5, field : 'food' }
                    ]
                });
            } },
        {
            text      : 'Highlight (color)',
            rendition : 'outlined',
            onClick   : ({ source }) => {
                source.up('grid').highlightCells({
                    cells : [
                        { id : 2, field : 'city' },
                        { id : 3, field : 'city' },
                        { id : 4, field : 'city' }
                    ],
                    mode : 'color' });
            } },
        {
            text      : 'Highlight (for 2s)',
            rendition : 'outlined',
            onClick   : ({ source }) => {
                source.up('grid').highlightCells({
                    cells : [
                        { id : 2, field : 'name' },
                        { id : 2, field : 'city' },
                        { id : 2, field : 'age' },
                        { id : 2, field : 'food' }
                    ],
                    unhighlightAfter : 2000
                });
            } }
    ]
});
