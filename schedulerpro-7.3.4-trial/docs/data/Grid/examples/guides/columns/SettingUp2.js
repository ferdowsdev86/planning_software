const grid = new Grid({
    appendTo : targetElement,

    autoHeight : true,

    data : DataGenerator.generateData(2),

    columns : [
        { type : 'rownumber' },
        { type : 'check', text : 'Check', field : 'done', width : 80 },
        { type : 'date', text : 'Date', field : 'start', flex : 1 },
        { type : 'number', text : 'Number', field : 'rank', flex : 1 },
        { type : 'percent', text : 'Percent', field : 'percent', flex : 1 },
        { type : 'rating', text : 'Rating', field : 'rating', flex : 1 },
        { type : 'template', text : 'Template', field : 'city', flex : 1, template : ({ value }) => `Lives in ${value}` },
        { type : 'widget', text : 'Widget', field : 'color', flex : 1, widgets : [{ type : 'button', rendition : 'filled', text : 'Click' }] }
    ]
});
