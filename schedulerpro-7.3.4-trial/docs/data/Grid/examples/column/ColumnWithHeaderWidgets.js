const grid = new Grid({
    appendTo   : targetElement,
    autoHeight : true,
    data       : DataGenerator.generateData(3),
    features   : {
        sort : 'name'
    },
    columns : [
        {
            text          : 'Name',
            field         : 'name',
            flex          : 1,
            headerWidgets : [
                {
                    type      : 'button',
                    text      : 'Add row',
                    rendition : 'filled',
                    style     : {
                        'margin-inline-start' : 'auto'
                    },
                    onClick() {
                        this.owner.grid.store.add({ name : 'New user' });
                    }
                }
            ]
        },
        { text : 'City', field : 'city', width : 150 },
        { text : 'Notes', field : 'notes', flex : 2 }
    ]
});
