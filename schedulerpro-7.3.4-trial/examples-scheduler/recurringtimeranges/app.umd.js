var {
    Scheduler,
    DateHelper
} = window.bryntum.schedulerpro;
const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    eventStyle     : 'indented',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    features : {
        timeRanges : {
            showCurrentTimeLine : true,
            showHeaderElements  : false
        }
    },
    columns : [{
        type  : 'resourceInfo',
        text  : 'Staff',
        field : 'name',
        width : '10em'
    }],
    crudManager : {
        autoLoad         : true,
        loadUrl          : 'data/data.json',
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },
    barMargin  : 5,
    startDate  : new Date(2019, 1, 7, 8),
    endDate    : new Date(2019, 1, 29, 18),
    viewPreset : {
        tickWidth : 50,
        base      : 'dayAndWeek'
    },
    tbar : [{
        type    : 'button',
        ref     : 'addCoffeeButton',
        icon    : 'fa fa-coffee',
        text    : 'More coffee',
        tooltip : 'Click to add morning coffee to Thursdays too',
        onAction({
            source: button
        }) {
            const coffee = scheduler.features.timeRanges.store.getById(1);
            coffee.recurrenceRule = 'FREQ=WEEKLY;BYDAY=MO,TH;';
            button.disable();
        }
    }, '->', {
        type  : 'buttongroup',
        items : [{
            type    : 'button',
            icon    : 'b-icon-previous',
            tooltip : 'View previous day',
            cls     : 'navigate',
            onAction() {
                scheduler.shiftPrevious();
            }
        }, {
            type    : 'button',
            ref     : 'todayButton',
            text    : 'Today',
            tooltip : 'View today, to see the current time line',
            onAction() {
                const today = DateHelper.clearTime(new Date());
                today.setHours(5);
                scheduler.setTimeSpan(today, DateHelper.add(today, 18, 'hour'));
            }
        }, {
            type    : 'button',
            icon    : 'b-icon-next',
            tooltip : 'View next day',
            cls     : 'navigate',
            onAction() {
                scheduler.shiftNext();
            }
        }]
    }, {
        type    : 'button',
        text    : 'Start',
        tooltip : 'Return to initial view',
        onAction() {
            scheduler.setTimeSpan(new Date(2019, 1, 7, 8), new Date(2019, 1, 29, 18));
        }
    }]
});