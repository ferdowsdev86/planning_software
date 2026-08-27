const scheduler = new Scheduler({
    appendTo : targetElement,

    height : 350,

    startDate  : new Date(2025, 0, 6),
    endDate    : new Date(2025, 0, 12),
    viewPreset : 'weekAndDay',
    smoothZoom : true,

    columns : [
        { field : 'name', text : 'Name', width : 120 }
    ],

    resources : [
        { id : 1, name : 'Alice' },
        { id : 2, name : 'Bob' },
        { id : 3, name : 'Charlie' }
    ],

    events : [
        { resourceId : 1, name : 'Task A', startDate : '2025-01-07', endDate : '2025-01-09' },
        { resourceId : 2, name : 'Task B', startDate : '2025-01-08', endDate : '2025-01-10' },
        { resourceId : 3, name : 'Task C', startDate : '2025-01-06', endDate : '2025-01-08' }
    ],

    features : {
        resourceTimeRanges : {
            drawThreshold : 0
        }
    },

    resourceTimeRanges : [
        // Alice - mix of wide and narrow ranges
        { resourceId : 1, name : 'Meeting',    startDate : '2025-01-06T08:00', endDate : '2025-01-06T17:00', timeRangeColor : 'blue' },
        { resourceId : 1, name : 'Standup',    startDate : '2025-01-07T09:00', endDate : '2025-01-07T09:15', timeRangeColor : 'green' },
        { resourceId : 1, name : 'Review',     startDate : '2025-01-07T14:00', endDate : '2025-01-07T16:00', timeRangeColor : 'orange' },
        { resourceId : 1, name : 'Sync',       startDate : '2025-01-08T10:00', endDate : '2025-01-08T10:30', timeRangeColor : 'violet' },
        { resourceId : 1, name : 'Workshop',   startDate : '2025-01-09T08:00', endDate : '2025-01-10T17:00', timeRangeColor : 'blue' },
        // Bob - variety of durations
        { resourceId : 2, name : 'Sprint',     startDate : '2025-01-06T08:00', endDate : '2025-01-07T17:00', timeRangeColor : 'indigo' },
        { resourceId : 2, name : 'Coffee',     startDate : '2025-01-07T15:00', endDate : '2025-01-07T15:15', timeRangeColor : 'teal' },
        { resourceId : 2, name : 'Planning',   startDate : '2025-01-08T09:00', endDate : '2025-01-08T12:00', timeRangeColor : 'orange' },
        { resourceId : 2, name : 'Check-in',   startDate : '2025-01-09T08:00', endDate : '2025-01-09T08:30', timeRangeColor : 'green' },
        { resourceId : 2, name : 'Training',   startDate : '2025-01-10T08:00', endDate : '2025-01-11T17:00', timeRangeColor : 'red' },
        // Charlie - more ranges with different sizes
        { resourceId : 3, name : 'Call',       startDate : '2025-01-06T10:00', endDate : '2025-01-06T10:15', timeRangeColor : 'violet' },
        { resourceId : 3, name : 'Design',     startDate : '2025-01-06T13:00', endDate : '2025-01-07T17:00', timeRangeColor : 'blue' },
        { resourceId : 3, name : 'Demo',       startDate : '2025-01-08T14:00', endDate : '2025-01-08T15:00', timeRangeColor : 'teal' },
        { resourceId : 3, name : 'Retro',      startDate : '2025-01-09T09:00', endDate : '2025-01-09T09:30', timeRangeColor : 'orange' },
        { resourceId : 3, name : 'Offsite',    startDate : '2025-01-10T08:00', endDate : '2025-01-11T17:00', timeRangeColor : 'indigo' }
    ],

    tbar : [
        {
            type    : 'button',
            icon    : 'b-icon-search-plus',
            text    : 'Zoom in',
            onClick : () => scheduler.zoomIn()
        },
        {
            type    : 'button',
            icon    : 'b-icon-search-minus',
            text    : 'Zoom out',
            onClick : () => scheduler.zoomOut()
        },
        '->',
        {
            type      : 'slider',
            label     : 'Min width',
            showValue : true,
            min       : 0,
            max       : 20,
            value     : 0,
            unit      : 'px',
            width     : 200,
            onInput({ value }) {
                scheduler.features.resourceTimeRanges.drawThreshold = value;
            }
        }
    ]
});
