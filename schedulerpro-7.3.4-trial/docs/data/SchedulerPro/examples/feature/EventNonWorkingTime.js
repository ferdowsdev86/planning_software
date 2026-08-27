//<code-header>
CSSHelper.insertRule('.weekend { background: transparent repeating-linear-gradient(-55deg, #dddddd99, #dddddd99 10px, #eeeeee99 5px, #eeeeee99 20px); }', targetElement.getRootNode());
//</code-header>
const schedulerPro = new SchedulerPro({
    appendTo : targetElement,

    // makes scheduler as high as it needs to be to fit rows
    autoHeight : true,

    startDate : new Date(2022, 8, 4),
    endDate   : new Date(2022, 8, 11),

    columns : [
        { field : 'name', text : 'Name' },
        { field : 'calendar', text : 'Working on', editor : false }
    ],

    features : {
        nonWorkingTime      : false,
        eventNonWorkingTime : true
    },

    project : {
        resources : [
            { id : 1, name : 'Hulk', calendar : 'weekends' },
            { id : 2, name : 'She-Hulk', calendar : 'weekdays' }
        ],

        events : [
            { id : 1, name : 'Smash', startDate : '2022-09-01', duration : 6 },
            { id : 2, name : 'Crush', startDate : '2022-09-07', duration : 4 }
        ],

        assignments : [
            { id : 1, eventId : 1, resourceId : 1 },
            { id : 2, eventId : 2, resourceId : 2 }
        ],

        calendars : [
            {
                id                       : 'weekends',
                name                     : 'Weekends',
                unspecifiedTimeIsWorking : true,
                intervals                : [
                    {
                        recurrentStartDate : 'on Mon',
                        recurrentEndDate   : 'on Sat',
                        isWorking          : false,
                        cls                : 'nonworking'
                    }
                ]
            },
            {
                id                       : 'weekdays',
                name                     : 'Weekdays',
                unspecifiedTimeIsWorking : true,
                intervals                : [
                    {
                        recurrentStartDate : 'on Sat',
                        recurrentEndDate   : 'on Mon',
                        isWorking          : false,
                        cls                : 'weekend'
                    }
                ]
            }
        ]
    }
});
