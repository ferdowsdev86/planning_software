const scheduler = new Scheduler({
    appendTo : targetElement,

    // makes scheduler as high as it needs to be to fit rows
    autoHeight : true,

    startDate : new Date(2023, 4, 7),
    endDate   : new Date(2023, 4, 14),

    eventStyle     : 'outlined',
    resourceMargin : 20,
    rowHeight      : 70,

    columns : [
        { field : 'name', text : 'Name', width : 100 }
    ],

    resources : [
        { id : 1, name : 'Bernard' },
        { id : 2, name : 'Bianca' }
    ],

    events : [
        { id : 1, resourceId : 1, name : 'Interview', startDate : '2023-05-08', endDate : '2023-05-09' },
        { id : 2, resourceId : 1, name : 'Press meeting', startDate : '2023-05-10', endDate : '2023-05-11' },
        { id : 3, resourceId : 2, name : 'Audition', startDate : '2023-05-09', endDate : '2023-05-11' },
        { id : 4, resourceId : 2, name : 'Script deadline', startDate : '2023-05-12', endDate : '2023-05-12' }
    ],

    features : {
        dependencies : {
            terminalSize   : 16,
            terminalOffset : 8,
            radius         : 5
        }
    },

    dependencies : [
        { id : 1, from : 1, to : 3 }
    ]
});
