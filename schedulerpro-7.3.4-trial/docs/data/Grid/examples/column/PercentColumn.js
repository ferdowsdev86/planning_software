// grid with PercentColumn
const grid = new Grid({
    appendTo   : targetElement,
    // makes grid as high as it needs to be to fit rows
    autoHeight : true,
    features   : { sort : 'percent' },
    data       : [
        { id : 1, name : 'Set up Confluence', percent : 25 },
        { id : 2, name : 'Figma design', percent : 50 },
        { id : 3, name : 'Safari UI tweaks', percent : 75 },
        { id : 4, name : 'Responsive rendering', percent : 100 },
        { id : 5, name : 'RTL support', percent : 125 }
    ],
    columns : [
        { field : 'name', text : 'Name', flex : 1 },
        {
            type          : 'percent',
            field         : 'percent',
            mode          : 'bar',
            text          : 'Bar shape',
            flex          : 1,
            headerWidgets : [
                {
                    type  : 'slidetoggle',
                    text  : 'Show value',
                    style : 'margin-inline-start: auto',
                    async onChange({ checked }) {
                        this.owner.showValue = checked;
                    }
                }
            ]
        },
        {
            type  : 'percent',
            field : 'percent',
            text  : 'Circle',
            mode  : 'circle',
            width : 100,
            align : 'center'
        },
        { type : 'percent', field : 'percent', text : 'As text', mode : 'number', width : 100 }
    ]
});
