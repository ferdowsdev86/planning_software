import shared from '../_shared/shared.module.js';
import { Scheduler, StringHelper } from '../../build/schedulerpro.module.js';

new Scheduler({
    appendTo              : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom            : true,
    rowHeight             : 60,
    enableRecurringEvents : true,
    tickSize              : 80,
    resourceImages        : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    features : {
        sort         : 'name',
        eventTooltip : true
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
    eventRenderer({ renderData, eventRecord }) {
        renderData.iconCls = eventRecord.isRecurring ? 'fa fa-star' : (eventRecord.isOccurrence ? 'fa fa-sync' : 'fa fa-calendar');
        return StringHelper.xss`${eventRecord.name}`;
    }
});
