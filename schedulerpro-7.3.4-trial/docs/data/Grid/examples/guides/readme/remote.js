const store = new AjaxStore({
    readUrl : './data.json'
});

const grid = new Grid({
    appendTo : targetElement,

    autoHeight : true,

    columns : [
        { field : 'name', text : 'Name', width : 200 },
        { field : 'city', text : 'City', flex : 1 },
        { field : 'age', text : 'Age', flex : 1 }
    ],

    store : {
        autoLoad : true,
        readUrl  : 'data/Grid/examples/guides/readme/data.json'
    }
});
