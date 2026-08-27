import shared from '../_shared/shared.module.js';
import { EventModel, Panel, Container, StringHelper, DateHelper } from '../../build/schedulerpro.module.js';
//region "lib/Appointment.js"

// A custom appointment class with a few extra fields
class Appointment extends EventModel {
    static get fields() {
        return [
            'patient',
            'confirmed',
            'requiredRole',
            // override field defaultValue to hours
            { name : 'durationUnit', defaultValue : 'h' }
        ];
    }
}

Appointment.initClass();

//endregion

//region "lib/ConfigPanel.js"

// Custom panel that allows easy live configuring
class ConfigPanel extends Panel {
    static type = 'configpanel';

    static configurable = {
        scheduler : null,
        title     : 'Configuration',
        cls       : 'config-panel',
        // Toggle features on/off (or rather disable/enable)
        defaults  : {
            type      : 'slidetoggle',
            cls       : 'b-blue',
            listeners : {
                change({ source }) {
                    const
                        { value }   = source,
                        scheduler   = this.up('configpanel').scheduler;

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
        items : {
            enableDragDrop      : { text : 'Enable task drag drop', checked : true },
            highlight           : { text : 'Enable highlighting', checked : true },
            constrainToResource : { text : 'Constrain drag to row', checked : false },
            snap                : { text : 'Snap to grid', checked : true }
        }
    };

    get highlightOnHover() {
        return this.widgetMap.highlightOnHover.checked;
    }
}

ConfigPanel.initClass();

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
            type       : 'schedulerpro',
            // Enables smoother wheel and pinch zooming
            smoothZoom : true,
            flex       : 1,
            // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
            // loading data into all stores at once
            project    : {
                autoLoad        : true,
                eventModelClass : Appointment,
                loadUrl         : './data/data.json'
            },
            startDate    : new Date(2022, 4, 25, 6),
            endDate      : new Date(2022, 4, 25, 19),
            rowHeight    : 80,
            barMargin    : 10,
            allowOverlap : false,
            visibleDate  : {
                date  : new Date(2022, 4, 25, 8),
                block : 'start'
            },
            timeResolution : {
                unit      : 'min',
                increment : 20
            },
            snap       : true,
            tickSize   : 150,
            // Describes the time axis and its headers
            viewPreset : {
                base    : 'hourAndDay',
                headers : [
                    {
                        unit       : 'd',
                        align      : 'center',
                        dateFormat : 'LL'
                    },
                    {
                        unit       : 'h',
                        align      : 'center',
                        dateFormat : 'h A'
                    }
                ]
            },
            resourceImages : {
                path      : '../_shared/images/transparent-users/',
                extension : '.png'
            },
            eventColor : null,
            eventStyle : null,

            features : {
                stickyEvents      : false,
                // Not using schedule hover tooltip in this demo, nor dependencies
                scheduleTooltip   : false,
                dependencies      : false,
                // For this demo we highlight resource calendars
                calendarHighlight : {
                    calendar : 'resource',
                    // This method should return the available resources for one or more events
                    collectAvailableResources({ scheduler, eventRecords }) {
                        return getAvailableResources(eventRecords[0]);
                    }
                },
                eventDrag : {
                    constrainDragToResource : false,
                    snapToResource          : true,
                    // This method is used to validate drag drop operations
                    validatorFn({ eventRecords, newResource, startDate, endDate }) {
                        const
                            task         = eventRecords[0],
                            { calendar } = newResource,
                            valid        = (!calendar || calendar.isWorkingTime(startDate, endDate, true)) && getAvailableResources(task).includes(newResource),
                            message      = valid ? '' : 'No available slot';

                        return {
                            valid,
                            message : (valid ? '' : '<i class="fa fa-exclamation-triangle"></i>') + message
                        };
                    }
                },
                eventTooltip : {
                    // A custom HTML template shown in a tooltip when events are hovered
                    template : ({ eventRecord }) => `<dl>
                        <dt>${StringHelper.encodeHtml(eventRecord.name)}</dt>
                        <dd>
                             <i class="fa fa-user"></i>${StringHelper.encodeHtml(eventRecord.resource.name)}
                        </dd>
                        <dt>Scheduled at:</dt>
                        <dd>
                            <i class="fa fa-calendar-alt"></i>${DateHelper.format(eventRecord.startDate, 'LST')} - ${DateHelper.format(eventRecord.endDate, 'LST')}
                        </dd>
                        ${eventRecord.requiredRole ? `
                        <dt>Required role:</dt>
                        <dd>
                            <i class="fa fa-user-cog"></i>${StringHelper.encodeHtml(eventRecord.requiredRole)}
                        </dd>` : ''}
                    </dl>`
                },
                filterBar : true
            },

            // This controls the contents of each event bar. You can return JSON (a DOMConfig object) or a simple HTML string
            eventRenderer({ eventRecord }) {
                return [
                    {
                        children : [
                            {
                                class : 'b-event-name',
                                html  : StringHelper.encodeHtml(eventRecord.name)
                            },
                            {
                                class : 'b-patient',
                                html  : `Patient: ${StringHelper.encodeHtml(eventRecord.patient)}`
                            }
                        ]
                    },
                    eventRecord.confirmed ? {
                        tag   : 'i',
                        class : 'fa fa-check'
                    } : null
                ];
            },

            columns : [
                {
                    type           : 'resourceInfo',
                    text           : 'Doctor',
                    width          : 200,
                    showEventCount : false,
                    showRole       : true,
                    filterable     : {
                        filterField : {
                            triggers : {
                                search : {
                                    cls : 'fa fa-filter'
                                }
                            },
                            placeholder : 'Filter staff'
                        }
                    }
                },
                {
                    text       : 'Work hours',
                    width      : 120,
                    editor     : false,
                    filterable : false,
                    align      : 'right',
                    renderer   : ({ record, grid: scheduler }) => {
                        const timeRanges = record.calendar?.getWorkingTimeRanges?.(scheduler.startDate, scheduler.endDate);
                        if (timeRanges?.length) {
                            const range = timeRanges[0];
                            return `${DateHelper.format(range.startDate, 'k')} - ${DateHelper.format(range.endDate, 'k')}`;
                        }
                    }
                }
            ],

            // Constrain dragging/resizing events with a single allowed range to that range
            getDateConstraints(resourceRecord) {
                const timeRanges = resourceRecord?.calendar?.getWorkingTimeRanges?.(this.startDate, this.endDate);
                if (timeRanges?.length === 1) {
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
                eventDragStart({ source : scheduler, eventRecords }) {
                    const
                        constrainToResource = configPanel.widgetMap.constrainToResource.checked,
                        availableResources  = getAvailableResources(eventRecords[0]);

                    scheduler.features.eventDrag.constrainDragToResource = constrainToResource || availableResources.length === 1;
                },

                selectionChange() {
                    const
                        { selectedRecords }   = this,
                        { calendarHighlight } = this.features;

                    if (!calendarHighlight.disabled && selectedRecords.length > 0) {
                        calendarHighlight.highlightResourceCalendars(selectedRecords);
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

const
    { scheduler, configPanel } = container.widgetMap;
