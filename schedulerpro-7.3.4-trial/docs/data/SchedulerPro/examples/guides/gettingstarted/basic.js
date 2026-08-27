const project = new ProjectModel({
    events : [
        { id : 1, name : 'Proof-read docs', startDate : '2020-03-23', duration : 3 },
        // start date will be recalculated according to incoming dependency
        { id : 2, name : 'Release docs', startDate : '2020-03-24', duration : 1 }
    ],

    resources : [
        { id : 1, name : 'Albert' },
        { id : 2, name : 'Ben' }
    ],

    assignments : [
        { resource : 1, event : 1 },
        { resource : 1, event : 2 },
        { resource : 2, event : 2 }
    ],

    dependencies : [
        { fromEvent : 1, toEvent : 2, lag : 1 }
    ]
});

const scheduler = new SchedulerPro({
    project,
    appendTo  : targetElement,
    height    : 200,
    startDate : '2020-03-22',
    endDate   : '2020-03-29',

    columns : [
        { field : 'name', text : 'Name' }
    ]
});
