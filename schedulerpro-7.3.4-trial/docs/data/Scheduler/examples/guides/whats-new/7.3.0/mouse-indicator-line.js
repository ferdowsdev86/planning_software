const scheduler = new Scheduler({
    appendTo : targetElement,

    autoHeight : true,

    startDate  : new Date(2026, 0, 5, 8),
    endDate    : new Date(2026, 0, 5, 18),
    viewPreset : 'hourAndDay',

    columns : [
        { field : 'name', text : 'Name', width : 120 }
    ],

    resources : [
        { id : 1, name : 'Alice' },
        { id : 2, name : 'Bob' },
        { id : 3, name : 'Charlie' }
    ],

    events : [
        { resourceId : 1, name : 'Meeting',  startDate : '2026-01-05T09:00', endDate : '2026-01-05T11:00' },
        { resourceId : 2, name : 'Standup',  startDate : '2026-01-05T10:00', endDate : '2026-01-05T10:30' },
        { resourceId : 3, name : 'Workshop', startDate : '2026-01-05T13:00', endDate : '2026-01-05T16:00' }
    ],

    features : {
        // Turning the regular schedule tooltip off is recommended when the mouse
        // indicator line is enabled, to avoid the tooltip following the line around
        scheduleTooltip : false,
        timeRanges      : {
            showMouseIndicatorLine : true
        }
    }
});
