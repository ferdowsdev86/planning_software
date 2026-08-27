const scheduler = new Scheduler({
    appendTo : targetElement,

    // makes scheduler as high as it needs to be to fit rows
    autoHeight : true,

    startDate      : new Date(2018, 4, 6),
    endDate        : new Date(2018, 4, 13),
    minDate        : new Date(2017, 4, 1),
    maxDate        : new Date(2019, 4, 1),
    infiniteScroll : true,

    columns : [
        { field : 'name', text : 'Name', width : 100 }
    ],

    resources : [
        { id : 1, name : 'Resource 1' },
        { id : 2, name : 'Resource 2' }
    ],

    events : [
        { id : 1, resourceId : 1, name : 'Event 1', startDate : '2018-05-06', endDate : '2018-05-07' },
        { id : 2, resourceId : 1, name : 'Event 2', startDate : '2018-05-08', endDate : '2018-05-09' },
        { id : 3, resourceId : 2, name : 'Event 3', startDate : '2018-05-07', endDate : '2018-05-09' }
    ]
});
