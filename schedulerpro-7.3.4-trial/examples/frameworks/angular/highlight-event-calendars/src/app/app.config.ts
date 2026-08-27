import { type CalendarModel, type Checkbox, DateHelper, type Panel, ResourceModel, type SchedulerPro, StringHelper } from '@bryntum/schedulerpro';
import { type BryntumPanelProps, type BryntumSchedulerProProps } from '@bryntum/schedulerpro-angular';
import TaskWithCalendar from 'src/lib/TaskWithCalendar';

class AppResource extends ResourceModel {
    declare role : string;
}

export const config: {
    schedulerPro?: SchedulerPro
    panel?: Panel
} = {};

// Helper method used to get available resources
const getAvailableResources = (eventRecord : TaskWithCalendar) => {
    return config.schedulerPro!.resourceStore.query(record =>
        (record as AppResource).role === eventRecord.requiredRole || !eventRecord.requiredRole);
};

export const schedulerProProps : BryntumSchedulerProProps = {
    flex         : 1,
    startDate    : '2022-05-25T09:00',
    endDate      : '2022-05-25T16:00',
    rowHeight    : 80,
    barMargin    : 10,
    allowOverlap : false,
    tickSize     : 100,
    snap         : true,
    // Enables smoother wheel and pinch zooming
    smoothZoom   : true,
    // A project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager,
    // allowing loading data into all stores at once
    project      : {
        autoLoad        : true,
        eventModelClass : TaskWithCalendar,
        loadUrl         : 'assets/data/data.json'
    },
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
        ],
        timeResolution : {
            unit      : 'min',
            increment : 30
        }
    },

    resourceImagePath : 'assets/users/',

    eventColor : null,
    eventStyle : null,

    // Not using schedule hover tooltip in this demo, nor dependencies
    scheduleTooltipFeature   : false,
    dependenciesFeature      : false,
    // For this demo we highlight event calendars
    calendarHighlightFeature : {
        calendar : 'event',
        // SchedulerPro calendarHighlight feature method, it should return the available resources for one or more events
        collectAvailableResources({ scheduler, eventRecords }) {
            const eventRecord = eventRecords[0] as TaskWithCalendar;
            return scheduler.resourceStore.query(record =>
                (record as AppResource).role === eventRecord.requiredRole || !eventRecord.requiredRole) as ResourceModel[];
        }
    },
    eventDragFeature : {
        constrainDragToResource : false,
        snapToResource          : true,

        // SchedulerPro eventDrag feature method, it is used to validate drag drop operations
        validatorFn({ eventRecords, newResource, startDate, endDate }) : object | boolean {
            const
                task         = eventRecords[0] as TaskWithCalendar,
                { calendar } = task,
                calendarModel = calendar as CalendarModel,
                valid        = (!calendarModel || calendarModel.isWorkingTime(startDate, endDate)) && getAvailableResources(task).includes(newResource),
                message      = valid ? '' : 'No available slot';

            return {
                valid,
                message : (valid ? '' : '<i class="fa fa-exclamation-triangle"></i>') + message
            };
        }
    },

    eventTooltipFeature : {
        // A custom HTML template shown in a tooltip when events are hovered
        template : ({ eventRecord }) =>
            `<dl>
                    <dt>${StringHelper.encodeHtml(eventRecord.name)}</dt>
                    <dd>
                        <i class="fa fa-user"></i>${StringHelper.encodeHtml(eventRecord.resource.name)}
                    </dd>
                    <dt>Scheduled at:</dt>
                    <dd>
                        <i class="fa fa-calendar-alt"></i>${DateHelper.format(eventRecord.startDate as Date, 'LST')} - ${DateHelper.format(eventRecord.endDate as Date, 'LST')}
                    </dd>
                    ${(eventRecord as TaskWithCalendar).calendar ? `
                    <dt>Schedule info:</dt>
                    <dd>
                        <i class="fa fa-calendar-alt"></i>${StringHelper.encodeHtml((eventRecord as TaskWithCalendar).calendarInfo)}
                    </dd>` : ''}
                </dl>`
    },
    taskEditFeature : {
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
    filterBarFeature : true,

    // This controls the contents of each event bar. You can return JSON (a BryntumDOMProps object) or a simple HTML string
    eventRenderer({ eventRecord }) {
        const record = eventRecord as TaskWithCalendar;
        return [
            {
                children : [
                    {
                        class : 'b-event-name',
                        text  : eventRecord.name
                    },
                    {
                        class : 'b-patient',
                        text  : `Patient: ${record.patient || ''}`
                    }
                ]
            },
            record.confirmed ? {
                tag   : 'i',
                class : 'fa fa-check'
            } : null
        ];
    },

    columns : [
        {
            type       : 'resourceInfo',
            text       : 'Doctor',
            width      : 150,
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
        },
        {
            text   : 'Role',
            field  : 'role',
            editor : false,
            width  : 150
        }
    ],

    // Constrain dragging/resizing events with a single allowed range to that range
    getDateConstraints(_resourceRecord?, eventRecord?) {
        const
            task       = eventRecord as TaskWithCalendar,
            timeRanges = (task.calendar as CalendarModel)?.getWorkingTimeRanges(this.startDate as Date, this.endDate as Date);
        if (timeRanges?.length === 1) {
            // If there is just one available time range when the task can be performed, lock
            // start / end boundaries while dragging
            return {
                start : timeRanges[0].startDate,
                end   : timeRanges[0].endDate
            };
        }
        return {};
    },

    listeners : {
        // Don't allow events that can only be assigned to a specific resource to be dragged to another resource
        eventDragStart({ eventRecords }) {
            const
                constrainToResource = (config.panel!.widgetMap['constrainToResource'] as Checkbox).checked,
                availableResources  = getAvailableResources(eventRecords[0] as TaskWithCalendar);

            config.schedulerPro!.features.eventDrag.constrainDragToResource = constrainToResource || availableResources.length === 1;
        },

        eventSelectionChange() {
            const
                { selectedEvents, features } = config.schedulerPro!,
                { calendarHighlight }        = features;

            if (!calendarHighlight.disabled && selectedEvents.length > 0) {
                calendarHighlight.highlightEventCalendars(selectedEvents);
            }
            else {
                calendarHighlight.unhighlightCalendars();
            }
        }
    }
};

export const panelProps : BryntumPanelProps = {
    width       : 250,
    minWidth    : 250,
    collapsible : true,
    title       : 'Configuration',
    cls         : 'config-panel'
};
