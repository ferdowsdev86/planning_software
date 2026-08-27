import { SchedulerEventModel, StringHelper } from '@bryntum/schedulerpro';
import { BryntumSchedulerProps } from '@bryntum/schedulerpro-angular';

export const schedulerProps: BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom            : true,
    rowHeight             : 60,
    enableRecurringEvents : true,
    tickSize              : 80,
    resourceImagePath     : 'assets/users/',

    sortFeature         : 'name',
    eventTooltipFeature : true,
    eventStyle          : 'indented',

    // So that shorter, intraday events show up as a block inside a day tick
    fillTicks : true,

    columns : [
        { type : 'resourceInfo', text : 'Name' }
    ],

    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'assets/data/data.json'
            }
        }
    },

    startDate  : new Date(2018, 0, 1),
    endDate    : new Date(2018, 4, 1),
    viewPreset : 'weekAndDayLetter',
    eventRenderer({ renderData, eventRecord } : { renderData : any; eventRecord: SchedulerEventModel }): string {
        renderData.iconCls = eventRecord.isRecurring ? 'fa fa-star' : (eventRecord.isOccurrence ? 'fa fa-sync' : 'fa fa-calendar');
        return StringHelper.encodeHtml(eventRecord.name);
    }
};
