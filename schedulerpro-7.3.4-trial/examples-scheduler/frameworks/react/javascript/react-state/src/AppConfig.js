/**
 * Application configuration
 */

import { SchedulerResourceModel } from '@bryntum/schedulerpro';

class RoleResourceModel extends SchedulerResourceModel {
    static $name = 'RoleResourceModel';

    static get fields() {
        return [{ name : 'role', type : 'string' }];
    }
}

export const data = {
    resources : [
        [
            { id : 'r1', name : 'Mike' },
            { id : 'r2', name : 'Linda' },
            { id : 'r3', name : 'Chang' },
            { id : 'r4', name : 'Kate' },
            { id : 'r5', name : 'Lisa' },
            { id : 'r6', name : 'Steve' },
            { id : 'r7', name : 'Mark' },
            { id : 'r8', name : 'Madison' },
            { id : 'r9', name : 'Hitomi' },
            { id : 'r10', name : 'Dan' }
        ],
        [
            { id : 'r1', name : 'Mike' },
            { id : 'r2', name : 'Linda' },
            { id : 'r3', name : 'Lisa' },
            { id : 'r4', name : 'Madison' },
            { id : 'r5', name : 'Mark' },
            { id : 'r6', name : 'Kate' },
            { id : 'r7', name : 'Dan' },
            { id : 'r8', name : 'Henrik' },
            { id : 'r9', name : 'Rob' },
            { id : 'r10', name : 'Gloria' }
        ],
        [],
        [
            { id : 'r1', name : 'Arcady', role : 'Core developer' },
            { id : 'r2', name : 'Dave', role : 'Tech Sales' },
            { id : 'r3', name : 'Henrik', role : 'Sales' },
            { id : 'r4', name : 'Linda', role : 'Core developer' },
            { id : 'r5', name : 'Celia', role : 'Developer & UX' },
            { id : 'r6', name : 'Lisa', role : 'CEO' },
            { id : 'r7', name : 'Angelo', role : 'CTO' }
        ],
        [
            { id : 1, name : 'Arcady', role : 'Core developer' },
            { id : 2, name : 'Dave', role : 'Tech Sales' },
            { id : 3, name : 'Henrik', role : 'Sales' },
            { id : 4, name : 'Linda', role : 'Core developer' },
            { id : 5, name : 'Maxim', role : 'Developer & UX' },
            { id : 6, name : 'Mike', role : 'CEO' },
            { id : 7, name : 'Lee', role : 'CTO' },
            { id : 8, name : 'Amit', role : 'Core developer' },
            { id : 9, name : 'Kate', role : 'Tech Sales' },
            { id : 10, name : 'Jong', role : 'Sales' },
            { id : 11, name : 'Lola', role : 'Core developer' },
            { id : 12, name : 'Lisa', role : 'UX' },
            { id : 13, name : 'Steve', role : 'COO' },
            { id : 14, name : 'Malik', role : 'CFO' }
        ]
    ],
    events : [
        [
            {
                id         : 1,
                resourceId : 'r1',
                startDate  : new Date(2021, 8, 3, 10),
                endDate    : new Date(2021, 8, 3, 12),
                name       : 'Click me (dataset 0)',
                iconCls    : 'fa fa-mouse-pointer'
            },
            {
                id         : 2,
                resourceId : 'r2',
                startDate  : new Date(2021, 8, 3, 12),
                endDate    : new Date(2021, 8, 3, 13, 30),
                name       : 'Drag me',
                iconCls    : 'fa fa-arrows-alt'
            },
            {
                id           : 3,
                resourceId   : 'r3',
                startDate    : new Date(2021, 8, 3, 14),
                duration     : 2,
                durationUnit : 'h',
                name         : 'Double click me',
                eventColor   : 'purple',
                iconCls      : 'fa fa-mouse-pointer'
            },
            {
                id         : 4,
                resourceId : 'r4',
                startDate  : new Date(2021, 8, 3, 8),
                endDate    : new Date(2021, 8, 3, 11),
                name       : 'Right click me',
                iconCls    : 'fa fa-mouse-pointer'
            },
            {
                id         : 5,
                resourceId : 'r5',
                startDate  : new Date(2021, 8, 3, 15),
                endDate    : new Date(2021, 8, 3, 17),
                name       : 'Resize me',
                iconCls    : 'fa fa-arrows-alt-h'
            },
            {
                id         : 6,
                resourceId : 'r6',
                startDate  : new Date(2021, 8, 3, 16),
                endDate    : new Date(2021, 8, 3, 19),
                name       : 'Important meeting',
                iconCls    : 'fa fa-exclamation-triangle',
                eventColor : 'red'
            },
            {
                id         : 7,
                resourceId : 'r6',
                startDate  : new Date(2021, 8, 3, 6),
                endDate    : new Date(2021, 8, 3, 8),
                name       : 'Sports event',
                iconCls    : 'fa fa-basketball-ball'
            },
            {
                id         : 8,
                resourceId : 'r7',
                startDate  : new Date(2021, 8, 3, 9),
                endDate    : new Date(2021, 8, 3, 11, 30),
                name       : "Dad's birthday!",
                iconCls    : 'fa fa-birthday-cake',
                // Custom styling from data
                style      : 'background-color: teal; font-size: 18px;color: #fff',
                // Prevent default styling
                eventStyle : 'none'
            }
        ],
        [
            {
                id         : 1,
                resourceId : 'r1',
                startDate  : new Date(2021, 8, 3, 8),
                endDate    : new Date(2021, 8, 3, 11),
                name       : 'Investigation (dataset 1)',
                iconCls    : 'fa fa-search'
            },
            {
                id         : 2,
                resourceId : 'r1',
                startDate  : new Date(2021, 8, 3, 13),
                endDate    : new Date(2021, 8, 3, 15),
                name       : 'Brief',
                iconCls    : 'fa fa-newspaper'
            },
            {
                id         : 3,
                resourceId : 'r2',
                startDate  : new Date(2021, 8, 3, 8),
                endDate    : new Date(2021, 8, 3, 9, 30),
                name       : 'Scrum',
                iconCls    : 'fa fa-bullhorn'
            },
            {
                id         : 4,
                resourceId : 'r3',
                startDate  : new Date(2021, 8, 3, 8),
                endDate    : new Date(2021, 8, 3, 9, 30),
                name       : 'Scrum',
                iconCls    : 'fa fa-bullhorn'
            },
            {
                id         : 5,
                resourceId : 'r4',
                startDate  : new Date(2021, 8, 3, 7),
                endDate    : new Date(2021, 8, 3, 11),
                name       : 'Meeting',
                iconCls    : 'fa fa-calendar'
            },
            {
                id         : 6,
                resourceId : 'r4',
                startDate  : new Date(2021, 8, 3, 15),
                endDate    : new Date(2021, 8, 3, 17),
                name       : 'Meeting',
                iconCls    : 'fa fa-calendar',
                eventColor : 'blue'
            },
            {
                id         : 7,
                resourceId : 'r6',
                startDate  : new Date(2021, 8, 3, 12, 30),
                endDate    : new Date(2021, 8, 3, 19),
                name       : 'Important meeting',
                iconCls    : 'fa fa-exclamation-triangle',
                eventColor : 'red'
            },
            {
                id         : 8,
                resourceId : 'r6',
                startDate  : new Date(2021, 8, 3, 9),
                endDate    : new Date(2021, 8, 3, 12),
                name       : 'Generic meeting',
                iconCls    : 'fa fa-calendar'
            },
            {
                id         : 9,
                resourceId : 'r7',
                startDate  : new Date(2021, 8, 3, 9),
                endDate    : new Date(2021, 8, 3, 11),
                name       : "Dad's birthday",
                iconCls    : 'fa fa-birthday-cake',
                eventColor : 'green'
            },
            {
                id         : 10,
                resourceId : 'r9',
                startDate  : new Date(2021, 8, 3, 13),
                endDate    : new Date(2021, 8, 3, 20),
                name       : 'Golf tournament',
                iconCls    : 'fa fa-golf-ball',
                eventColor : 'green'
            }
        ],
        [],
        [
            {
                id         : 1,
                resourceId : 'r1',
                name       : 'Coding session (dataset 3)',
                startDate  : new Date(2021, 8, 3, 10),
                endDate    : new Date(2021, 8, 3, 14),
                eventColor : 'orange',
                iconCls    : 'fa fa-code'
            },
            {
                id         : 2,
                resourceId : 'r2',
                name       : 'Conference call',
                startDate  : new Date(2021, 8, 3, 12),
                endDate    : new Date(2021, 8, 3, 15),
                eventColor : 'lime',
                iconCls    : 'fa fa-phone'
            },
            {
                id         : 3,
                resourceId : 'r3',
                name       : 'Meeting',
                startDate  : new Date(2021, 8, 3, 14),
                endDate    : new Date(2021, 8, 3, 17),
                eventColor : 'teal',
                iconCls    : 'fa fa-calendar'
            },
            {
                id         : 4,
                resourceId : 'r4',
                name       : 'Scrum',
                startDate  : new Date(2021, 8, 3, 8),
                endDate    : new Date(2021, 8, 3, 11),
                eventColor : 'blue',
                iconCls    : 'fa fa-comments'
            },
            {
                id         : 5,
                resourceId : 'r5',
                name       : 'Use cases',
                startDate  : new Date(2021, 8, 3, 15),
                endDate    : new Date(2021, 8, 3, 17),
                eventColor : 'violet',
                iconCls    : 'fa fa-users'
            },
            {
                id         : 6,
                resourceId : 'r6',
                name       : 'Golf',
                startDate  : new Date(2021, 8, 3, 16),
                endDate    : new Date(2021, 8, 3, 18),
                eventColor : 'pink',
                iconCls    : 'fa fa-golf-ball'
            }
        ],
        [
            {
                id           : 'r1',
                resourceId   : 1,
                name         : 'Restart server (dataset 4)',
                iconCls      : 'fa fa-sync',
                startDate    : '2021-09-03T08:00:00',
                duration     : 3,
                durationUnit : 'h',
                draggable    : true,
                resizable    : true
            },
            {
                id           : 'r2',
                resourceId   : 1,
                name         : 'Upgrade memory',
                iconCls      : 'fa fa-laptop',
                startDate    : '2021-09-03T15:00:00',
                cls          : '',
                duration     : 3,
                durationUnit : 'h',
                draggable    : true,
                resizable    : true
            },
            {
                id           : 'r3',
                resourceId   : 2,
                name         : 'Visit customer',
                iconCls      : 'fa fa-user',
                startDate    : '2021-09-03T09:00:00',
                cls          : '',
                duration     : 3,
                durationUnit : 'h',
                draggable    : true,
                resizable    : true
            },
            {
                id           : 'r4',
                resourceId   : 3,
                name         : 'Arrange meetup',
                iconCls      : 'fa fa-users',
                startDate    : '2021-09-03T09:00:00',
                cls          : '',
                duration     : 3,
                durationUnit : 'h',
                draggable    : true,
                resizable    : true
            },
            {
                id           : 'r5',
                resourceId   : 7,
                name         : 'Make coffee',
                startDate    : '2021-09-03T12:00:00',
                iconCls      : 'fa fa-coffee',
                duration     : 4,
                durationUnit : 'h',
                draggable    : true,
                resizable    : true
            },
            {
                id           : 'r6',
                resourceId   : 9,
                name         : 'Conference prep',
                iconCls      : 'fa fa-building',
                startDate    : '2021-09-03T09:00:00',
                cls          : 'Special',
                duration     : 3,
                durationUnit : 'h',
                draggable    : true,
                resizable    : true
            },
            {
                id           : 'r16',
                resourceId   : 11,
                name         : 'Presentation',
                iconCls      : 'fa fa-video',
                startDate    : '2021-09-03T13:00:00',
                cls          : 'Special',
                duration     : 2,
                durationUnit : 'h',
                draggable    : true,
                resizable    : true
            }
        ]
    ]
};

export const schedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    viewPreset     : 'hourAndDay',
    startDate      : new Date(2021, 8, 3, 6),
    endDate        : new Date(2021, 8, 3, 20),
    resourceImages : {
        path      : 'users/',
        extension : '.png'
    },
    resourceStore : {
        modelClass : RoleResourceModel
    },
    eventStore : {
        syncDataOnLoad : true
    },
    columns : [
        { type : 'resourceInfo', text : 'Staff', field : 'name' }
    ]
};

