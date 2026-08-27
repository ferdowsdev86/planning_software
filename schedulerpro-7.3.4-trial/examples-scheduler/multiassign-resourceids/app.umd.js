var {
    Scheduler,
    SchedulerEventModel
} = window.bryntum.schedulerpro;

// Making a custom SchedulerEventModel to enable resourceIds field usage
class CustomEventModel extends SchedulerEventModel {
    static $name = 'CustomEventModel';
    static fields = [{
        name    : 'resourceIds',
        persist : true
    }];
}

//region Data

const resources = [{
        id   : 'r1',
        name : 'Celia',
        city : 'Barcelona'
    }, {
        id   : 'r2',
        name : 'Lee',
        city : 'London'
    }, {
        id   : 'r3',
        name : 'Macy',
        city : 'New York'
    }, {
        id   : 'r4',
        name : 'Madison',
        city : 'Barcelona'
    }, {
        id   : 'r5',
        name : 'Rob',
        city : 'Rome'
    }, {
        id   : 'r6',
        name : 'Dave',
        city : 'Barcelona'
    }, {
        id   : 'r7',
        name : 'Dan',
        city : 'London'
    }, {
        id   : 'r8',
        name : 'George',
        city : 'New York'
    }, {
        id   : 'r9',
        name : 'Gloria',
        city : 'Rome'
    }, {
        id   : 'r10',
        name : 'Henrik',
        city : 'London'
    }],
    events = [{
        id          : 1,
        startDate   : new Date(2017, 0, 1, 10),
        endDate     : new Date(2017, 0, 1, 12),
        name        : 'Multi assigned',
        iconCls     : 'fa fa-users',
        resourceIds : ['r1', 'r2', 'r8']
    }, {
        id          : 2,
        startDate   : new Date(2017, 0, 1, 13),
        endDate     : new Date(2017, 0, 1, 15),
        name        : 'Single assigned',
        iconCls     : 'fa fa-user',
        eventColor  : 'indigo',
        resourceIds : ['r3']
    }, {
        id          : 3,
        startDate   : new Date(2017, 0, 1, 8),
        endDate     : new Date(2017, 0, 1, 11),
        name        : 'Single assigned',
        iconCls     : 'fa fa-user',
        eventColor  : 'cyan',
        resourceIds : ['r4']
    }, {
        id          : 4,
        startDate   : new Date(2017, 0, 1, 10),
        endDate     : new Date(2017, 0, 1, 13),
        name        : 'Single assigned',
        iconCls     : 'fa fa-user',
        eventColor  : 'blue',
        resourceIds : ['r5']
    }, {
        id          : 5,
        startDate   : new Date(2017, 0, 1, 13),
        endDate     : new Date(2017, 0, 1, 15),
        name        : 'Single assigned',
        iconCls     : 'fa fa-user',
        eventColor  : 'violet',
        resourceIds : ['r6']
    }];

//endregion

const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    startDate      : new Date(2017, 0, 1, 6),
    endDate        : new Date(2017, 0, 1, 20),
    viewPreset     : 'hourAndDay',
    eventStyle     : 'traced',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    multiEventSelect : true,
    columns          : [{
        type  : 'resourceInfo',
        text  : 'Name',
        field : 'name',
        width : 140
    }, {
        text  : 'City',
        field : 'city',
        width : 105
    }],
    features : {
        eventDragSelect : true
    },
    resources,
    eventStore : {
        modelClass : CustomEventModel,
        data       : events
    }
});