const histogram = new ResourceHistogram({
    project : {
        loadUrl  : 'data/SchedulerPro/examples/view/ResourceHistogram.json',
        autoLoad : true
    },
    resourceImagePath : 'data/Scheduler/images/transparent-users/',
    startDate         : new Date(2020, 3, 19),
    endDate           : new Date(2020, 4, 15),
    appendTo          : targetElement,
    rowHeight         : 60,
    autoHeight        : true,
    minHeight         : '20em',
    showBarTip        : true,
    columns           : [
        {
            type  : 'resourceInfo',
            width : 200,
            field : 'name',
            text  : 'Resource'
        }
    ]
});
