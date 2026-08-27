// SchedulerBase is a thinner version of Scheduler, that do not include any features by default. Using it makes it
// easier to get a smaller build
import SchedulerBase from '../../../../lib/Scheduler/view/SchedulerBase.js';

// Import the features you need
import '../../../../lib/Scheduler/feature/EventTooltip.js'; // EventTooltip feature is enabled by default, requires no config below

new SchedulerBase({
    adopt      : 'demo-scheduler',
    viewPreset : 'hourAndDay',
    startDate  : new Date(2019, 8, 18, 8),
    endDate    : new Date(2019, 8, 18, 18),
    eventColor : 'orange',

    columns : [
        {
            field : 'name',
            text  : 'Name',
            width : 150
        }
    ],

    resources : [
        { id : 1, name : 'Batman' },
        { id : 2, name : 'Superman' },
        { id : 3, name : 'Wonder Woman' },
        { id : 4, name : 'Aquaman' },
        { id : 5, name : 'Green Arrow' },
        { id : 6, name : 'Cyborg' },
        { id : 7, name : 'Hawkman' },
        { id : 8, name : 'Black Lightning' },
        { id : 9, name : 'Green Lantern' },
        { id : 10, name : 'Hawkgirl' },
        { id : 11, name : 'The Flash' },
        { id : 12, name : 'Batgirl' },
        { id : 13, name : 'Robin' }
    ],

    events : [
        { id : 1, resourceId : 1, name : 'Fight crime', startDate : new Date(2019, 8, 18, 8), duration : 9, durationUnit : 'h' },
        { id : 2, resourceId : 2, name : 'Fight crime', startDate : new Date(2019, 8, 18, 8), duration : 9, durationUnit : 'h' },
        { id : 3, resourceId : 3, name : 'Fight crime', startDate : new Date(2019, 8, 18, 8), duration : 9, durationUnit : 'h' },
        { id : 4, resourceId : 4, name : 'Fight crime', startDate : new Date(2019, 8, 18, 8), duration : 2, durationUnit : 'h' },
        { id : 14, resourceId : 4, name : 'Visit Atlantis', startDate : new Date(2019, 8, 18, 11), duration : 6, durationUnit : 'h', eventColor : 'blue' },
        { id : 5, resourceId : 5, name : 'Bow practice', startDate : new Date(2019, 8, 18, 8), duration : 4, durationUnit : 'h', eventColor : 'green' },
        { id : 15, resourceId : 5, name : 'Fight crime', startDate : new Date(2019, 8, 18, 13), duration : 4, durationUnit : 'h' },
        { id : 6, resourceId : 6, name : 'Lubricate', startDate : new Date(2019, 8, 18, 9), duration : 2, durationUnit : 'h', eventColor : 'gray' },
        { id : 16, resourceId : 6, name : 'Fight crime', startDate : new Date(2019, 8, 18, 12), duration : 4, durationUnit : 'h' },
        { id : 7, resourceId : 7, name : 'Fight crime', startDate : new Date(2019, 8, 18, 8), duration : 9, durationUnit : 'h' },
        { id : 8, resourceId : 8, name : 'Fight crime', startDate : new Date(2019, 8, 18, 17), duration : 8, durationUnit : 'h' },
        { id : 9, resourceId : 9, name : 'Meet corps', startDate : new Date(2019, 8, 18, 9), duration : 6, durationUnit : 'h', eventColor : 'green' },
        { id : 10, resourceId : 10, name : 'Fight crime', startDate : new Date(2019, 8, 18, 8), duration : 9, durationUnit : 'h' },
        { id : 11, resourceId : 11, name : 'Fight crime quickly', startDate : new Date(2019, 8, 18, 10), duration : 1, durationUnit : 'h', eventColor : 'red' },
        { id : 12, resourceId : 12, name : 'Fight crime', startDate : new Date(2019, 8, 18, 8), duration : 9, durationUnit : 'h' },
        { id : 13, resourceId : 13, name : 'School', startDate : new Date(2019, 8, 18, 8), duration : 6, durationUnit : 'h', eventColor : 'green' },
        { id : 17, resourceId : 13, name : 'Fight crime', startDate : new Date(2019, 8, 18, 15), duration : 4, durationUnit : 'h' }
    ]
});
