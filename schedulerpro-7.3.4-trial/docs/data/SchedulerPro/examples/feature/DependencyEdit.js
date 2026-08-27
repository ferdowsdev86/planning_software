targetElement.innerHTML = '<p>This demo shows the dependency editing feature, double-click a dependency line to edit:</p>';

// Project contains all the data and is responsible for correct scheduling
const project = new ProjectModel({
    resources : [
        { id : 1, name : 'John Smith' },
        { id : 2, name : 'Mary Thompson' }
    ],

    events : [
        { id : 2, name : 'Proof-read docs', startDate : '2017-01-02', endDate : '2017-01-05' },
        { id : 3, name : 'Release docs', startDate : '2017-01-09', endDate : '2017-01-10' }
    ],

    assignments : [
        { id : 1, resource : 1, event : 2 },
        { id : 2, resource : 2, event : 3 }
    ],

    dependencies : [
        { id : 1, fromEvent : 2, toEvent : 3 }
    ]
});

const scheduler = new SchedulerPro({
    appendTo  : targetElement,
    flex      : '1 0 100%',
    project, // SchedulerPro needs project to get schedule data from
    startDate : new Date(2016, 11, 31),
    endDate   : new Date(2017, 0, 11),
    height    : 300,
    features  : {
        // Enable dependency editing feature
        dependencyEdit : true
    },
    columns : [
        { field : 'name', text : 'Name' }
    ]
});
