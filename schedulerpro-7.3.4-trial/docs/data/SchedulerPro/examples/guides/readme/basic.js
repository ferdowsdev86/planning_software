new SchedulerPro({
    appendTo   : targetElement,
    startDate  : new Date(2026, 0, 1),
    endDate    : new Date(2026, 1, 10),
    autoHeight : true,
    rowHeight  : 60,
    barMargin  : 15,
    eventStyle : 'colored',
    columns    : [
        { text : 'Name', field : 'name', width : 160 }
    ],
    project : {

        resources : [
            { id : 1, name : 'Dan Stevenson' },
            { id : 2, name : 'Talisha Babin' },
            { id : 3, name : 'Michael Chen' },
            { id : 4, name : 'Sophia Rodriguez' },
            { id : 5, name : 'Arjun Mehta' }
        ],
        events : [
            { id : 1,  startDate : '2026-01-01', duration : 3, durationUnit : 'd', name : 'Project Kickoff' },
            { id : 2,  startDate : '2026-01-04', duration : 4, durationUnit : 'd', name : 'Requirement Gathering' },
            { id : 3,  startDate : '2026-01-08', duration : 5, durationUnit : 'd', name : 'UI/UX Design' },
            { id : 4,  startDate : '2026-01-13', duration : 7, durationUnit : 'd', name : 'Backend Development' },
            { id : 5,  startDate : '2026-01-20', duration : 6, durationUnit : 'd', name : 'Frontend Development' },
            { id : 6,  startDate : '2026-01-26', duration : 4, durationUnit : 'd', name : 'API Integration' },
            { id : 7,  startDate : '2026-01-30', duration : 3, durationUnit : 'd', name : 'Testing & QA' },
            { id : 8,  startDate : '2026-02-02', duration : 2, durationUnit : 'd', name : 'Client Review' },
            { id : 9,  startDate : '2026-02-04', duration : 3, durationUnit : 'd', name : 'Bug Fixing' },
            { id : 10, startDate : '2026-02-07', duration : 2, durationUnit : 'd', name : 'Final Deployment' }
        ],
        assignments : [
            { event : 1,  resource : 1 },
            { event : 2,  resource : 2 },
            { event : 3,  resource : 3 },
            { event : 4,  resource : 4 },
            { event : 5,  resource : 5 },
            { event : 6,  resource : 3 },
            { event : 7,  resource : 2 },
            { event : 8,  resource : 1 },
            { event : 9,  resource : 4 },
            { event : 10, resource : 5 }
        ],
        dependencies : [
            { fromEvent : 1, toEvent : 2 },
            { fromEvent : 2, toEvent : 3 },
            { fromEvent : 3, toEvent : 4 },
            { fromEvent : 4, toEvent : 5 },
            { fromEvent : 5, toEvent : 6 },
            { fromEvent : 6, toEvent : 7 },
            { fromEvent : 7, toEvent : 8 },
            { fromEvent : 8, toEvent : 9 },
            { fromEvent : 9, toEvent : 10 }
        ]
    }
});
