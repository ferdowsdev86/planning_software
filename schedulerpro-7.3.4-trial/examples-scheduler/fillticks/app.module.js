import shared from '../_shared/shared.module.js';
import { Scheduler, DateHelper, StringHelper } from '../../build/schedulerpro.module.js';

const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    startDate      : new Date(2018, 4, 13),
    endDate        : new Date(2018, 4, 20),
    viewPreset     : 'dayAndWeek',
    rowHeight      : 60,
    barMargin      : 5,
    fillTicks      : true,
    snap           : true,
    eventColor     : 'light-green',
    eventStyle     : 'indented',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },

    features : {
        nonWorkingTime : true,

        // Not yet compatible with the event styles which center their content
        stickyEvents : false,
        eventDrag    : {
            snapToResource : true
        }
    },

    columns : [
        { type : 'resourceInfo', text : 'Name', field : 'name', width : 130 }
    ],

    eventStore : {
        readUrl  : 'data/events.json',
        autoLoad : true
    },

    resourceStore : {
        readUrl  : 'data/resources.json',
        autoLoad : true
    },

    eventRenderer({ eventRecord }) {
        return [{
            html : DateHelper.format(eventRecord.startDate, 'LT')
        }, {
            html : StringHelper.encodeHtml(eventRecord.name)
        }];
    },

    tbar : [
        {
            type     : 'slidetoggle',
            label    : 'Fill ticks',
            checked  : true,
            onChange : ({ checked }) => {
                scheduler.fillTicks = checked;
            }
        },
        {
            type     : 'slidetoggle',
            label    : 'Snap drag & resize',
            checked  : true,
            onChange : ({ checked }) => {
                scheduler.snap = checked;
            }
        }
    ]
});
