var {
    Scheduler,
    DateHelper
} = window.bryntum.schedulerpro;
const scheduler = new Scheduler({
    appendTo    : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom  : true,
    crudManager : {
        autoLoad      : true,
        loadUrl       : 'data/data.json',
        resourceStore : {
            fields : ['role', 'subject', 'faculty']
        },
        eventStore : {
            fields : [{
                name         : 'durationUnit',
                defaultValue : 'hour'
            }]
        }
    },
    features : {
        stickyEvents : false
    },
    startDate  : new Date(2022, 2, 7, 7),
    endDate    : new Date(2022, 2, 7, 18),
    // Customize the hourAndDay preset, to only show hours
    viewPreset : {
        base    : 'hourAndDay',
        headers : [{
            unit       : 'hour',
            dateFormat : 'LT'
        }]
    },
    barMargin      : 5,
    eventStyle     : 'tonal',
    resourceMargin : 5,
    tickSize       : 80,
    columns        : [{
        text        : 'Staff',
        collapsible : true,
        collapsed   : true,
        children    : [{
            text  : 'Name',
            id    : 'name',
            field : 'name',
            width : 180
        }, {
            text  : 'Role',
            id    : 'role',
            field : 'role',
            width : 140
        }, {
            text  : 'Faculty',
            id    : 'faculty',
            field : 'faculty',
            width : 140
        }]
    }, {
        text  : 'Subject(s)',
        id    : 'subject',
        field : 'subject',
        width : 160
    }, {
        text         : 'Today',
        collapsible  : true,
        collapseMode : 'toggleAll',
        collapsed    : true,
        children     : [{
            text   : 'Starts',
            id     : 'starts',
            width  : 100,
            editor : false,
            renderer({
                record
            }) {
                if (record.events.length === 0) {
                    return '';
                }
                const first = record.events.sort((a, b) => a.startDate - b.startDate)[0];
                return DateHelper.format(first.startDate, 'LT');
            }
        }, {
            text   : 'Ends',
            id     : 'ends',
            width  : 100,
            editor : false,
            renderer({
                record
            }) {
                if (record.events.length === 0) {
                    return '';
                }
                const last = record.events.sort((a, b) => a.startDate - b.startDate)[record.events.length - 1];
                return DateHelper.format(last.endDate, 'LT');
            }
        }, {
            text   : 'Lessons',
            id     : 'lessons',
            width  : 100,
            editor : false,
            renderer({
                record
            }) {
                if (record.events.length === 0) {
                    return '';
                }
                return record.events.length;
            }
        }, {
            text   : 'Hours',
            id     : 'hours',
            width  : 150,
            editor : false,
            renderer({
                record
            }) {
                if (record.events.length === 0) {
                    return '';
                }
                const hours = record.events.reduce((sum, e) => sum + e.duration, 0);
                return DateHelper.formatDelta(DateHelper.asMilliseconds(hours, 'hour'));
            }
        }, {
            text            : 'Scheduled',
            id              : 'scheduled',
            editor          : false,
            toggleAllHidden : true,
            renderer({
                record
            }) {
                if (record.events.length === 0) {
                    return '';
                }
                const sorted = record.events.sort((a, b) => a.startDate - b.startDate),
                    first = sorted[0],
                    last = sorted[sorted.length - 1];
                return DateHelper.format(first.startDate, 'LT') + ' - ' + DateHelper.format(last.endDate, 'LT');
            }
        }]
    }],
    subGridConfigs : {
        locked : {
            width : 500
        }
    },
    eventRenderer : ({
        eventRecord
    }) => ({
        children : [{
            className : 'event-name',
            text      : eventRecord.name
        }, {
            className : 'event-time',
            text      : `${DateHelper.format(eventRecord.startDate, 'LT')} - ${DateHelper.format(eventRecord.endDate, 'LT')}`
        }]
    })
});