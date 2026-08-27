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
        { id : 1, name : 'eventColor' }
    ],

    events : [
        { resourceId : 1, startDate : '2025-05-04', duration : 3, durationUnit : 'day', name : 'red', eventColor : 'red' },
        { resourceId : 1, startDate : '2025-05-05', duration : 3, durationUnit : 'day', name : 'pink', eventColor : 'pink' },
        { resourceId : 1, startDate : '2025-05-06', duration : 3, durationUnit : 'day', name : 'magenta', eventColor : 'magenta' },
        { resourceId : 1, startDate : '2025-05-07', duration : 3, durationUnit : 'day', name : 'purple', eventColor : 'purple' },
        { resourceId : 1, startDate : '2025-05-08', duration : 3, durationUnit : 'day', name : 'deep-purple', eventColor : 'deep-purple' },
        { resourceId : 1, startDate : '2025-05-09', duration : 3, durationUnit : 'day', name : 'violet', eventColor : 'violet' },
        { resourceId : 1, startDate : '2025-05-10', duration : 3, durationUnit : 'day', name : 'indigo', eventColor : 'indigo' },
        { resourceId : 1, startDate : '2025-05-11', duration : 3, durationUnit : 'day', name : 'blue', eventColor : 'blue' },
        { resourceId : 1, startDate : '2025-05-12', duration : 3, durationUnit : 'day', name : 'light-blue', eventColor : 'light-blue' },
        { resourceId : 1, startDate : '2025-05-13', duration : 3, durationUnit : 'day', name : 'cyan', eventColor : 'cyan' },
        { resourceId : 1, startDate : '2025-05-14', duration : 3, durationUnit : 'day', name : 'teal', eventColor : 'teal' },
        { resourceId : 1, startDate : '2025-05-15', duration : 3, durationUnit : 'day', name : 'green', eventColor : 'green' },
        { resourceId : 1, startDate : '2025-05-16', duration : 3, durationUnit : 'day', name : 'light-green', eventColor : 'light-green' },
        { resourceId : 1, startDate : '2025-05-17', duration : 3, durationUnit : 'day', name : 'lime', eventColor : 'lime' },
        { resourceId : 1, startDate : '2025-05-18', duration : 3, durationUnit : 'day', name : 'yellow', eventColor : 'yellow' },
        { resourceId : 1, startDate : '2025-05-19', duration : 3, durationUnit : 'day', name : 'amber', eventColor : 'amber' },
        { resourceId : 1, startDate : '2025-05-20', duration : 3, durationUnit : 'day', name : 'orange', eventColor : 'orange' },
        { resourceId : 1, startDate : '2025-05-21', duration : 3, durationUnit : 'day', name : 'deep-orange', eventColor : 'deep-orange' },
        { resourceId : 1, startDate : '2025-05-22', duration : 3, durationUnit : 'day', name : 'brown', eventColor : 'brown' },
        { resourceId : 1, startDate : '2025-05-23', duration : 3, durationUnit : 'day', name : 'gray', eventColor : 'gray' },
        { resourceId : 1, startDate : '2025-05-24', duration : 3, durationUnit : 'day', name : 'light-gray', eventColor : 'light-gray' }
    ],

    startDate : new Date(2025, 4, 3),
    endDate   : new Date(2025, 4, 24)
});
