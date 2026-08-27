const schedulerPro = new SchedulerPro({
    appendTo : targetElement,

    autoHeight : true,

    features : {
        nestedEvents : true,
        dependencies : {
            terminalOffset : 8
        }
    },

    rowHeight : 90,
    startDate : new Date(2022, 2, 20),
    endDate   : new Date(2022, 2, 27),

    project : {
        resources : [
            { id : 1, name : 'Bruce' }
        ],

        events : [
            {
                id        : 1,
                name      : 'Art project',
                startDate : '2022-03-21',
                duration  : 5,
                children  : [
                    { id : 11, name : 'Supplies', delayFromParent : 0, duration : 1 },
                    { id : 12, name : 'Sketch', delayFromParent : 1, duration : 1, eventColor : 'indigo'  },
                    { id : 13, name : 'Outline', delayFromParent : 2, duration : 1, eventColor : 'blue'  }
                ]
            }
        ],

        assignments : [
            { id : 1, event : 1, resource : 1 },
            { id : 2, event : 11, resource : 1 },
            { id : 3, event : 12, resource : 1 },
            { id : 4, event : 13, resource : 1 }
        ],

        dependencies : [
            { id : 1, from : 11, to : 12, lag : 1 },
            { id : 2, from : 12, to : 13, lag : 0.5 }
        ]
    }
});
