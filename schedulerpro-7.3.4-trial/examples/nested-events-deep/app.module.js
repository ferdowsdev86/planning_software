import shared from '../_shared/shared.module.js';
import { StringHelper, SchedulerPro } from '../../build/schedulerpro.module.js';

const scheduler = new SchedulerPro({
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    // Project holding all demo data, automatically loaded when demo is opened
    project : {
        autoLoad   : true,
        loadUrl    : './data/data.json',
        // Force using a tree event store. This is normally detected from data, but in case you start without children
        // it can be forced
        eventStore : {
            tree   : true,
            fields : [
                { name : 'durationUnit', defaultValue : 'week' }
            ]
        }
    },

    multiEventSelect : true,

    // Date range to view
    startDate  : new Date(2023, 0, 1),
    endDate    : new Date(2023, 11, 31),
    // Custom view preset, only using a single header row with month name in it
    viewPreset : {
        base    : 'monthAndYear',
        headers : [
            {
                unit       : 'month',
                dateFormat : 'MMMM'
            }
        ]
    },
    eventStyle     : 'filled',
    // Need a large row height to fit stacked nested events
    rowHeight      : 260,
    // Some more space at resource top/bottom
    resourceMargin : 20,
    // Features used by the demo
    features       : {
        // Turn nested events on, not much of a demo without :)
        nestedEvents : {
            // Stack nested events
            eventLayout             : 'pack',
            // Grow nested events a bit, compared to the default which is 30
            eventHeight             : 35,
            // Reserve more space above the nested events container
            headerHeight            : 25,
            // Space between nested events
            barMargin               : 5,
            // Allow deeper nesting
            maxNesting              : 2,
            // Add "Group selected events" context menu item
            showCreateGroupMenuItem : true
        },
        // Dependencies cannot be used in combination with nested events
        dependencies : false,
        // Turn of the schedule menu, we don't want it in the demo
        scheduleMenu : false,
        stickyEvents : false
    },
    // Using a single column with a custom renderer
    columns : [
        {
            type      : 'resourceInfo',
            text      : 'Contractor',
            width     : 200,
            showImage : false
        }
    ],

    eventRenderer({ eventRecord, renderData }) {
        if (eventRecord.childLevel === 2) {
            renderData.eventColor = 'cyan';
        }
        else if (eventRecord.childLevel === 1) {
            renderData.eventColor = 'blue';
        }
        else {
            renderData.eventColor = 'indigo';
        }

        return StringHelper.encodeHtml(eventRecord.name);
    }
});

// Makes parent events render as normal events if all nested events are dragged out of them
// EventModel.convertEmptyParentToLeaf = true;
