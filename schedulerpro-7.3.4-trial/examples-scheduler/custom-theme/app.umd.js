var {
    Scheduler
} = window.bryntum.schedulerpro;

//region Data

const resources = [{
        id   : 'r1',
        name : 'Arcady',
        role : 'Core developer'
    }, {
        id   : 'r2',
        name : 'Dave',
        role : 'Tech Sales'
    }, {
        id   : 'r3',
        name : 'Henrik',
        role : 'Sales'
    }, {
        id   : 'r4',
        name : 'Linda',
        role : 'Core developer'
    }, {
        id   : 'r5',
        name : 'Celia',
        role : 'Developer & UX'
    }, {
        id   : 'r6',
        name : 'Lisa',
        role : 'CEO'
    }, {
        id   : 'r7',
        name : 'Angelo',
        role : 'CTO'
    }],
    events = [{
        id         : 1,
        resourceId : 'r1',
        name       : 'Coding session',
        startDate  : new Date(2017, 0, 1, 10),
        endDate    : new Date(2017, 0, 1, 12),
        eventColor : 'orange',
        iconCls    : 'fa fa-code'
    }, {
        id         : 2,
        resourceId : 'r2',
        name       : 'Conference call',
        startDate  : new Date(2017, 0, 1, 12),
        endDate    : new Date(2017, 0, 1, 15),
        eventColor : 'lime',
        iconCls    : 'fa fa-phone'
    }, {
        id         : 3,
        resourceId : 'r3',
        name       : 'Meeting',
        startDate  : new Date(2017, 0, 1, 14),
        endDate    : new Date(2017, 0, 1, 17),
        eventColor : 'teal',
        iconCls    : 'fa fa-calendar'
    }, {
        id         : 4,
        resourceId : 'r4',
        name       : 'Scrum',
        startDate  : new Date(2017, 0, 1, 8),
        endDate    : new Date(2017, 0, 1, 11),
        eventColor : 'blue',
        iconCls    : 'fa fa-comments'
    }, {
        id         : 5,
        resourceId : 'r5',
        name       : 'Use cases',
        startDate  : new Date(2017, 0, 1, 15),
        endDate    : new Date(2017, 0, 1, 17),
        eventColor : 'violet',
        iconCls    : 'fa fa-users'
    }, {
        id         : 6,
        resourceId : 'r6',
        name       : 'Golf',
        startDate  : new Date(2017, 0, 1, 16),
        endDate    : new Date(2017, 0, 1, 18),
        eventColor : 'pink',
        iconCls    : 'fa fa-golf-ball'
    }];

//endregion

new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    rowHeight      : 60,
    barMargin      : 10,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    columns : [{
        type           : 'resourceInfo',
        text           : 'Name',
        showRole       : true,
        showEventCount : false,
        width          : '15em'
    }],
    resources,
    events,
    startDate  : new Date(2017, 0, 1, 8),
    endDate    : new Date(2017, 0, 1, 19),
    viewPreset : 'hourAndDay'
});