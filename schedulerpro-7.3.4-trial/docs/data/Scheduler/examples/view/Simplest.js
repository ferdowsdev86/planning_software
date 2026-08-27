//<code-header>
targetElement.innerHTML = '<p>The code above yields the following scheduler:</p>';
//</code-header>
const scheduler = new Scheduler({
    appendTo : targetElement,

    // Set fixed height of 370px
    height : 370,

    startDate : new Date(2018, 4, 6),
    endDate   : new Date(2018, 4, 13),

    viewPreset : 'dayAndWeek',

    columns : [
        { field : 'name', text : 'Name', width : 90 }
    ],

    resources : [
        { id : 1, name : 'Alice' },
        { id : 2, name : 'Bob' },
        { id : 3, name : 'Carol' },
        { id : 4, name : 'Dan' },
        { id : 5, name : 'Eve' }
    ],

    events : [
        { id : 1, resourceId : 1, name : 'Team Meeting', startDate : '2018-05-06', endDate : '2018-05-07' },
        { id : 2, resourceId : 1, name : 'Project Review', startDate : '2018-05-09', endDate : '2018-05-10' },
        { id : 3, resourceId : 2, name : 'Client Call', startDate : '2018-05-07', endDate : '2018-05-08' },
        { id : 4, resourceId : 2, name : 'Training Session', startDate : '2018-05-11', endDate : '2018-05-12' },
        { id : 5, resourceId : 3, name : 'Design Workshop', startDate : '2018-05-06', endDate : '2018-05-08' },
        { id : 6, resourceId : 4, name : 'Code Review', startDate : '2018-05-08', endDate : '2018-05-09' },
        { id : 7, resourceId : 5, name : 'Documentation', startDate : '2018-05-10', endDate : '2018-05-12' }
    ]
});
