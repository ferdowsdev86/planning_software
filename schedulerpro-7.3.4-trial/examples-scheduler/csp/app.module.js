import shared from '../_shared/shared.module.js';
import { Scheduler } from '../../build/schedulerpro.module.js';

//region Data

const
    resources = [
        { id : 'r1', name : 'Mike' },
        { id : 'r2', name : 'Celia' },
        { id : 'r3', name : 'Rob' },
        { id : 'r4', name : 'Kate' },
        { id : 'r5', name : 'Dan' },
        { id : 'r6', name : 'Gloria' },
        { id : 'r7', name : 'Mark' },
        { id : 'r8', name : 'Arcady' }
    ],
    events    = [
        {
            id         : 1,
            resourceId : 'r1',
            startDate  : new Date(2017, 0, 1, 10),
            endDate    : new Date(2017, 0, 1, 12),
            name       : 'Introduction',
            iconCls    : 'fa fa-question-circle'
        },
        {
            id         : 2,
            resourceId : 'r2',
            startDate  : new Date(2017, 0, 1, 12),
            endDate    : new Date(2017, 0, 1, 13),
            name       : 'Call',
            eventColor : 'blue',
            iconCls    : 'fa fa-phone'
        },
        {
            id         : 3,
            resourceId : 'r3',
            startDate  : new Date(2017, 0, 1, 14),
            endDate    : new Date(2017, 0, 1, 16),
            name       : 'Annual followup',
            iconCls    : 'fa fa-chart-pie'
        },
        {
            id         : 4,
            resourceId : 'r4',
            startDate  : new Date(2017, 0, 1, 8),
            endDate    : new Date(2017, 0, 1, 11),
            name       : 'Meeting management',
            iconCls    : 'fa fa-calendar'
        },
        {
            id         : 5,
            resourceId : 'r5',
            startDate  : new Date(2017, 0, 1, 15),
            endDate    : new Date(2017, 0, 1, 17),
            name       : 'Write report',
            iconCls    : 'fa fa-pencil'
        },
        {
            id         : 6,
            resourceId : 'r6',
            startDate  : new Date(2017, 0, 1, 16),
            endDate    : new Date(2017, 0, 1, 18),
            name       : 'Recreation',
            eventColor : 'green',
            iconCls    : 'fa fa-beer'
        },
        {
            id         : 7,
            resourceId : 'r6',
            startDate  : new Date(2017, 0, 1, 6),
            endDate    : new Date(2017, 0, 1, 8),
            name       : 'Morning briefing',
            iconCls    : 'fa fa-comment'
        },
        {
            id         : 8,
            resourceId : 'r7',
            startDate  : new Date(2017, 0, 1, 9),
            endDate    : new Date(2017, 0, 1, 11),
            name       : 'Dad\'s birthday',
            eventColor : 'purple',
            iconCls    : 'fa fa-gift'
        }
    ];

//endregion

const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    eventStyle     : 'bordered',
    eventColor     : 'orange',
    resources,
    events,
    startDate      : new Date(2017, 0, 1, 6),
    endDate        : new Date(2017, 0, 1, 20),
    viewPreset     : 'hourAndDay',
    barMargin      : 10,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    features : {
        eventTooltip : true
    },

    columns : [
        { type : 'resourceInfo', text : 'Name', field : 'name', width : 130, locked : true }
    ]
});
