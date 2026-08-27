const grid = new ResourceGrid({
    project : {
        loadUrl  : 'data/SchedulerPro/examples/view/ResourceHistogram.json',
        autoLoad : true
    },
    startDate  : new Date(2020, 3, 19),
    endDate    : new Date(2020, 4, 15),
    appendTo   : targetElement,
    autoHeight : true,
    minHeight  : '20em'
});
