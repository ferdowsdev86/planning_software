import { type CalendarHighlightConfig, type CalendarModel, DateHelper, type EventDragConfig, type EventTooltipConfig, type SchedulerProListenersTypes, type SlideToggleListenersTypes, StringHelper, type TaskEditConfig } from '@bryntum/schedulerpro';
import type { BryntumPanelProps, BryntumSchedulerProProps } from '@bryntum/schedulerpro-vue-3';
import TaskWithCalendar from './lib/TaskWithCalendar';

// SchedulerPro configuration
export const useschedulerProProps = (
    eventDragStart: SchedulerProListenersTypes['eventDragStart'],
    eventSelectionChange: SchedulerProListenersTypes['eventSelectionChange']
): BryntumSchedulerProProps => {
    return {
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
        // Describes the time axis and its headers
        viewPreset   : {
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
        // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing loading data into all stores at once
        project : {
            autoLoad        : true,
            eventModelClass : TaskWithCalendar,
            loadUrl         : './data/data.json'
        },
        resourceImagePath : './users/',
        eventColor        : null,
        eventStyle        : null,

        // This controls the contents of each event bar. You can return JSON (a DOMConfig object) or a simple HTML string
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
        getDateConstraints(_resourceRecord, eventRecord) {
            const
                record     = eventRecord as TaskWithCalendar,
                calendar   = record?.calendar as CalendarModel,
                timeRanges = calendar?.getWorkingTimeRanges(this.startDate as Date, this.endDate as Date);

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
            eventDragStart,
            eventSelectionChange
        }
    };
};

// Configurations for features in the SchedulerPro

// For this demo we highlight event calendars
export const useCalendarHighlightProps = (getAvailableResources: Function): CalendarHighlightConfig => {
    return {
        calendar : 'event',
        // This method should return the available resources for one or more events
        collectAvailableResources({ eventRecords }) {
            return getAvailableResources(eventRecords[0]);
        }
    };
};

export const useEventDragProps = (
    getAvailableResources: Function
): EventDragConfig => {
    return {
        constrainDragToResource : false,
        snapToResource          : true,
        // This method is used to validate drag drop operations
        validatorFn({ eventRecords, newResource, startDate, endDate }) {
            const
                task         = eventRecords[0] as TaskWithCalendar,
                calendar     = task.calendar as CalendarModel,
                valid        = (!calendar || calendar.isWorkingTime(startDate, endDate)) && getAvailableResources(task).includes(newResource),
                message      = valid ? '' : 'No available slot';

            return {
                valid,
                message : (valid ? '' : '<i class="fa fa-exclamation-triangle"></i>') + message
            };
        }
    };
};

export const useEventTooltipProps = (): EventTooltipConfig => {
    return {
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
    };
};

export const useTaskEditProps = (): TaskEditConfig => {
    return {
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
    };
};

// Panel configuration
export const usePanelProps = (
    onSlideToggleChange: SlideToggleListenersTypes['change']
): BryntumPanelProps => {
    return {
        width       : 250,
        minWidth    : 250,
        collapsible : true,
        title       : 'Configuration',
        cls         : 'b-config-panel',
        items       : {
            // Toggle features on/off (or rather disable/enable)
            features : {
                type     : 'container',
                defaults : {
                    type      : 'slidetoggle',
                    cls       : 'b-blue',
                    listeners : {
                        change : onSlideToggleChange
                    }
                },
                items : {
                    enableDragDrop      : { text : 'Enable task drag drop', checked : true },
                    highlight           : { text : 'Enable highlighting', checked : true },
                    constrainToResource : { text : 'Constrain drag to row', checked : false },
                    snap                : { text : 'Snap to grid', checked : true }
                }
            }
        }
    };
};
