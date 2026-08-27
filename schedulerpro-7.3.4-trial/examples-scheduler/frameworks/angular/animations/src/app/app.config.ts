import { ComboModel, SchedulerResourceModel, Scheduler, StringHelper } from '@bryntum/schedulerpro';
import { BryntumSchedulerProps } from '@bryntum/schedulerpro-angular';
import AppEventModel from './lib/AppEventModel';

class AppResourceModel extends SchedulerResourceModel {
    declare eventColor: string;
}

export const schedulerProps: BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    eventColor : null,
    columns    : [
        {
            type  : 'resourceInfo',
            text  : 'Staff',
            field : 'name',
            width : 150
        },
        {
            type       : 'column',
            text       : 'Event color',
            field      : 'eventColor',
            width      : 90,
            htmlEncode : false,
            renderer   : ({ record }) => `
                <div class="color-box b-sch-${(record as AppResourceModel).eventColor}">
                </div>${StringHelper.capitalize((record as AppResourceModel).eventColor)}
            `,
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
        autoLoad   : true,
        eventStore : {
            // @ts-ignore
            modelClass : AppEventModel
        },
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
