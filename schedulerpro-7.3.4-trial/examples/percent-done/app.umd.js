var {
    SchedulerPro,
    Tooltip
} = window.bryntum.schedulerpro;

// Import the percent bar feature

const scheduler = new SchedulerPro({
    // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
    // loading data into all stores at once
    project : {
        autoLoad : true,
        loadUrl  : './data/data.json'
    },
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    startDate      : '2020-03-23',
    endDate        : '2020-03-26',
    rowHeight      : 70,
    barMargin      : 22,
    eventStyle     : 'rounded',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    // Custom view preset, with more compact display of hours
    viewPreset : {
        base      : 'hourAndDay',
        tickWidth : 15,
        headers   : [{
            unit       : 'day',
            dateFormat : 'ddd DD/MM' //Mon 01/10
        }, {
            unit       : 'hour',
            dateFormat : 'h'
        }]
    },
    features : {
        columnLines  : false,
        dependencies : false,
        // Enable the percent bar feature
        percentBar   : {
            allowResize    : true,
            showPercentage : false // showing a tooltip instead
        }
    },
    columns : [{
        type           : 'resourceInfo',
        text           : 'Staff',
        showEventCount : true
    }],
    listeners : {
    // This demo shows a custom tooltip while resizing the % done value
        percentBarDragStart({
            taskRecord,
            domEvent
        }) {
            this.percentTooltip = new Tooltip({
                autoShow                 : true,
                updateContentOnMouseMove : true,
                forElement               : domEvent.target.closest('.b-sch-event-wrap'),
                align                    : 'b-t',
                minWidth                 : '13em',
                cls                      : 'percent-tooltip',
                getHtml() {
                    return `Task is <span class="b-percent-value" >${taskRecord.percentDone}%</span> completed`;
                }
            });
        },
        percentBarDrop({
            taskRecord
        }) {
            this.percentTooltip.destroy();
        },
        percentBarAbort({
            taskRecord
        }) {
            this.percentTooltip.destroy();
        }
    }
});