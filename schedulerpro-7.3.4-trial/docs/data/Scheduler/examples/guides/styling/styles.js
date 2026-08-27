const scheduler = new Scheduler({
    appendTo           : targetElement,
    autoHeight         : true,
    rowHeight          : 50,
    autoAdjustTimeAxis : false,

    columns : [
        {
            text  : 'Name',
            field : 'name',
            width : 160
        }
    ],

    resources : [
        { id : 1, name : 'eventStyle' }
    ],

    events : [
        { resourceId : 1, startDate : '2025-01-05', duration : 2, durationUnit : 'day', name : 'tonal', eventStyle : 'tonal' },
        { resourceId : 1, startDate : '2025-01-05', duration : 2, durationUnit : 'day', name : 'outlined', eventStyle : 'outlined' },
        { resourceId : 1, startDate : '2025-01-08', duration : 2, durationUnit : 'day', name : 'traced', eventStyle : 'traced' },
        { resourceId : 1, startDate : '2025-01-08', duration : 2, durationUnit : 'day', name : 'filled', eventStyle : 'filled' },
        { resourceId : 1, startDate : '2025-01-11', duration : 2, durationUnit : 'day', name : 'bordered', eventStyle : 'bordered' },
        { resourceId : 1, startDate : '2025-01-11', duration : 2, durationUnit : 'day', name : 'indented', eventStyle : 'indented' },
        { resourceId : 1, startDate : '2025-01-14', duration : 2, durationUnit : 'day', name : 'rounded', eventStyle : 'rounded' },
        { resourceId : 1, startDate : '2025-01-14', duration : 2, durationUnit : 'day', name : 'line', eventStyle : 'line' },
        { resourceId : 1, startDate : '2025-01-17', duration : 2, durationUnit : 'day', name : 'dashed', eventStyle : 'dashed' },
        { resourceId : 1, startDate : '2025-01-17', duration : 2, durationUnit : 'day', name : 'minimal', eventStyle : 'minimal' }
    ],

    startDate : new Date(2025, 0, 5),
    endDate   : new Date(2025, 0, 19)
});
