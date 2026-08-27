var {
    SchedulerPro,
    EventHelper,
    PresetManager,
    StringHelper,
    EventModel,
    CalendarEditor
} = window.bryntum.schedulerpro;
const zoomLevels = {
    minuteAndHour : 1,
    hourAndDay    : 1
};
class ProEvent extends EventModel {
    static fields = [{
        name         : 'durationUnit',
        defaultValue : 'hour'
    }];
}
const scheduler = new SchedulerPro({
    // Limit zoom levels to those which use hours to make filtering non-working time works better in this demo
    presets : PresetManager.records.filter(preset => zoomLevels[preset.id]),
    // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
    // loading data into all stores at once
    project : {
        autoLoad        : true,
        eventModelClass : ProEvent,
        loadUrl         : './data/data.json',
        listeners       : {
            load() {
                scheduler.widgetMap.calendarEditorButton.enable();
            }
        }
    },
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    startDate      : '2020-03-23',
    endDate        : '2020-03-28',
    rowHeight      : 90,
    barMargin      : 15,
    eventStyle     : 'traced',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    // Custom viewPreset (based on 'hourAndDay') that displays a compact 24-hour bottom header
    viewPreset : {
        base              : 'hourAndDay',
        tickWidth         : 30,
        displayDateFormat : 'll HH:mm',
        headers           : [{
            unit       : 'day',
            dateFormat : 'ddd DD/MM' //Mon 01/10
        }, {
            unit       : 'hour',
            dateFormat : 'HH'
        }]
    },
    features : {
    // Not using the dependencies feature
        dependencies : false,
        stickyEvents : false
    },
    columns : [
        // Column that displays a thumb for the resource
        {
            type : 'resourceInfo',
            text : 'Manager'
        }, {
            type       : 'resourceCalendar',
            htmlEncode : false,
            renderer({
                record: resource
            }) {
                var _resource$effectiveCa;
                if (resource.calendar) {
                    return StringHelper.encodeHtml(resource.calendar.name);
                }
                return StringHelper.xss`<div class="unassigned">${(_resource$effectiveCa = resource.effectiveCalendar) === null || _resource$effectiveCa === undefined ? undefined : _resource$effectiveCa.name} (inherited)</div>`;
            }
        }],
    // Custom event renderer that displays small thumbs for assigned resources
    eventRenderer({
        eventRecord,
        renderData
    }) {
        const durationColors = {
            0 : 'blue',
            1 : 'indigo',
            2 : 'violet'
        };

        // Project length determines color
        renderData.eventColor = durationColors[Math.min(Math.floor(eventRecord.duration / 9), 2)];

        // Custom content, displays images for assigned resources + event name
        return [{
            html : StringHelper.encodeHtml(eventRecord.name)
        }, {
            className : 'assigned',
            children  : eventRecord.resources.map(resource => ({
                tag       : 'img',
                className : 'b-colorize',
                draggable : false,
                src       : resource.image !== false ? this.resourceImagePath + resource.name.toLowerCase() + '.png' : null,
                alt       : StringHelper.encodeHtml(resource.name),
                dataset   : {
                    resourceId : resource.id
                }
            }))
        }];
    },
    listeners : {
        paint({
            firstPaint
        }) {
            if (firstPaint) {
                // To have resource images in events redrawn when assignments change, do a full refresh
                this.assignmentStore.on({
                    add : () => {
                        if (!this.features.eventDragCreate.isResizing) {
                            this.refreshWithTransition();
                        }
                    },
                    remove  : 'refreshWithTransition',
                    thisObj : this
                });

                // Select row when clicking a resource image on an event
                EventHelper.on({
                    element  : this.element,
                    delegate : '.assigned img',
                    thisObj  : this,
                    click(event) {
                        this.selectRow({
                            record : event.target.dataset.resourceId
                        });
                    }
                });
            }
        }
    },
    tbar : [
        // Add a button to filter out non-working time
        {
            ref  : 'filterToggle',
            type : 'slidetoggle',
            text : 'Filter out non-working time',
            onChange({
                checked
            }) {
                if (checked) {
                    // Filter that keeps working time ticks in time axis
                    scheduler.timeAxis.filter(t => scheduler.project.calendar.isWorkingTime(t.startDate, t.endDate));
                }
                else {
                    // Restore all ticks
                    scheduler.timeAxis.clearFilters();
                }
            }
        }, {
            text     : 'Change working time',
            ref      : 'calendarEditorButton',
            icon     : 'fa fa-calendar',
            disabled : true,
            onAction() {
                const calendarEditor = new CalendarEditor({
                    calendar   : scheduler.project.effectiveCalendar,
                    activeDate : new Date(2020, 2, 23),
                    modal      : true
                });
                calendarEditor.show();
            }
        }]
});