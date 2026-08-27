// scheduler with basic configuration
const resources = [
        { id : 'r1', name : 'Mike' },
        { id : 'r2', name : 'Linda', eventColor : 'deep-orange' },
        { id : 'r3', name : 'Don' },
        { id : 'r4', name : 'Karen', eventColor : 'purple' },
        { id : 'r5', name : 'Doug' },
        { id : 'r6', name : 'Amit' },
        { id : 'r7', name : 'Celia' }
    ],
    events    = [
        {
            resourceId : 'r1',
            startDate  : new Date(2025, 0, 1, 10),
            endDate    : new Date(2025, 0, 1, 12),
            name       : 'Meeting'
        },
        {
            resourceId : 'r2',
            startDate  : new Date(2025, 0, 1, 12),
            endDate    : new Date(2025, 0, 1, 14),
            name       : 'Conference call'
        },
        {
            resourceId : 'r3',
            startDate  : new Date(2025, 0, 1, 14),
            endDate    : new Date(2025, 0, 1, 16),
            name       : 'Afternoon meeting'
        },
        {
            resourceId : 'r4',
            startDate  : new Date(2025, 0, 1, 8),
            endDate    : new Date(2025, 0, 1, 11),
            name       : 'Planning'
        },
        {
            resourceId : 'r5',
            startDate  : new Date(2025, 0, 1, 15),
            endDate    : new Date(2025, 0, 1, 17),
            name       : 'Meeting'
        },
        {
            resourceId : 'r6',
            startDate  : new Date(2025, 0, 1, 16),
            endDate    : new Date(2025, 0, 1, 18),
            name       : 'Important meeting'
        },
        {
            resourceId : 'r6',
            startDate  : new Date(2025, 0, 1, 6),
            endDate    : new Date(2025, 0, 1, 8),
            name       : 'Client call',
            eventColor : 'green'
        },
        {
            resourceId : 'r7',
            startDate  : new Date(2025, 0, 1, 9),
            endDate    : new Date(2025, 0, 1, 12),
            name       : 'Dad\'s birthday',
            eventStyle : 'line',
            eventColor : 'blue'
        }
    ];

const scheduler = new Scheduler({
    appendTo : targetElement,

    height         : 493,
    startDate      : new Date(2025, 0, 1, 6),
    endDate        : new Date(2025, 0, 1, 20),
    viewPreset     : 'hourAndDay',
    eventStyle     : 'traced',
    resourceImages : {
        path      : 'data/Scheduler/images/transparent-users/',
        extension : '.png'
    },

    resources,
    events,

    features : {
        cellEdit     : true,
        filter       : true,
        //group        : 'city',
        quickFind    : true,
        regionResize : true,
        stripe       : true
    },

    columns : [
        { type : 'resourceInfo', text : 'Name', field : 'name', width : 140 }
    ]
});
