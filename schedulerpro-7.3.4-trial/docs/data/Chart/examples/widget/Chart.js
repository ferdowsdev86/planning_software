new Chart({
    appendTo     : targetElement,
    width        : '100%',
    height       : '400px',
    title        : 'Sales',
    subtitle     : 'By SKU, All Regions',
    showTitle    : true,
    showSubtitle : true,
    series       : [{
        field : 'y1',
        label : 'Product 1'
    }, {
        field : 'y2',
        label : 'Product 2'
    }],
    labels : {
        field : 'x'
    },
    data : [
        { x : 'Q1', y1 : 3, y2 : 5 },
        { x : 'Q2', y1 : 6, y2 : 4 },
        { x : 'Q3', y1 : 4, y2 : 7 },
        { x : 'Q4', y1 : 8, y2 : 9 }
    ]
});
