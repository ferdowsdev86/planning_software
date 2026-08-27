class QuarterlySales extends Model {
    static fields = [{
        name : 'quarter'
    }, {
        name : 'month',
        type : 'number'
    }, {
        name : 'sku1',
        type : 'number'
    }, {
        name : 'sku2',
        type : 'number'
    }];
}

const data = [
    { quarter : 'Q1', month : 1, sku1 : 3, sku2 : 5 },
    { quarter : 'Q2', month : 4, sku1 : 6, sku2 : 4 },
    { quarter : 'Q3', month : 7, sku1 : 4, sku2 : 7 },
    { quarter : 'Q4', month : 10, sku1 : 8, sku2 : 9 }
].map(data => new QuarterlySales(data));

new ChartDesigner({
    appendTo      : targetElement,
    width         : '100%',
    height        : '400px',
    chartTitle    : 'Sales',
    chartSubtitle : 'By SKU, All Regions',
    showSubtitle  : true,
    style         : 'font-size: 14px',
    data,
    series        : [
        {
            field : 'sku1',
            label : 'Product 1'
        },
        {
            field : 'sku2',
            label : 'Product 2'
        }
    ],
    labelsSeriesOptions : [{
        field : 'quarter',
        label : 'Quarter'
    }, {
        field : 'month',
        label : 'Month'
    }]
});
