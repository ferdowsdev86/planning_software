import type { BryntumSchedulerProps } from '@bryntum/schedulerpro-react';
import AppEvent from './component/AppEvent';
import AppEventModel from './lib/AppEventModel.ts';

export const schedulerProps : BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    resourceImages : {
        path      : 'users/',
        extension : '.png'
    },
    startDate        : new Date(2023, 5, 1, 6),
    endDate          : new Date(2023, 5, 1, 20),
    viewPreset       : 'hourAndDay',
    rowHeight        : 70,
    barMargin        : 5,
    multiEventSelect : true,
    eventStyle       : 'tonal',

    crudManager : {
        autoLoad   : true,
        loadUrl    : 'data/data.json',
        eventStore : {
            // @ts-ignore
            modelClass : AppEventModel
        },

        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    columns : [
        {
            id    : 'name',
            text  : 'Name',
            type  : 'resourceInfo',
            field : 'name',
            width : 130
        }
    ],

    eventEditFeature : {
        items : {
            percentage : {
                label  : 'Complete',
                labels : [{
                    html  : '%',
                    align : 'end'
                }],
                type       : 'numberfield',
                valueField : 'percentage',
                min        : 0,
                max        : 100,
                weight     : 200
            }
        }
    },

    eventRenderer : ({ eventRecord, assignmentRecord }) => (
        <AppEvent
            key={assignmentRecord.id}
            eventRecord={eventRecord as AppEventModel}
        />
    )

};

