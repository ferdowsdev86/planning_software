const store = new AjaxStore({
    modelClass    : GridRowModel,
    readUrl       : '/mockUrl',
    pageParamName : 'page',
    autoLoad      : true
});

const grid = new Grid({
    appendTo : targetElement,
    height   : 400,
    store,

    features : {
        filter : true
    },

    columns : [
        { text : '#', type : 'number', width : 80, field : 'id' },
        { text : 'First name', field : 'firstName', flex : 1 },
        { text : 'Surname', field : 'surName', flex : 1 },
        { text : 'Score', field : 'score', flex : 1, type : 'number' },
        { text : 'Rank', field : 'rank', flex : 1, type : 'number' },
        { text : 'Percent', field : 'percent', width : 150, type : 'percent' }
    ]
});

// AJAX URL Mocking
AjaxHelper.mockUrl('/mockUrl', (url, params) => {
    return {
        responseText : JSON.stringify({
            success : true,
            total   : 10,
            data    : DataGenerator.generateData(10)
        })
    };
});
