const scheduler = new Scheduler({
    appendTo : targetElement,

    // makes scheduler as high as it needs to be to fit rows
    autoHeight : true,

    startDate : new Date(2023, 4, 7),
    endDate   : new Date(2023, 4, 14),

    eventStyle : 'border',

    features : {
        rowResize : true
    },

    columns : [
        { field : 'name', text : 'Name', width : 100 }
    ],

    resources : [
        { id : 1, name : 'Bernard' },
        { id : 2, name : 'Bianca' },
        { id : 3, name : 'John' },
        { id : 4, name : 'Rob' }
    ],

    events : [
        { id : 1, resourceId : 1, name : 'Event', startDate : '2023-05-08', endDate : '2023-05-10' },
        { id : 2, resourceId : 2, name : 'Meeting', startDate : '2023-05-12', endDate : '2023-05-13' },
        { id : 3, resourceId : 2, name : 'Booking', startDate : '2023-05-09', endDate : '2023-05-11', eventColor : 'blue' },
        { id : 4, resourceId : 3, name : 'Overlapping', startDate : '2023-05-08', endDate : '2023-05-10' },
        { id : 5, resourceId : 3, name : 'Overlapping', startDate : '2023-05-09', endDate : '2023-05-11' }
    ]
});
