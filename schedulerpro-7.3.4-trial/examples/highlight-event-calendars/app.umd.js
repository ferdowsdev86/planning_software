var {
    Panel,
    EventModel,
    DateHelper,
    StringHelper,
    Container
} = window.bryntum.schedulerpro;
//region "lib/ConfigPanel.js"

// Custom panel that allows easy live configuring
class ConfigPanel extends Panel {
    static type = 'configpanel';
    static configurable = {
        scheduler : null,
        title     : 'Configuration',
        cls       : 'config-panel',
        defaults  : {
            ref       : 'slidetoggle',
            type      : 'slidetoggle',
            cls       : 'b-blue',
            listeners : {
                change({
                    source
                }) {
                    const {
                            value
                        } = source,
                        scheduler = this.up('configpanel').scheduler;
                    switch (source.ref) {
                        case 'enableDragDrop':
                            scheduler.features.eventDrag.disabled = !value;
                            break;
                        case 'constrainToResource':
                            scheduler.features.eventDrag.constrainDragToResource = value;
                            break;
                        case 'highlight':
                            scheduler.features.calendarHighlight.disabled = !value;
                            break;
                        case 'snap':
                            scheduler.snap = value;
                            break;
                        default:
                            break;
                    }
                }
            }
        },
        // Toggle features on/off (or rather disable/enable)
        items : {
            enableDragDrop : {
                text    : 'Enable task drag drop',
                checked : true
            },
            highlight : {
                text    : 'Enable highlighting',
                checked : true
            },
            constrainToResource : {
                text    : 'Constrain drag to row',
                checked : false
            },
            snap : {
                text    : 'Snap to grid',
                checked : true
            }
        }
    };
}
ConfigPanel.initClass();

//endregion

//region "lib/TaskWithCalendar.js"

// A custom task class with a few extra fields
class TaskWithCalendar extends EventModel {
    static get fields() {
        return ['patient', 'confirmed', 'requiredRole',
            // override field defaultValue to hours
            {
                name         : 'durationUnit',
                defaultValue : 'h'
            }];
    }
    get firstCalendarInterval() {
        var _this$calendar;
        return (_this$calendar = this.calendar) === null || _this$calendar === undefined ? undefined : _this$calendar.intervalStore.first;
    }
    get calendarInfo() {
        const {
            calendar,
            firstCalendarInterval
        } = this;
        if (firstCalendarInterval.isRecurrent()) {
            return StringHelper.encodeHtml(calendar.name);
        }
        return `${DateHelper.format(firstCalendarInterval.startDate, 'MMM Do')} - ${DateHelper.format(this.firstCalendarInterval.endDate, 'MMM Do')}`;
    }
}
TaskWithCalendar.initClass();

//endregion

// helper method used to get available resources
function getAvailableResources(eventRecord) {
    return scheduler.resourceStore.query(resourceRecord => resourceRecord.role === eventRecord.requiredRole || !eventRecord.requiredRole);
}

// An outer container containing the Scheduler, a splitter and a simple config panel on the right side
const container = new Container({
    appendTo : 'container',
    layout   : 'hbox',
    flex     : 1,
    cls      : 'demo-app',
    items    : {
    // The scheduler configuration
        scheduler : {
            multiEventSelect : true,
            type             : 'schedulerpro',
            // Enables smoother wheel and pinch zooming
            smoothZoom       : true,
            flex             : 1,
            // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
            // loading data into all stores at once
            project          : {
                autoLoad        : true,
                eventModelClass : TaskWithCalendar,
                loadUrl         : './data/data.json'
            },
            startDate      : '2022-05-25T09:00',
            endDate        : '2022-05-25T16:00',
            rowHeight      : 80,
            barMargin      : 10,
            allowOverlap   : false,
            tickSize       : 100,
            timeResolution : {
                unit      : 'min',
                increment : 30
            },
            snap       : true,
            // Describes the time axis and its headers
            viewPreset : {
                base    : 'hourAndDay',
                headers : [{
                    unit       : 'd',
                    align      : 'center',
                    dateFormat : 'LL'
                }, {
                    unit       : 'h',
                    align      : 'center',
                    dateFormat : 'h A'
                }]
            },
            resourceImages : {
                path      : '../_shared/images/transparent-users/',
                extension : '.png'
            },
            eventColor : null,
            eventStyle : null,
            // Here the features are configured
            features   : {
                stickyEvents      : false,
                // Not using schedule hover tooltip in this demo, nor dependencies
                scheduleTooltip   : false,
                dependencies      : false,
                // For this demo we highlight event calendars
                calendarHighlight : {
                    calendar : 'event',
                    // This method should return the available resources for one or more events
                    collectAvailableResources({
                        eventRecords
                    }) {
                        return getAvailableResources(eventRecords[0]);
                    }
                },
                eventDrag : {
                    constrainDragToResource : false,
                    snapToResource          : true,
                    // This method is used to validate drag drop operations
                    validatorFn({
                        eventRecords,
                        newResource,
                        startDate,
                        endDate
                    }) {
                        const task = eventRecords[0],
                            {
                                calendar
                            } = task,
                            valid = (!calendar || calendar.isWorkingTime(startDate, endDate, true)) && getAvailableResources(task).includes(newResource),
                            message = valid ? '' : 'No available slot';
                        return {
                            valid,
                            message : (valid ? '' : '<i class="fa fa-exclamation-triangle"></i>') + message
                        };
                    }
                },
                eventTooltip : {
                    // A custom HTML template shown in a tooltip when events are hovered
                    template : ({
                        eventRecord
                    }) => `<dl>
                        <dt>${StringHelper.encodeHtml(eventRecord.name)}</dt>
                        <dd>
                             <i class="fa fa-user"></i>${StringHelper.encodeHtml(eventRecord.resource.name)}
                        </dd>
                        <dt>Scheduled at:</dt>
                        <dd>
                            <i class="fa fa-calendar-alt"></i>${DateHelper.format(eventRecord.startDate, 'LST')} - ${DateHelper.format(eventRecord.endDate, 'LST')}
                        </dd>
                        ${eventRecord.calendar ? `
                        <dt>Schedule info:</dt>
                        <dd>
                            <i class="fa fa-calendar-alt"></i>${StringHelper.encodeHtml(eventRecord.calendarInfo)}
                        </dd>` : ''}
                    </dl>`
                },
                taskEdit : {
                    // Change editor title
                    editorConfig : {
                        title : 'Edit'
                    },
                    // Customize its contents
                    items : {
                        generalTab : {
                            items : {
                                // Add a patient field
                                orderField : {
                                    type   : 'text',
                                    name   : 'patient',
                                    label  : 'Patient',
                                    // Place after name field
                                    weight : 150
                                }
                            }
                        }
                    }
                },
                filterBar : true
            },
            // This controls the contents of each event bar. You can return JSON (a DOMConfig object) or a simple HTML string
            eventRenderer({
                eventRecord
            }) {
                return [{
                    children : [{
                        class : 'b-event-name',
                        text  : eventRecord.name
                    }, {
                        class : 'b-patient',
                        text  : `Patient: ${eventRecord.patient || ''}`
                    }]
                }, eventRecord.confirmed ? {
                    tag   : 'i',
                    class : 'fa fa-check'
                } : null];
            },
            columns : [{
                type       : 'resourceInfo',
                text       : 'Doctor',
                width      : 170,
                filterable : {
                    filterField : {
                        triggers : {
                            search : {
                                cls : 'fa fa-filter'
                            }
                        },
                        placeholder : 'Filter staff'
                    }
                }
            }, {
                text   : 'Role',
                field  : 'role',
                editor : false,
                width  : 150
            }],
            // Constrain dragging/resizing events with a single allowed range to that range
            getDateConstraints(resourceRecord, eventRecord) {
                var _eventRecord$calendar;
                const timeRanges = eventRecord === null || eventRecord === undefined || (_eventRecord$calendar = eventRecord.calendar) === null || _eventRecord$calendar === undefined ? undefined : _eventRecord$calendar.getWorkingTimeRanges(this.startDate, this.endDate);
                if ((timeRanges === null || timeRanges === undefined ? undefined : timeRanges.length) === 1) {
                    // If there is just one available time range when the task can be performed, lock
                    // start / end boundaries while dragging
                    return {
                        start : timeRanges[0].startDate,
                        end   : timeRanges[0].endDate
                    };
                }
            },
            listeners : {
                // Don't allow events that can only be assigned to a specific resource to be dragged to another resource
                eventDragStart({
                    eventRecords
                }) {
                    const constrainToResource = configPanel.widgetMap.constrainToResource.checked,
                        availableResources = getAvailableResources(eventRecords[0]);
                    scheduler.features.eventDrag.constrainDragToResource = constrainToResource || availableResources.length === 1;
                },
                eventSelectionChange() {
                    const {
                            selectedEvents
                        } = this,
                        {
                            calendarHighlight
                        } = this.features;
                    if (!calendarHighlight.disabled && selectedEvents.length > 0) {
                        calendarHighlight.highlightEventCalendars(selectedEvents);
                    }
                    else {
                        calendarHighlight.unhighlightCalendars();
                    }
                }
            }
        },
        splitter : {
            type : 'splitter'
        },
        configPanel : {
            type        : 'configpanel',
            width       : 250,
            minWidth    : 250,
            collapsible : true,
            scheduler   : 'up.widgetMap.scheduler'
        }
    }
});
const {
    scheduler,
    configPanel
} = container.widgetMap;