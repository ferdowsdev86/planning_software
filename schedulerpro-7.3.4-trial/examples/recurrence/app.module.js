import shared from '../_shared/shared.module.js';
import { SchedulerPro, StringHelper } from '../../build/schedulerpro.module.js';

const colors = {
    Attic       : '#d4a9b5',
    Basement    : '#aaa3e3',
    Ventilation : '#9cadce',
    Heating     : '#7ec4cf',
    Cistern     : '#cfbf9d',
    Gas         : '#626b82'
};

const scheduler = new SchedulerPro({
    project : {
        autoLoad : true,
        loadUrl  : './data/data.json'
    },

    appendTo              : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom            : true,
    startDate             : new Date(2022, 11, 1),
    endDate               : new Date(2022, 11, 31),
    rowHeight             : 70,
    barMargin             : 10,
    eventStyle            : 'filled',
    // Enable recurring events (recurrence rules are specified per event in the dataset)
    enableRecurringEvents : true,

    features : {
        stripe       : true,
        dependencies : false
    },

    columns : [
        // Resource info column showing initials (not images)
        {
            type               : 'resourceInfo',
            text               : 'Inspector',
            useNameAsImageName : false,
            width              : 200
        }
    ],

    // Custom event renderer, adds icons to occurrences and colors events by their name (type of inspection)
    eventRenderer({ eventRecord, renderData }) {
        if (colors[eventRecord.name]) {
            renderData.eventColor = colors[eventRecord.name];
        }

        if (eventRecord.isOccurrence) {
            renderData.iconCls = 'fa fa-rotate';
        }

        return StringHelper.encodeHtml(eventRecord.name);
    }
});
