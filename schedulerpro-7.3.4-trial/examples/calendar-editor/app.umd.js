var {
    SchedulerPro,
    DateHelper,
    Tooltip,
    CalendarEditor
} = window.bryntum.schedulerpro;
const calendarEditor = new CalendarEditor({
    centered  : true,
    listeners : {
        save : ({
            source,
            calendar
        }) => {
            // apply the changed calendar to the resource
            if (source._isCreatingFor) {
                source._isCreatingFor.calendar = calendar;
            }
        },
        cancel : ({
            source
        }) => {
            source._isCreatingFor = null;
        }
    }
});
const scheduler = new SchedulerPro({
    // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
    // loading data into all stores at once
    project : {
        autoLoad : true,
        loadUrl  : './data/data.json'
    },
    appendTo          : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,
    startDate         : '2024-03-23T07:00',
    endDate           : '2024-03-23T23:00',
    rowHeight         : 70,
    eventStyle        : 'outlined',
    resourceImagePath : '../_shared/images/transparent-users/',
    viewPreset        : {
        tickWidth         : 20,
        displayDateFormat : 'll HH:mm',
        shiftIncrement    : 1,
        shiftUnit         : 'day',
        defaultSpan       : 24,
        timeResolution    : {
            unit      : 'minute',
            increment : 30
        },
        headers : [{
            unit       : 'day',
            dateFormat : 'ddd DD/MM' //Mon 01/10
        }, {
            unit       : 'hour',
            dateFormat : 'HH'
        }]
    },
    features : {
        dependencies           : false,
        nonWorkingTime         : false,
        resourceNonWorkingTime : true
    },
    columns : [{
        type           : 'resourceInfo',
        text           : 'Worker',
        showEventCount : false,
        showRole       : true
    }, {
        type    : 'widget',
        text    : 'Calendar',
        width   : 180,
        widgets : [{
            type      : 'button',
            rendition : 'text',
            text      : 'Edit calendar',
            icon      : 'fa fa-calendar',
            onAction  : 'up.onCalendarEditorClick'
        }]
    }],
    tbar : [{
        icon     : 'b-icon b-icon-previous',
        text     : 'Previous day',
        onAction : 'up.onPreviousDayClick'
    }, {
        icon      : 'b-icon b-icon-next',
        iconAlign : 'end',
        text      : 'Next day',
        onAction  : 'up.onNextDayClick'
    }],
    onNextDayClick() {
        this.shiftNext();
    },
    onPreviousDayClick() {
        this.shiftPrevious();
    },
    onCalendarEditorClick({
        source
    }) {
        const {
            record
        } = source.cellInfo;
        let {
            calendar
        } = record;

        // Resource has no calendar - make a copy of the project calendar
        if (!calendar) {
            const projectCalendar = scheduler.project.effectiveCalendar;
            calendar = projectCalendar.copy({
                name       : projectCalendar.name ? projectCalendar.name + ' - copy' : 'New calendar',
                isCreating : true
            });

            // remember the resource the calendar is made for
            calendarEditor._isCreatingFor = record;
        }
        calendarEditor.calendar = calendar;
        calendarEditor.activeDate = scheduler.startDate;
        calendarEditor.show();
    },
    listeners : {
        paint() {
            const scheduler = this;
            scheduler.rangeTooltip = new Tooltip({
                rootElement : document.body,
                forSelector : '.b-sch-resource-non-working-time',
                getHtml     : ({
                    event
                }) => {
                    const rangeRecord = scheduler.features.resourceNonWorkingTime.resolveResourceNonWorkingTimeInterval(event.target),
                        hours = DateHelper.as('hour', rangeRecord.duration, rangeRecord.durationUnit),
                        text = rangeRecord.name || 'Nonworking time';
                    return `${text} (${hours} ${DateHelper.getLocalizedNameOfUnit('hour', hours !== 1)})`;
                }
            });
        },
        destroy() {
            this.rangeTooltip.destroy();
        }
    }
});