var {
    Scheduler
} = window.bryntum.schedulerpro;

//region Data

const resources = [{
        id         : 'r1',
        name       : 'Mike',
        eventColor : 'pink'
    }, {
        id         : 'r2',
        name       : 'Linda',
        eventColor : 'magenta'
    }, {
        id         : 'r3',
        name       : 'Don',
        eventColor : 'purple'
    }, {
        id         : 'r4',
        name       : 'Karen',
        eventColor : 'violet'
    }, {
        id         : 'r5',
        name       : 'Doug',
        eventColor : 'indigo'
    }, {
        id         : 'r6',
        name       : 'Peter',
        eventColor : 'blue'
    }, {
        id         : 'r7',
        name       : 'Sam',
        eventColor : 'light-blue'
    }, {
        id         : 'r8',
        name       : 'Melissa',
        eventColor : 'cyan'
    }, {
        id         : 'r9',
        name       : 'John',
        eventColor : 'teal'
    }, {
        id         : 'r10',
        name       : 'Ellen',
        eventColor : 'green'
    }],
    events = [{
        id         : 1,
        resourceId : 'r1',
        startDate  : new Date(2024, 0, 1, 10),
        endDate    : new Date(2024, 0, 1, 12),
        name       : 'Client meeting',
        iconCls    : 'fa fa-beer'
    }, {
        id         : 2,
        resourceId : 'r2',
        startDate  : new Date(2024, 0, 1, 12),
        endDate    : new Date(2024, 0, 1, 13, 30),
        name       : 'Plan budget',
        iconCls    : 'fa fa-computer'
    }, {
        id           : 3,
        resourceId   : 'r3',
        startDate    : new Date(2024, 0, 1, 14),
        duration     : 2,
        durationUnit : 'h',
        name         : 'Collect earnings',
        iconCls      : 'fa fa-hand-holding-usd'
    }, {
        id         : 4,
        resourceId : 'r4',
        startDate  : new Date(2024, 0, 1, 8),
        endDate    : new Date(2024, 0, 1, 11),
        name       : 'Investigate opportunities',
        iconCls    : 'fa fa-search-dollar'
    }, {
        id         : 5,
        resourceId : 'r5',
        startDate  : new Date(2024, 0, 1, 15),
        endDate    : new Date(2024, 0, 1, 17),
        name       : 'Afternoon sync-up',
        iconCls    : 'fa fa-sync-alt'
    }, {
        id         : 6,
        resourceId : 'r6',
        startDate  : new Date(2024, 0, 1, 16),
        endDate    : new Date(2024, 0, 1, 19),
        name       : 'Important meeting (read-only)',
        iconCls    : 'fa fa-exclamation-triangle',
        eventColor : 'red',
        readOnly   : true
    }, {
        id         : 7,
        resourceId : 'r6',
        startDate  : new Date(2024, 0, 1, 7),
        endDate    : new Date(2024, 0, 1, 10),
        name       : 'Sports event',
        iconCls    : 'fa fa-basketball-ball'
    }, {
        id         : 8,
        resourceId : 'r7',
        startDate  : new Date(2024, 0, 1, 9),
        endDate    : new Date(2024, 0, 1, 11, 30),
        name       : 'Board meeting',
        iconCls    : 'fa fa-golf-ball'
    }];

//endregion

const scheduler = new Scheduler({
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    resources,
    events,
    startDate  : new Date(2024, 0, 1, 6),
    endDate    : new Date(2024, 0, 1, 20),
    viewPreset : 'hourAndDay',
    rowHeight  : 50,
    barMargin  : 5,
    columns    : [{
        type  : 'resourceInfo',
        width : 130,
        text  : 'Name'
    }],
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    features : {
        eventEdit : {
            // When clicking another event, continue editing that new event
            continueEditingOnEventClick : true,
            // We want our editor to be static, *not* floating
            // This converts it to a docked, slide-in overlay
            editorConfig                : {
                drawer : true
            }
        }
    }
});