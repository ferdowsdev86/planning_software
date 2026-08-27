class Row extends GridRowModel {
    static fields = [
        { name : 'name' },
        { name : 'monthlySales' }
    ];
}

const
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    products = [
        'Blue jeans mens L', 'Sweatshirt XL', 'Black turtleneck womens M', 'Red flannel shirt mens S', 'White tank top womens XS', 'Denim jacket mens L'
    ],
    data = ArrayHelper.populate(6, n => ({
        id           : n,
        name         : products[n],
        // The Sparkline column expects an array of numeric values in its configured `field`, on each record
        monthlySales : months.map(m => Math.round(Math.random() * 80 + 20)),
        rating       : Math.round(Math.random() * 5)
    }));

// grid with SparklineColumn
const grid = new Grid({
    appendTo   : targetElement,
    // makes grid as high as it needs to be to fit rows
    autoHeight : true,
    rowHeight  : 35,
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
            id    : 'line',
            text  : 'Sparkline',
            width : 120,
            type  : 'sparkline',
            field : 'monthlySales'
        },
        {
            id        : 'bar',
            text      : 'Bar',
            width     : 120,
            type      : 'sparkline',
            chartType : 'bar',
            field     : 'monthlySales'
        },
        {
            id        : 'pie',
            text      : 'Pie',
            width     : 80,
            type      : 'sparkline',
            chartType : 'pie',
            field     : 'monthlySales'
        },
        ...months.map((monthName, i) => ({
            text     : monthName,
            width    : 80,
            editor   : false,
            renderer : ({ record }) => record.monthlySales[i]
        }))
    ]
});
