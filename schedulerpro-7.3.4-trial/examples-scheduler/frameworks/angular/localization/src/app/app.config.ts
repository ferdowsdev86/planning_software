import { ComboModel, SchedulerEventModel, Scheduler, StringHelper } from '@bryntum/schedulerpro';
import { BryntumSchedulerProps } from '@bryntum/schedulerpro-angular';

export const schedulerProps : BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    columns    : [
        {
            type  : 'resourceInfo',
            text  : 'Staff',
            field : 'name',
            width : 150
        },
        {
            type       : 'column',
            text       : 'Task color',
            field      : 'eventColor',
            width      : 110,
            htmlEncode : false,
            renderer   : ({ record }) => {
                const event = record as SchedulerEventModel;
                return `<div class="color-box b-sch-${event.eventColor}"></div>${StringHelper.capitalize(event.eventColor || '')}`;
            },
            editor : {
                type        : 'combo',
                items       : Scheduler.eventColors,
                editable    : false,
                listItemTpl : record => {
                    const row = record as ComboModel;
                    return `<div class="color-box b-sch-${row.value}"></div><div>${row.value}</div>`;
                }
            }
        }
    ],

    timeRangesFeature : true,

    resourceImagePath : 'assets/users/',

    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'assets/data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    barMargin : 1,
    rowHeight : 50,

    startDate  : new Date(2017, 1, 7, 8),
    endDate    : new Date(2017, 1, 7, 18),
    viewPreset : 'hourAndDay',

    useInitialAnimation : 'slide-from-left'

};
