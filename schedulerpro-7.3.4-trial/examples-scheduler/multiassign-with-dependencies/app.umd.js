var {
    Scheduler
} = window.bryntum.schedulerpro;
const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    startDate      : new Date(2019, 0, 1, 6),
    endDate        : new Date(2019, 0, 1, 20),
    viewPreset     : 'hourAndDay',
    eventStyle     : 'bordered',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    useInitialAnimation : false,
    columns             : [{
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
        stripe       : true,
        dependencies : true
    },
    crudManager : {
        loadUrl  : 'data/data.json',
        autoLoad : true
    }
});