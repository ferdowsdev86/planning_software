import Scheduler from '../../../lib/Scheduler/view/Scheduler.js';
import DateHelper from '../../../lib/Core/helper/DateHelper.js';

export default class SchedulerTertialTimeAxis extends Scheduler {
    // Factoryable type name
    static type = 'schedulertertial';

    static configurable = {
        eventStyle : 'indented',

        features : {
            sort        : 'name',
            stripe      : true,
            eventResize : {
                showExactResizePosition : true
            }
        },

        tickSize                  : 120,
        zoomOnTimeAxisDoubleClick : false,
        zoomOnMouseWheel          : false,
        useInitialAnimation       : false,

        // Custom preset to display tertial time ticks
        viewPreset : {
            displayDateFormat : 'H:mm',
            shiftIncrement    : 1,
            shiftUnit         : 'WEEK',
            timeResolution    : {
                unit      : 'MINUTE',
                increment : 10
            },
            headers : [
                {
                    unit       : 'year',
                    dateFormat : 'YYYY'
                },
                {
                    unit      : 'month',
                    increment : 4,
                    renderer(start, end) {
                        return `${DateHelper.format(start, 'MMM')} - ${DateHelper.format(DateHelper.add(end,  -1, 'month'), 'MMM')}`;
                    }
                },
                {
                    unit       : 'month',
                    dateFormat : 'MMM'
                }
            ]
        },

        rowHeight : 60,

        resources : [
            { id : 'r1', name : 'Mike' },
            { id : 'r2', name : 'Linda' },
            { id : 'r3', name : 'Don' },
            { id : 'r4', name : 'Karen' },
            { id : 'r5', name : 'Doug' },
            { id : 'r6', name : 'Peter' },
            { id : 'r7', name : 'Fred' },
            { id : 'r8', name : 'Lisa' },
            { id : 'r9', name : 'Annie' },
            { id : 'r10', name : 'Dan' }
        ],

        events : [
            {
                id         : 1,
                resourceId : 'r9',
                startDate  : '2023-02-11',
                endDate    : '2023-04-28',
                name       : 'Some task',
                eventColor : 'blue'
            },
            {
                id         : 2,
                resourceId : 'r2',
                startDate  : '2023-04-13',
                endDate    : '2023-06-23',
                name       : 'Other task',
                eventColor : 'lime'
            },
            {
                id         : 3,
                resourceId : 'r3',
                startDate  : '2023-01-01',
                endDate    : '2025-01-01',
                name       : 'Important task',
                eventColor : 'red'
            }
        ],

        // Setup static columns
        columns : [
            { text : 'Name', width : 100, field : 'name' }
        ]
    };
}

// Register this widget type with its Factory
SchedulerTertialTimeAxis.initClass();
