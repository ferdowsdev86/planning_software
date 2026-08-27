new SchedulerPro({
    appendTo : targetElement,

    autoHeight : true,
    smoothZoom : true,

    startDate : new Date(2026, 2, 1),
    endDate   : new Date(2026, 2, 15),

    tbar : [
        { type : 'timezoomslider', style : 'flex: 1' }
    ],

    columns : [
        { field : 'name', text : 'Name', width : 100 }
    ],

    project : {
        resources : [
            { id : 1, name : 'Linda' },
            { id : 2, name : 'Steve' },
            { id : 3, name : 'Mark' }
        ],

        events : [
            { id : 1, resourceId : 1, name : 'Sprint planning', startDate : '2026-03-02', endDate : '2026-03-05', eventColor : 'blue' },
            { id : 2, resourceId : 2, name : 'Bug fixing',      startDate : '2026-03-04', endDate : '2026-03-08', eventColor : 'orange' },
            { id : 3, resourceId : 3, name : 'Release prep',    startDate : '2026-03-06', endDate : '2026-03-10', eventColor : 'green' },
            { id : 4, resourceId : 1, name : 'Code review',     startDate : '2026-03-09', endDate : '2026-03-12', eventColor : 'purple' }
        ]
    }
});