import shared from '../_shared/shared.module.js';
import { Scheduler, DateHelper, SchedulerEventModel, SchedulerResourceModel, MessageDialog } from '../../build/schedulerpro.module.js';
//region "lib/events.js"

const events = [
    {
        id          : 1,
        resourceIds : [5, 8],
        startDate   : '2023-01-01T14:00:00',
        endDate     : '2023-01-01T16:00:00',
        progress    : 0,
        name        : 'Meeting'
    },
    {
        id          : 2,
        resourceIds : [1],
        startDate   : '2023-01-01T11:00:00',
        endDate     : '2023-01-01T13:00:00',
        progress    : 30,
        name        : 'Presentation',
        label       : 'internal',
        label2      : 'workshop'
    },
    {
        id          : 3,
        resourceIds : [9, 4, 7],
        startDate   : '2023-01-01T12:00:00',
        endDate     : '2023-01-01T14:00:00',
        progress    : 40,
        name        : 'Training Session'
    },
    {
        id          : 4,
        resourceIds : [5, 10],
        startDate   : '2023-01-01T11:00:00',
        endDate     : '2023-01-01T13:00:00',
        progress    : 50,
        name        : 'Workshop'
    },
    {
        id          : 5,
        resourceIds : [3, 8, 2],
        startDate   : '2023-01-01T09:30:00',
        endDate     : '2023-01-01T11:00:00',
        progress    : 60,
        name        : 'Discussion Panel'
    },
    {
        id          : 6,
        resourceIds : [4, 1, 6],
        startDate   : '2023-01-01T15:00:00',
        endDate     : '2023-01-01T17:00:00',
        progress    : 70,
        name        : 'Hackathon'
    },
    {
        id          : 7,
        resourceIds : [5, 10, 2],
        startDate   : '2023-01-01T16:00:00',
        endDate     : '2023-01-01T18:00:00',
        progress    : 80,
        name        : 'Demo Day'
    },
    {
        id          : 8,
        resourceIds : [8, 7, 4],
        startDate   : '2023-01-01T17:00:00',
        endDate     : '2023-01-01T19:00:00',
        progress    : 90,
        name        : 'Product Launch'
    },
    {
        id          : 9,
        resourceIds : [3, 2, 6],
        startDate   : '2023-01-01T18:00:00',
        endDate     : '2023-01-01T20:00:00',
        progress    : 100,
        name        : 'Conference'
    },
    {
        id          : 10,
        resourceIds : [1, 5, 9],
        startDate   : '2023-01-01T19:00:00',
        endDate     : '2023-01-01T21:00:00',
        progress    : 20,
        name        : 'Meeting'
    },
    {
        id          : 11,
        resourceIds : [4, 8, 3],
        startDate   : '2023-01-01T20:00:00',
        endDate     : '2023-01-01T22:00:00',
        progress    : 30,
        name        : 'Presentation'
    },
    {
        id          : 12,
        resourceIds : [7, 6, 2],
        startDate   : '2023-01-01T21:00:00',
        endDate     : '2023-01-01T23:00:00',
        progress    : 40,
        name        : 'Training Session'
    },
    {
        id          : 13,
        resourceIds : [10, 1, 5],
        startDate   : '2023-01-01T22:00:00',
        endDate     : '2023-01-02T00:00:00',
        progress    : 50,
        name        : 'Workshop'
    },
    {
        id          : 14,
        resourceIds : [3, 9, 4],
        startDate   : '2023-01-01T23:00:00',
        endDate     : '2023-01-02T01:00:00',
        progress    : 60,
        name        : 'Discussion Panel'
    },
    {
        id          : 15,
        resourceIds : [2, 5, 8],
        startDate   : '2023-01-02T00:00:00',
        endDate     : '2023-01-02T02:00:00',
        progress    : 70,
        name        : 'Hackathon'
    },
    {
        id          : 16,
        resourceIds : [1, 7, 6],
        startDate   : '2023-01-02T01:00:00',
        endDate     : '2023-01-02T03:00:00',
        progress    : 80,
        name        : 'Demo Day'
    },
    {
        id          : 17,
        resourceIds : [4, 3, 9],
        startDate   : '2023-01-02T02:00:00',
        endDate     : '2023-01-02T04:00:00',
        progress    : 90,
        name        : 'Product Launch'
    },
    {
        id          : 18,
        resourceIds : [2, 5],
        startDate   : '2023-01-02T03:00:00',
        endDate     : '2023-01-02T05:00:00',
        progress    : 100,
        name        : 'Conference'
    },
    {
        id          : 19,
        resourceIds : [1],
        startDate   : '2023-01-02T04:00:00',
        endDate     : '2023-01-02T06:00:00',
        progress    : 20,
        name        : 'Meeting'
    },
    {
        id          : 20,
        resourceIds : [9, 3],
        startDate   : '2023-01-02T05:00:00',
        endDate     : '2023-01-02T07:00:00',
        progress    : 30,
        name        : 'Presentation'
    }
];

//endregion

class CustomEventModel extends SchedulerEventModel {
    static $name  = 'CustomEventModel';
    static fields = [
        { name : 'resourceIds', persist : true },
        { name : 'label', defaultValue : 'internal' },
        { name : 'label2' },
        { name : 'duration', defaultValue : 1 },
        { name : 'durationUnit', defaultValue : 'h' }
    ];
}

class CustomResourceModel extends SchedulerResourceModel {
    static $name = 'CustomResourceModel';

    get imageUrl() {
        return `../_shared/images/transparent-users/${this.name.toLowerCase()}.png`;
    }
}

const resources = [
    { id : 1, name : 'Mike' },
    { id : 2, name : 'Linda' },
    { id : 3, name : 'Emilia' },
    { id : 5, name : 'Hitomi' },
    { id : 6, name : 'Amit' },
    { id : 7, name : 'Lee' },
    { id : 8, name : 'Macy' },
    { id : 9, name : 'Steve' },
    { id : 10, name : 'Rob' }
];

const scheduler = new Scheduler({
    appendTo      : 'container',
    resourceStore : {
        modelClass : CustomResourceModel,
        data       : resources
    },
    eventStore : {
        modelClass : CustomEventModel,
        data       : events
    },
    startDate                     : new Date(2023, 0, 1, 9),
    endDate                       : new Date(2023, 0, 1, 20),
    rowHeight                     : 70,
    barMargin                     : 5,
    tickSize                      : 100,
    eventColor                    : null,
    eventStyle                    : null,
    rowLines                      : false,
    snap                          : true,
    displayDateFormat             : 'MMM Do, HH:mm',
    updateTimelineContextOnScroll : false,
    zoomOnMouseWheel              : false,
    zoomOnTimeAxisDoubleClick     : false,
    columns                       : [
        { type : 'resourceInfo', text : 'Name', field : 'name', width : 130 }
    ],
    viewPreset : {
        base           : 'hourAndDay',
        timeResolution : {
            increment : 15,
            unit      : 'minute'
        },
        headers : [
            { unit : 'minute', increment : 30, dateFormat : 'HH:mm' }
        ]
    },
    autoCreate : {
        useEventModelDefaults : true
    },
    features : {
        eventTooltip : false,
        eventResize  : false,
        eventDrag    : {
            snapToResource : true
        },
        stickyEvents : false
    },
    // Define the DOM markup rendered inside the events bar using simple DOMConfig objects
    eventRenderer({ eventRecord, resourceRecord }) {
        return [
            {
                class    : 'header',
                children : [{
                    text : eventRecord.name
                },
                {
                    tag   : 'span',
                    class : 'scheduleinfo',
                    text  : `${DateHelper.format(eventRecord.startDate, 'HH:mm')}-${DateHelper.format(eventRecord.endDate, 'HH:mm')}`
                }]
            },
            {
                class    : 'footer',
                children : [
                    eventRecord.label ? {
                        tag   : 'span',
                        class : 'label b-bryntum',
                        text  : eventRecord.label
                    } : null,
                    eventRecord.label2 ? {
                        tag   : 'span',
                        class : 'label2 b-bryntum',
                        text  : eventRecord.label2
                    } : null
                ]
            },
            {
                tag   : 'i',
                class : 'fa fa-chevron-left'
            },
            {
                class    : 'buttons-right-container',
                children : [
                    {
                        tag   : 'i',
                        class : 'fa fa-chevron-right'
                    },
                    {
                        tag   : 'i',
                        class : 'fa fa-link'
                    }
                ]
            }
        ];
    },

    onEventClick({ eventRecord, event }) {
        const { target } = event;

        switch (true) {
            case target.matches('.fa-chevron-left'):
            case target.matches('.fa-chevron-right'):
                eventRecord.shift((target.className.match('left') ? -1 : 1) * 30, 'min');
                break;
            case target.matches('.fa-link'):
                MessageDialog.alert({
                    title   : 'Important message',
                    message : `Show cool content about "${eventRecord.name}" task`
                });
                break;
        }
    },

    onTimelineContextChange({ context }) {
        document.querySelector(`.b-sch-header-time-axis-cell.highlight`)?.classList.remove('highlight');

        if (context) {
            const
                { tickStartDate } = context,
                tick              = this.timeAxis.getTickFromDate(tickStartDate);

            document.querySelector(`.b-sch-header-time-axis-cell[data-tick-index="${tick}"]`)?.classList.add('highlight');
        }
    }
});
