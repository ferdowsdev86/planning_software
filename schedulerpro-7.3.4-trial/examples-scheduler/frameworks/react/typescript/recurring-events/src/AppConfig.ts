import { BryntumSchedulerProps } from '@bryntum/schedulerpro-react';
import { StringHelper } from '@bryntum/schedulerpro';

export const schedulerProps: BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom            : true,
    rowHeight             : 60,
    enableRecurringEvents : true,
    tickSize              : 80,
    resourceImages        : {
        path      : 'users/',
        extension : '.png'
    },

    // So that shorter, intraday events show up as a block inside a day tick
    fillTicks : true,

    columns : [
        { type : 'resourceInfo', text : 'Name', width : 160 }
    ],

    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/data.json'
    },

    startDate  : new Date(2018, 0, 1),
    endDate    : new Date(2018, 4, 1),
    viewPreset : 'weekAndDayLetter',

    sortFeature         : 'name',
    eventTooltipFeature : true,

    eventRenderer({ renderData, eventRecord }: { renderData: any; eventRecord: any }) {
        renderData.iconCls = eventRecord.isRecurring
            ? 'fa fa-star'
            : eventRecord.isOccurrence
                ? 'fa fa-sync'
                : 'fa fa-calendar';
        return StringHelper.encodeHtml(eventRecord.name);
    }
};

