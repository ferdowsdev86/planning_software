import { type BryntumSchedulerProps } from '@bryntum/schedulerpro-vue-3';

export const schedulerProps : BryntumSchedulerProps = {
    events : [{
        id             : 1111,
        startDate      : '2024-09-01T00:00:00+02:00',
        endDate        : '2024-09-04T00:00:00+02:00',
        name           : 'Recurring',
        allDay         : false,
        recurrenceRule : 'FREQ=WEEKLY;INTERVAL=2'
    }],
    resources : [{
        id   : 1,
        name : 'Don A Taylor'

    }],
    assignments : [{
        id         : 'a-1-1111',
        resourceId : 1,
        eventId    : 1111
    }],

    viewPreset : 'dayAndMonth',
    tickSize   : 28,
    startDate  : '2024-08-31',
    endDate    : '2024-12-31',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    enableRecurringEvents : true,

    columns : [
        {
            type      : 'resourceInfo',
            showImage : false,
            text      : 'Name',
            field     : 'name',
            width     : 200
        }
    ],

    eventRenderer({ eventRecord, renderData })  {
        return {
            vue : true,
            is  : 'VueEventRenderer',
            eventRecord
        };
    }
};
