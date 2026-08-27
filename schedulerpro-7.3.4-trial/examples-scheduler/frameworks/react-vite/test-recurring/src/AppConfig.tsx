import React from 'react';
import { BryntumSchedulerProps } from '@bryntum/schedulerpro-react';
import { ScheduleEvent } from './components/ScheduleEvent';

const Tooltip = () => {
    return (
        <div className="tooltip">
            Test Tooltip
        </div>
    );
};

export const schedulerProps: BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    viewPreset : 'dayAndWeek',
    startDate  : '2025-03-01',
    endDate    : '2025-03-31',

    eventResizeFeature : {
        tooltipTemplate : () => {
            return <Tooltip />;
        }
    },

    eventDragFeature : {
        tooltipTemplate : () => {
            return <Tooltip />;
        }
    },

    eventRenderer : ({ eventRecord }) => {
        return <ScheduleEvent eventRecord={eventRecord}/>;
    },

    enableRecurringEvents : true,

    resources : [
        { id : 1, name : 'John' },
        { id : 2, name : 'Alan' }
    ],

    columns : [{
        type      : 'resourceInfo',
        text      : 'Staff',
        showImage : false,
        width     : 130
    }],

    events : [
        {
            id             : 1,
            name           : 'Shift One',
            startDate      : '2025-03-01 00:00',
            endDate        : '2025-03-01 23:00',
            resourceId     : 1,
            recurrenceRule : 'FREQ=DAILY;COUNT=20;INTERVAL=2'
        },
        {
            id             : 2,
            name           : 'Shift Two',
            startDate      : '2025-03-03 00:00',
            endDate        : '2025-03-03 23:00',
            resourceId     : 2,
            recurrenceRule : 'FREQ=WEEKLY;COUNT=20'
        },
        {
            id         : 3,
            name       : 'Non-Recurrent',
            startDate  : '2025-03-03 00:00',
            endDate    : '2025-03-03 23:00',
            resourceId : 2
        }
    ]

};
