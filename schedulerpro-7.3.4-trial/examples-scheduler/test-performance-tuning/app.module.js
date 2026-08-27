import shared from '../_shared/shared.module.js';
import { Scheduler, DataGenerator } from '../../build/schedulerpro.module.js';

const data    = DataGenerator.generateOneEventPerTickAndResource({
        startDate    : new Date(2023, 0, 1),
        endDate      : new Date(2024, 1, 1),
        nbrResources : 50
    }),
    project = {
        resourceStore : {
            useRawData : true,
            data       : data.resources
        },
        eventStore : {
            useRawData : true,
            data       : data.events
        }
    };

// Both schedulers use the same eventRenderer to customize the look and contents of event bars
function eventRenderer({ eventRecord, resourceRecord, renderData }) {
    return `${resourceRecord.name[0]}${eventRecord.id}`;
}

// Top scheduler, showing "unassigned events" assigned to the "backlog" resource
const backlog = window.backlog = new Scheduler({
    appendTo                : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom              : true,
    startDate               : new Date(2023, 0, 1),
    endDate                 : new Date(2024, 0, 1),
    viewPreset              : 'weekAndDayLetter',
    cls                     : 'backlog',
    flex                    : '0 0 175px',
    rowHeight               : 50,
    minHeight               : 0,
    tickSize                : 50,
    barMargin               : 1,
    resourceMargin          : 1,
    eventStyle              : 'hollow',
    eventColor              : 'blue',
    eventLayout             : 'pack',
    useInitialAnimation     : false,
    hideHorizontalScrollbar : true,
    // Pre-render all loaded events to avoid rendering during horizontal scrolling.
    // NOTE: This is an experimental API which might change in future releases.
    scrollBuffer            : -1,

    // These slightly improve scroll performance
    ignoreDomEventsWhileScrolling : true,
    updateTimelineContextOnScroll : false,
    zoomOnMouseWheel              : false,
    stickyHeaders                 : false,

    resources : [{ id : 'b', name : 'Backlog' }],
    events    : data.events.slice(0, 30).map(ev => {
        ev.resourceId = 'b';
        return ev;
    }),

    features : {
        group           : false,
        columnLines     : false,
        eventDragCreate : false,
        eventTooltip    : {
            hoverDelay : 1000
        },
        eventDrag : {
            constrainDragToTimeline : false
        },
        stickyEvents : false
    },

    columns : [
        { field : 'name', text : 'Name', width : 200 }
    ],

    eventRenderer,

    tbar : [
        {
            type    : 'numberfield',
            width   : 250,
            label   : 'Horizontal buffer (in px)',
            tooltip : 'A value deciding how much extra pre-rendering is done outside the visual viewport along a horizontal time axis. Set to -1 to force early rendering of all events (defaults to 0)',
            value   : -1,
            min     : -1,
            max     : 1000,
            onChange({ value }) {
                backlog.scrollBuffer = planned.scrollBuffer = value;
            }
        }
    ]
});

// Bottom scheduler, showing "assigned events"
const planned = window.planned = new Scheduler({
    appendTo            : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom          : true,
    partner             : backlog,
    hideHeaders         : true,
    cls                 : 'planned',
    startDate           : new Date(2023, 0, 1),
    endDate             : new Date(2024, 1, 1),
    flex                : 1,
    project,
    rowHeight           : 30,
    tickSize            : 50,
    barMargin           : 1,
    resourceMargin      : 1,
    eventStyle          : 'hollow',
    useInitialAnimation : false,
    // Pre-render all loaded events to avoid rendering during horizontal scrolling.
    // NOTE: This is an experimental API which might change in future releases.
    scrollBuffer        : -1,

    // These slightly improve scroll performance
    ignoreDomEventsWhileScrolling : true,
    updateTimelineContextOnScroll : false,
    zoomOnMouseWheel              : false,
    fixedRowHeight                : true,
    eventLayout                   : 'none',

    features : {
        scheduleTooltip : false,
        columnLines     : false,
        eventResize     : false,
        eventDragCreate : false,
        eventTooltip    : {
            hoverDelay : 1000
        },
        eventDrag : {
            constrainDragToTimeline : false
        },
        stickyEvents : false
    },

    columns : backlog.columns,

    eventRenderer
});
