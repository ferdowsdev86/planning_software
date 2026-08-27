const scheduler = new Scheduler({
    appendTo : targetElement,

    // makes scheduler as high as it needs to be to fit rows
    autoHeight : true,
    tickSize   : 60,
    startDate  : new Date(2024, 2, 20),

    columns : [
        { field : 'name', text : 'Name', width : 100 }
    ],

    features : {
        scrollButtons : true
    },

    resources : [
        { id : 1, name : 'George', eventColor : 'blue' },
        { id : 2, name : 'Rob', eventColor : 'green' }
    ],

    events : [
        {
            id                : 1,
            name              : 'Project X',
            startDate         : '2024-03-24',
            duration          : 4,
            manuallyScheduled : true,
            percentDone       : 80
        },
        {
            id                : 2,
            name              : 'Customer Project Y',
            startDate         : '2024-03-24',
            duration          : 4,
            manuallyScheduled : true,
            percentDone       : 40
        },
        {
            id                : 3,
            name              : 'Golf tournament',
            startDate         : '2024-01-28',
            manuallyScheduled : true,
            duration          : 5
        },
        {
            id                : 4,
            name              : 'Meeting',
            startDate         : '2024-04-29',
            duration          : 4,
            manuallyScheduled : true,
            percentDone       : 40
        }
    ],
    assignments : [
        { id : 1, event : 1, resource : 1 },
        { id : 2, event : 2, resource : 2 },
        { id : 3, event : 3, resource : 1 },
        { id : 4, event : 4, resource : 2 }
    ]
});
