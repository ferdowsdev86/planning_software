//<code-header>
CSSHelper.insertRule('.b-sch-resource-time-range.nonworking { background: transparent repeating-linear-gradient(-55deg, var(--b-neutral-94), var(--b-neutral-94) 10px, var(--b-neutral-99) 5px, var(--b-neutral-98) 20px); }', targetElement.getRootNode());
//</code-header>
const schedulerPro = new SchedulerPro({
    appendTo : targetElement,

    // makes scheduler as high as it needs to be to fit rows
    autoHeight : true,

    startDate : new Date(2022, 7, 2),
    endDate   : new Date(2022, 7, 14),

    columns : [
        { field : 'name', text : 'Name' },
        { field : 'calendar', text : 'Working on', editor : false }
    ],

    features : {
        nonWorkingTime         : true,
        resourceNonWorkingTime : {
            maxTimeAxisUnit : 'week'
        }
    },

    project : {
        resources : [
            { id : 1, name : 'Bernard', calendar : 'weekends' },
            { id : 2, name : 'Bianca', calendar : 'weekdays' }
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
