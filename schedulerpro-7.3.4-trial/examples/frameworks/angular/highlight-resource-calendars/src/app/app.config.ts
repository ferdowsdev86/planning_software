import { type CalendarModel, type Checkbox, DateHelper, type Grid, type Model, type Panel, ResourceModel, type SchedulerPro, type SchedulerResourceModel, StringHelper } from '@bryntum/schedulerpro';
import { type BryntumPanelProps, type BryntumSchedulerProProps } from '@bryntum/schedulerpro-angular';
import Appointment from 'src/lib/Appointment';

class AppResourceModel extends ResourceModel {
    declare role : string;
}

export const config: {
    schedulerPro?: SchedulerPro
    panel?: Panel
} = {};

// Helper method used to get available resources
const getAvailableResources = (eventRecord : Appointment) => {
    return config.schedulerPro!.resourceStore.query(record =>
        (record as AppResourceModel).role === eventRecord.requiredRole || !eventRecord.requiredRole);
};

export const schedulerProProps : BryntumSchedulerProProps = {
    flex       : 1,
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
    // loading data into all stores at once
    project    : {
        autoLoad        : true,
        eventModelClass : Appointment,
        loadUrl         : 'assets/data/data.json'
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
        ],
        timeResolution : {
            unit      : 'min',
            increment : 20
        }
    },
    resourceImagePath : 'assets/users/',
    eventColor        : null,
    eventStyle        : null,

    // Not using schedule hover tooltip in this demo, nor dependencies
    scheduleTooltipFeature   : false,
    dependenciesFeature      : false,
    // For this demo we highlight resource calendars
    calendarHighlightFeature : {
        calendar : 'resource',
        // This method should return the available resources for one or more events
        collectAvailableResources({ eventRecords }) {
            const eventRecord = eventRecords[0] as Appointment;
            return getAvailableResources(eventRecord) as SchedulerResourceModel[];
        }
    },
    eventDragFeature : {
        constrainDragToResource : false,
        snapToResource          : true,
        // This method is used to validate drag drop operations
        validatorFn({ eventRecords, newResource, startDate, endDate }) {
            const
                task     = eventRecords[0] as Appointment,
                calendar = (newResource as ResourceModel).calendar as CalendarModel,
                valid    = (!calendar || calendar.isWorkingTime(startDate, endDate)) && getAvailableResources(task).includes(newResource),
                message  = valid ? '' : 'No available slot';

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
                ${(eventRecord as Appointment).requiredRole ? `
                    <dt>Required role:</dt>
                    <dd>
                        <i class="fa fa-user-cog"></i>${StringHelper.encodeHtml((eventRecord as Appointment).requiredRole)}
                    </dd>` : ''}
                </dl>`
    },
    filterBarFeature : true,

    // This controls the contents of each event bar. You can return JSON (a BryntumDOMProps object) or a simple HTML string
    eventRenderer({ eventRecord }) {
        const record = eventRecord as Appointment;
        return [
            {
                children : [
                    {
                        class : 'b-event-name',
                        html  : StringHelper.encodeHtml(record.name)
                    },
                    {
                        class : 'b-patient',
                        html  : `Patient: ${StringHelper.encodeHtml(record.patient)}`
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
            renderer   : ({ record, grid } : { record : Model; grid : Grid }) => {
                const
                    scheduler  = grid as SchedulerPro,
                    calendar   = (record as ResourceModel)?.calendar as CalendarModel,
                    timeRanges = calendar?.getWorkingTimeRanges?.(scheduler.startDate, scheduler.endDate);

                if (timeRanges?.length) {
                    const range = timeRanges[0];
                    return `${DateHelper.format(range.startDate, 'k')} - ${DateHelper.format(range.endDate, 'k')}`;
                }
                return '';
            }
        }
    ],

    // Constrain dragging/resizing events with a single allowed range to that range
    getDateConstraints(resourceRecord) {
        const
            calendar   = (resourceRecord as ResourceModel)?.calendar as CalendarModel,
            timeRanges = calendar?.getWorkingTimeRanges(this.startDate as Date, this.endDate as Date);

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
                availableResources  = getAvailableResources(eventRecords[0] as Appointment);

            config.schedulerPro!.features.eventDrag.constrainDragToResource = constrainToResource || availableResources.length === 1;
        },

        selectionChange() {
            const
                { selectedRecords, features } = config.schedulerPro!,
                { calendarHighlight }         = features;

            if (!calendarHighlight.disabled && selectedRecords.length > 0) {
                calendarHighlight.highlightResourceCalendars(selectedRecords as SchedulerResourceModel[]);
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

