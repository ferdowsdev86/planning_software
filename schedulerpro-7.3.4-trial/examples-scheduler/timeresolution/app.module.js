import shared from '../_shared/shared.module.js';
import { Scheduler } from '../../build/schedulerpro.module.js';

//region Data

const
    resources = [
        {
            id   : 'r1',
            name : 'Arcady',
            role : 'Core developer'
        },
        {
            id   : 'r2',
            name : 'Dave',
            role : 'Tech Sales'
        },
        {
            id   : 'r3',
            name : 'Henrik',
            role : 'Sales'
        },
        {
            id   : 'r4',
            name : 'Linda',
            role : 'Core developer'
        },
        {
            id   : 'r5',
            name : 'Celia',
            role : 'Developer & UX'
        },
        {
            id   : 'r6',
            name : 'Lisa',
            role : 'CEO'
        },
        {
            id   : 'r7',
            name : 'Angelo',
            role : 'CTO'
        }
    ],
    events    = [
        {
            id         : 1,
            resourceId : 'r1',
            name       : 'Coding session',
            startDate  : new Date(2017, 0, 1, 10),
            endDate    : new Date(2017, 0, 1, 12),
            eventColor : 'orange',
            iconCls    : 'fa fa-code'
        },
        {
            id         : 2,
            resourceId : 'r2',
            name       : 'Conference call',
            startDate  : new Date(2017, 0, 1, 12),
            endDate    : new Date(2017, 0, 1, 15),
            eventColor : 'lime',
            iconCls    : 'fa fa-phone'
        },
        {
            id         : 3,
            resourceId : 'r3',
            name       : 'Meeting',
            startDate  : new Date(2017, 0, 1, 14),
            endDate    : new Date(2017, 0, 1, 17),
            eventColor : 'teal',
            iconCls    : 'fa fa-calendar'
        },
        {
            id         : 4,
            resourceId : 'r4',
            name       : 'Scrum',
            startDate  : new Date(2017, 0, 1, 8),
            endDate    : new Date(2017, 0, 1, 11),
            eventColor : 'blue',
            iconCls    : 'fa fa-comments'
        },
        {
            id         : 5,
            resourceId : 'r5',
            name       : 'Use cases',
            startDate  : new Date(2017, 0, 1, 15),
            endDate    : new Date(2017, 0, 1, 17),
            eventColor : 'violet',
            iconCls    : 'fa fa-users'
        },
        {
            id         : 6,
            resourceId : 'r6',
            name       : 'Golf',
            startDate  : new Date(2017, 0, 1, 16),
            endDate    : new Date(2017, 0, 1, 18),
            eventColor : 'pink',
            iconCls    : 'fa fa-golf-ball'
        }
    ];

//endregion

const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    rowHeight      : 60,
    barMargin      : 10,
    eventStyle     : 'indented',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    features : {
        eventDrag : {
            snapToResource : {
                threshold : 40 // the amount of pixels to snap vertically
            }
        },
        // eventResize      : {
        //     showExactResizePosition: snap
        // },
        // eventDrag        : {
        //     showExactDropPosition : snap
        // },
        stripe : true
    },

    columns : [
        {
            type           : 'resourceInfo',
            text           : 'Name',
            showRole       : true,
            showEventCount : false,
            width          : '15em'
        }
    ],

    resources,

    events,

    startDate  : new Date(2017, 0, 1, 8),
    endDate    : new Date(2017, 0, 1, 19),
    viewPreset : 'hourAndDay',
    snap       : true,

    tbar : [
        {
            type    : 'slidetoggle',
            ref     : 'snap',
            label   : 'Use snapping',
            checked : true,
            onChange({ checked }) {
                scheduler.snap = checked;
            }
        },
        {
            type      : 'slider',
            ref       : 'resolution',
            label     : 'Time resolution',
            showValue : true,
            min       : 5,
            max       : 60,
            step      : 5,
            value     : 30,
            unit      : ' minutes',
            onChange({ value }) {
                scheduler.timeResolution = value;
            }
        },
        '->',
        {
            type    : 'button',
            ref     : 'zoomInButton',
            icon    : 'fa fa-magnifying-glass-plus',
            tooltip : 'Zoom in',
            onClick : () => scheduler.zoomIn({ animate : true })
        },
        {
            type    : 'button',
            ref     : 'zoomOutButton',
            icon    : 'fa fa-magnifying-glass-minus',
            tooltip : 'Zoom out',
            onClick : () => scheduler.zoomOut({ animate : true })
        },
        {
            type  : 'timezoomslider',
            ref   : 'zoom',
            label : 'Zoom'
        }
    ],

    listeners : {
        smoothZoomLevelChange({ zoomLevel }) {
            // The zoom slider is not wide enough to represent all smooth zoom levels, so we disable zooming buttons
            // when we are close to the min/max zoom level
            scheduler.widgetMap.zoomInButton.disabled = zoomLevel > (scheduler.maxZoomLevel - 20);
            scheduler.widgetMap.zoomOutButton.disabled = zoomLevel < (scheduler.minZoomLevel + 20);
        }
    }
});
