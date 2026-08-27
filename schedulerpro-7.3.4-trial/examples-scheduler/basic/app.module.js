import shared from '../_shared/shared.module.js';
import { Scheduler } from '../../build/schedulerpro.module.js';

//region Data

const
    resources = [
        { id : 'r1', name : 'Mike' },
        { id : 'r2', name : 'Linda' },
        { id : 'r3', name : 'Don' },
        { id : 'r4', name : 'Karen' },
        { id : 'r5', name : 'Doug' },
        { id : 'r6', name : 'Peter' },
        { id : 'r7', name : 'Sam' },
        { id : 'r8', name : 'Melissa' },
        { id : 'r9', name : 'John' },
        { id : 'r10', name : 'Ellen' }
    ],
    events    = [
        {
            id           : 1,
            resourceId   : 'r1',
            startDate    : new Date(2017, 0, 1, 10),
            duration     : 2,
            durationUnit : 'h',
            name         : 'Click me',
            iconCls      : 'fa fa-mouse-pointer'
        },
        {
            id           : 2,
            resourceId   : 'r2',
            startDate    : new Date(2017, 0, 1, 12),
            duration     : 1.5,
            durationUnit : 'h',
            name         : 'Drag me',
            iconCls      : 'fa fa-arrows-alt'
        },
        {
            id           : 3,
            resourceId   : 'r3',
            startDate    : new Date(2017, 0, 1, 14),
            duration     : 2,
            durationUnit : 'h',
            name         : 'Double click me',
            eventColor   : 'purple',
            iconCls      : 'fa fa-mouse-pointer'
        },
        {
            id           : 4,
            resourceId   : 'r4',
            startDate    : new Date(2017, 0, 1, 8),
            duration     : 2,
            durationUnit : 'h',
            name         : 'Right click me',
            iconCls      : 'fa fa-mouse-pointer'
        },
        {
            id           : 5,
            resourceId   : 'r5',
            startDate    : new Date(2017, 0, 1, 15),
            duration     : 2,
            durationUnit : 'h',
            name         : 'Resize me',
            iconCls      : 'fa fa-arrows-alt-h'
        },
        {
            id           : 6,
            resourceId   : 'r6',
            startDate    : new Date(2017, 0, 1, 16),
            duration     : 2,
            durationUnit : 'h',
            name         : 'Important meeting (read-only)',
            iconCls      : 'fa fa-exclamation-triangle',
            eventColor   : 'red',
            readOnly     : true
        },
        {
            id           : 7,
            resourceId   : 'r6',
            startDate    : new Date(2017, 0, 1, 6),
            duration     : 3,
            durationUnit : 'h',
            name         : 'Sports event',
            iconCls      : 'fa fa-basketball-ball'
        },
        {
            id           : 8,
            resourceId   : 'r7',
            startDate    : new Date(2017, 0, 1, 9),
            duration     : 1.5,
            durationUnit : 'h',
            name         : 'Dad\'s birthday!',
            iconCls      : 'fa fa-birthday-cake',
            // Custom styling from data
            style        : 'background-color: teal; font-size: 16px; color: #fff; border-radius: 2px',
            // Prevent default styling
            eventStyle   : 'none'
        }
    ];

//endregion

const scheduler = new Scheduler({
    appendTo         : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom       : true,
    resources,
    events,
    startDate        : new Date(2017, 0, 1, 6),
    endDate          : new Date(2017, 0, 1, 20),
    viewPreset       : 'hourAndDay',
    rowHeight        : 50,
    barMargin        : 5,
    multiEventSelect : true,
    columns          : [
        { text : 'Name', field : 'name', width : 130 }
    ]
});
