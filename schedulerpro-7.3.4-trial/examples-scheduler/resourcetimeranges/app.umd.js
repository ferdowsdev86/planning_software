var {
    Scheduler,
    DateHelper,
    Tooltip,
    Toast
} = window.bryntum.schedulerpro;

//region Data

const resources = [{
        id   : 'r1',
        name : 'Mike'
    }, {
        id   : 'r2',
        name : 'Linda'
    }, {
        id   : 'r3',
        name : 'Lisa'
    }, {
        id   : 'r4',
        name : 'Madison'
    }, {
        id   : 'r5',
        name : 'Mark'
    }, {
        id   : 'r6',
        name : 'Kate'
    }, {
        id   : 'r7',
        name : 'Dan'
    }, {
        id   : 'r8',
        name : 'Henrik'
    }, {
        id   : 'r9',
        name : 'Rob'
    }, {
        id   : 'r10',
        name : 'Gloria'
    }],
    events = [{
        id         : 1,
        resourceId : 'r1',
        startDate  : new Date(2019, 0, 1, 8),
        endDate    : new Date(2019, 0, 1, 11),
        name       : 'Investigation',
        iconCls    : 'fa fa-search'
    }, {
        id         : 2,
        resourceId : 'r1',
        startDate  : new Date(2019, 0, 1, 13),
        endDate    : new Date(2019, 0, 1, 15),
        name       : 'Brief',
        iconCls    : 'fa fa-newspaper'
    }, {
        id         : 3,
        resourceId : 'r2',
        startDate  : new Date(2019, 0, 1, 8),
        endDate    : new Date(2019, 0, 1, 9, 30),
        name       : 'Scrum',
        iconCls    : 'fa fa-bullhorn'
    }, {
        id         : 4,
        resourceId : 'r3',
        startDate  : new Date(2019, 0, 1, 8),
        endDate    : new Date(2019, 0, 1, 9, 30),
        name       : 'Scrum',
        iconCls    : 'fa fa-bullhorn'
    }, {
        id         : 5,
        resourceId : 'r4',
        startDate  : new Date(2019, 0, 1, 7),
        endDate    : new Date(2019, 0, 1, 11),
        name       : 'Meeting',
        iconCls    : 'fa fa-calendar'
    }, {
        id         : 6,
        resourceId : 'r4',
        startDate  : new Date(2019, 0, 1, 15),
        endDate    : new Date(2019, 0, 1, 17),
        name       : 'Meeting',
        iconCls    : 'fa fa-calendar',
        eventColor : 'blue'
    }, {
        id         : 7,
        resourceId : 'r6',
        startDate  : new Date(2019, 0, 1, 12, 30),
        endDate    : new Date(2019, 0, 1, 19),
        name       : 'Important meeting',
        iconCls    : 'fa fa-exclamation-triangle',
        eventColor : 'red'
    }, {
        id         : 8,
        resourceId : 'r6',
        startDate  : new Date(2019, 0, 1, 9),
        endDate    : new Date(2019, 0, 1, 12),
        name       : 'Generic meeting',
        iconCls    : 'fa fa-calendar'
    }, {
        id         : 9,
        resourceId : 'r7',
        startDate  : new Date(2019, 0, 1, 9),
        endDate    : new Date(2019, 0, 1, 11),
        name       : 'Dad\'s birthday',
        iconCls    : 'fa fa-birthday-cake',
        eventColor : 'green'
    }, {
        id         : 10,
        resourceId : 'r9',
        startDate  : new Date(2019, 0, 1, 13),
        endDate    : new Date(2019, 0, 1, 20),
        name       : 'Golf tournament',
        iconCls    : 'fa fa-golf-ball',
        eventColor : 'green'
    }],
    resourceTimeRanges = [{
        id             : 1,
        resourceId     : 'r1',
        startDate      : '2019-01-01T11:00',
        endDate        : '2019-01-01T13:00',
        name           : 'Lunch',
        // this time range should repeat every day
        recurrenceRule : 'FREQ=DAILY',
        important      : false
    }, {
        id         : 2,
        resourceId : 'r8',
        startDate  : '2019-01-01T11:00',
        endDate    : '2019-01-01T13:00',
        name       : 'Lunch',
        important  : false
    }, {
        id         : 3,
        resourceId : 'r9',
        startDate  : '2019-01-01T11:00',
        endDate    : '2019-01-01T13:00',
        name       : 'Lunch',
        important  : false
    }, {
        id         : 4,
        resourceId : 'r10',
        startDate  : '2019-01-01T11:00',
        endDate    : '2019-01-01T13:00',
        name       : 'Lunch',
        important  : false
    }, {
        id         : 5,
        resourceId : 'r3',
        startDate  : '2019-01-01T12:00',
        endDate    : '2019-01-01T14:00',
        name       : 'Lunch',
        important  : false
    }, {
        id           : 6,
        resourceId   : 'r4',
        startDate    : '2019-01-01T12:00',
        duration     : 2,
        durationUnit : 'h',
        name         : 'Lunch',
        important    : false
    }, {
        id             : 7,
        resourceId     : 'r2',
        startDate      : '2019-01-01T10:00',
        endDate        : '2019-01-01T17:00',
        name           : 'Car maintenance',
        timeRangeColor : 'red',
        important      : true
    }, {
        id         : 8,
        resourceId : 'r7',
        startDate  : '2019-01-01T12:00',
        endDate    : '2019-01-01T18:00',
        name       : 'Afternoon off (custom style)',
        style      : 'background: rgba(255,165,0,.3);color : orange',
        important  : true
    }, {
        id         : 9,
        resourceId : 'r5',
        startDate  : '2019-01-01T06:00',
        endDate    : '2019-01-01T20:00',
        name       : 'Parental leave (custom CSS)',
        cls        : 'custom',
        important  : true
    }];
//endregion

let newRangeCount = 0;
const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    startDate      : new Date(2019, 0, 1, 6),
    endDate        : new Date(2019, 0, 1, 20),
    viewPreset     : 'hourAndDay',
    rowHeight      : 90,
    barMargin      : 3,
    resourceMargin : 25,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    eventStyle : 'filled',
    eventColor : 'blue',
    columns    : [{
        type  : 'resourceInfo',
        text  : 'Name',
        field : 'name',
        width : 130
    }],
    features : {
        resourceTimeRanges : {
            // Enable the resource time range elements to be reachable in the DOM (to show tooltips etc.)
            enableMouseEvents : true
        }
    },
    resources,
    events,
    // the store will be used by the "resourceTimeRanges" feature
    resourceTimeRanges,
    // You can use a custom renderer method to output the contents of the range elements. The return value should
    // be a string or a DOMConfig object defining the markup to generate
    resourceTimeRangeRenderer({
        resourceTimeRangeRecord,
        resourceRecord,
        renderData
    }) {
        if (resourceTimeRangeRecord.important) {
            // Adds a CSS class to the range element
            renderData.cls.important = 1;
            return [{
                tag   : 'i',
                class : 'fa fa-warning'
            }, {
                tag  : 'strong',
                text : `${DateHelper.format(resourceTimeRangeRecord.startDate, 'HH:mm')} - ${DateHelper.format(resourceTimeRangeRecord.endDate, 'HH:mm')} ${resourceTimeRangeRecord.name}`
            }];
        }
        return resourceTimeRangeRecord.name;
    },
    tbar : [{
        type     : 'button',
        icon     : 'fa fa-plus',
        text     : 'Add new range',
        onAction : () => {
            if (newRangeCount < 10) {
                scheduler.resourceTimeRangeStore.add({
                    name           : 'New time range',
                    startDate      : new Date(2019, 0, 1, 6),
                    duration       : 2,
                    durationUnit   : 'h',
                    timeRangeColor : 'green',
                    resourceId     : 'r' + ++newRangeCount
                });
            }
        }
    }, {
        type     : 'button',
        icon     : 'fa fa-clock',
        text     : 'Move lunch',
        onAction : () => {
            scheduler.resourceTimeRangeStore.forEach(range => {
                if (range.name === 'Lunch') {
                    range.startDate = DateHelper.add(range.startDate, 1, 'hour');
                }
            });
        }
    }, {
        type    : 'slidetoggle',
        text    : 'Enable mouse interaction',
        checked : true,
        onChange({
            checked
        }) {
            scheduler.features.resourceTimeRanges.enableMouseEvents = checked;
        }
    }, '->', {
        type      : 'slider',
        ref       : 'drawThresholdSlider',
        label     : 'Draw threshold',
        showValue : true,
        min       : 0,
        max       : 20,
        value     : 0,
        unit      : 'px',
        onInput({
            value
        }) {
            scheduler.features.resourceTimeRanges.drawThreshold = value;
        }
    }],
    listeners : {
        paint() {
            const scheduler = this;
            scheduler.rangeTooltip = new Tooltip({
                rootElement : document.body,
                forSelector : '.b-sch-resource-time-range',
                getHtml     : ({
                    event
                }) => {
                    const rangeRecord = scheduler.resolveResourceTimeRangeRecord(event.target),
                        hours = DateHelper.as('hour', rangeRecord.duration, rangeRecord.durationUnit);
                    return `${rangeRecord.name} - ${hours} ${DateHelper.getLocalizedNameOfUnit('hour', hours !== 1)}`;
                }
            });
        },
        resourceTimeRangeClick({
            resourceTimeRangeRecord
        }) {
            Toast.show(`You clicked ${resourceTimeRangeRecord.name}`);
        },
        destroy() {
            this.rangeTooltip.destroy();
        }
    }
});