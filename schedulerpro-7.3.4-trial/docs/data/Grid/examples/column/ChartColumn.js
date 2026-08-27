class Row extends GridRowModel {
    static fields = [
        { name : 'name' },
        { name : 'monthlySales' }
    ];
}

const
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    products = [
        'Blue jeans mens L', 'Sweatshirt XL', 'Black turtleneck womens M'
    ],
    data = ArrayHelper.populate(3, n => ({
        id           : n + 1,
        name         : products[n],
        monthlySales : months.map(m => ({
            value : Math.round(Math.random() * 80 + 20),
            label : m
        }))
    }));

const grid = new Grid({
    appendTo   : targetElement,
    autoHeight : true,
    rowHeight  : 80,
    data,
    columns    : [
        {
            text   : 'Name',
            field  : 'name',
            width  : 300,
            editor : {
                type     : 'textfield',
                required : true
            }
        },
        {
            text  : 'Sales',
            width : 120,
            type  : 'chart',
            field : 'monthlySales',
            chart : {
                chartType : 'line',
                showLabel : true,
                showAxes  : true,
                series    : [{
                    field : 'value'
                }],
                labels : {
                    field : 'label'
                }
            }
        }
    ]
});
