import { SchedulerEventModelConfig, SchedulerResourceModelConfig, ResourceTimeRangeModelConfig } from '@bryntum/schedulerpro';
import { BryntumSchedulerProps } from '@bryntum/schedulerpro-angular';

const resources : SchedulerResourceModelConfig[] = [
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
];

const events : SchedulerEventModelConfig[] = [
    {
        resourceId : 'r1',
        startDate  : new Date(2017, 0, 1, 10),
        endDate    : new Date(2017, 0, 1, 12),
        name       : 'Click me',
        iconCls    : 'fa fa-mouse-pointer'
    },
    {
        resourceId : 'r2',
        startDate  : new Date(2017, 0, 1, 12),
        endDate    : new Date(2017, 0, 1, 13, 30),
        name       : 'Drag me',
        iconCls    : 'fa fa-arrows-alt'
    },
    {
        resourceId : 'r3',
        startDate  : new Date(2017, 0, 1, 14),
        endDate    : new Date(2017, 0, 1, 16),
        name       : 'Double click me',
        eventColor : 'purple',
        iconCls    : 'fa fa-mouse-pointer'
    },
    {
        resourceId : 'r4',
        startDate  : new Date(2017, 0, 1, 8),
        endDate    : new Date(2017, 0, 1, 11),
        name       : 'Right click me',
        iconCls    : 'fa fa-mouse-pointer'
    },
    {
        resourceId : 'r5',
        startDate  : new Date(2017, 0, 1, 15),
        endDate    : new Date(2017, 0, 1, 17),
        name       : 'Resize me',
        iconCls    : 'fa fa-arrows-alt-h'
    },
    {
        resourceId : 'r6',
        startDate  : new Date(2017, 0, 1, 16),
        endDate    : new Date(2017, 0, 1, 19),
        name       : 'Important meeting',
        iconCls    : 'fa fa-exclamation-triangle',
        eventColor : 'red'
    },
    {
        resourceId : 'r6',
        startDate  : new Date(2017, 0, 1, 6),
        endDate    : new Date(2017, 0, 1, 8),
        name       : 'Sports event',
        iconCls    : 'fa fa-basketball-ball'
    },
    {
        resourceId : 'r7',
        startDate  : new Date(2017, 0, 1, 9),
        endDate    : new Date(2017, 0, 1, 11, 30),
        name       : 'Dad\'s birthday!',
        iconCls    : 'fa fa-birthday-cake',
        style      : 'background-color : teal; font-size: 18px; color : #fff;'
    }
];

const resourceTimeRanges : ResourceTimeRangeModelConfig[] = [
    {
        id         : 1,
        resourceId : 'r1',
        startDate  : '2017-01-01T13:00',
        endDate    : '2017-01-01T14:00',
        name       : 'Lunch'
    },
    {
        id             : 7,
        resourceId     : 'r2',
        startDate      : '2017-01-01T06:00',
        endDate        : '2017-01-01T11:00',
        name           : 'AFK (uses timeRangeColor)',
        timeRangeColor : 'red'
    },
    {
        id         : 9,
        resourceId : 'r9',
        startDate  : '2017-01-01T06:00',
        endDate    : '2017-01-01T20:00',
        name       : 'Parental leave (custom CSS)',
        cls        : 'custom'
    }
];

export const schedulerProps : BryntumSchedulerProps = {

    resources,
    events,
    // Enables smoother wheel and pinch zooming
    smoothZoom       : true,
    startDate        : new Date(2017, 0, 1, 6),
    endDate          : new Date(2017, 0, 1, 20),
    viewPreset       : 'hourAndDay',
    rowHeight        : 50,
    barMargin        : 5,
    multiEventSelect : true,

    mode : 'horizontal',
    // mode : 'vertical',

    columns : [
        { text : 'Name', field : 'name', width : 130 }
    ],

    resourceImagePath : 'assets/users/',

    resourceTimeRangesFeature : true,

    resourceTimeRanges
};
