import { StringHelper } from '@bryntum/schedulerpro';

export const schedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    features   : { timeRanges : true },

    resourceImages : {
        path      : 'users/',
        extension : '.png'
    },

    startDate  : new Date(2017, 0, 1, 6),
    endDate    : new Date(2017, 0, 1, 20),
    viewPreset : 'hourAndDay',

    crudManager : {
        autoLoad         : true,
        loadUrl          : 'data/data.json',
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    // Columns in scheduler
    columns : [
        { type : 'resourceInfo', text : 'L{Name}', width : 150 },
        { text : 'L{Company}', field : 'company', width : 150 }
    ],

    eventRenderer({ resourceRecord, renderData, eventRecord }) {
        Object.assign(renderData, {
            iconCls    : resourceRecord.company.startsWith('Big') ? 'fa fa-fish' : 'fa fa-rocket',
            eventColor : eventRecord.color
        });

        return StringHelper.xss`${eventRecord.name}`;
    }
};

