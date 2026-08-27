targetElement.innerHTML = '<p>A basic Scheduler Pro configured with inline data</p>';

new SchedulerPro({
    project : {
        resources : [
            { id : 1, name : 'Mike' },
            { id : 2, name : 'Dan' }
        ],

        events : [
            // the date format used is configurable, defaults to the simplified ISO format (e.g. 2017-10-05T14:48:00.000Z)
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
            { id : 1, startDate : '2020-06-01', duration : 3, durationUnit : 'd', name : 'Event 1' },
            { id : 2, duration : 4, durationUnit : 'd', name : 'Event 2' }
        ],

        assignments : [
            { event : 1, resource : 1 },
            { event : 2, resource : 2 }
        ],

        dependencies : [
            { fromEvent : 1, toEvent : 2 }
        ]
    },

    autoHeight : true,
    rowHeight  : 50,
    appendTo   : targetElement,

    columns : [
        { type : 'resourceInfo', text : 'Worker', field : 'name', width : 160 }
    ],
    resourceImagePath : 'data/Scheduler/images/transparent-users/',
    startDate         : new Date(2020, 5, 1),
    endDate           : new Date(2020, 5, 14)
});
