import shared from '../_shared/shared.module.js';
import { Scheduler } from '../../build/schedulerpro.module.js';

// Scheduler filters "backlog" resource to the top.
new Scheduler({
    appendTo    : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom  : true,
    startDate   : new Date(2023, 0, 29),
    endDate     : new Date(2023, 1, 12),
    viewPreset  : 'weekAndDayLetter',
    rowHeight   : 100,
    tickSize    : 75,
    eventStyle  : 'filled',
    crudManager : {
        autoLoad   : true,
        eventStore : {
            // Custom fields used on events in the demo
            fields : [
                'description',
                { name : 'percentDone', type : 'number', defaultValue : 0 }
            ]
        },
        resourceStore : {
            // Custom fields used on resources in the demo
            fields : [
                'city'
            ]
        },
        loadUrl : 'data/data.json'
    },

    features : {
        group       : false,
        columnLines : false,
        eventDrag   : {
            constrainDragToTimeline : false
        },
        lockRows : {
            filterFn : r => r.id === 'backlog'
        },
        nonWorkingTime : true,
        stickyEvents   : false
    },

    columns : [
        { field : 'name', text : 'Name', width : 150 },
        { field : 'city', text : 'City', width : 150 }
    ],

    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        // Add a progress bar to the event bar
        renderData.children.push({
            className : 'progress',
            style     : {
                width : `${eventRecord.percentDone}%`
            },
            children : [
                {
                    className : {
                        percent  : true,
                        hasValue : eventRecord.percentDone
                    },
                    text : `${eventRecord.percentDone}%`
                }
            ]
        });

        // "Unfinished" part of the par, for styling purposes
        renderData.children.push({
            className : 'remaining',
            style     : {
                width : `${100 - eventRecord.percentDone}%`
            }
        });

        // Events displayed in the top scheduler (backlog) are styled differently
        if (resourceRecord.id === 'backlog') {
            renderData.eventColor = 'gray';
            renderData.cls += 'backlog-event';
        }

        // Event contents
        return [
            { className : 'name', text : eventRecord.name },
            { className : 'desc', text : eventRecord.description }
        ];
    }
});
