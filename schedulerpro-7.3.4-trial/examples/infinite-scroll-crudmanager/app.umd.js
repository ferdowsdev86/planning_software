var {
    SchedulerPro
} = window.bryntum.schedulerpro;
const scheduler = new SchedulerPro({
    appendTo        : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom      : true,
    viewPreset      : 'dayAndMonth',
    // To center the view on a certain date
    visibleDate     : new Date(2024, 1, 6),
    // Enables endless timeline scrolling
    infiniteScroll  : true,
    // The infiniteScroll gets a better UX if a larger bufferCoef is used. When using lazyLoading, this only means that
    // the timeline "shifts" more seldom. Only events inside or close to the visible date range is requested from the
    // backend
    bufferCoef      : 20,
    // Affects when the timespan shifts upon horizontal scroll
    bufferThreshold : 0.01,
    // Current backend easily runs out of memory, this prevents the requested date ranges from being too long
    minZoomLevel    : 'weekAndDayLetter',
    tickSize        : 30,
    project         : {
        autoLoad        : true,
        autoSync        : true,
        lazyLoad        : true,
        loadUrl         : 'php/read.php',
        syncUrl         : 'php/sync.php',
        phantomIdField  : 'phantomId',
        assignmentStore : {
            syncDataOnLoad : false
        },
        resourceStore : {
            syncDataOnLoad : false,
            fields         : [{
                name    : 'calendar',
                persist : false
            }, {
                name    : 'maxUnit',
                persist : false
            }, {
                name    : 'parentId',
                persist : false
            }]
        },
        eventStore : {
            syncDataOnLoad : false,
            fields         : [{
                name    : 'duration',
                persist : false
            }, {
                name    : 'effort',
                persist : false
            }, {
                name    : 'constraintDate',
                persist : false
            }]
        }
    },
    features : {
    // Grouping is not supported when using a lazyLoad store
        group  : false,
        filter : false
    },
    columns : [{
        text       : 'Resource',
        field      : 'name',
        width      : 200,
        sortable   : false,
        filterable : false
    }],
    tbar : [{
        type : 'viewpresetcombo'
    }, '->', {
        type : 'button',
        text : 'Reset data',
        icon : 'fa fa-refresh',
        ref  : 'resetButton',
        onClick() {
            scheduler.project.load({
                reset : true
            });
        }
    }]
});