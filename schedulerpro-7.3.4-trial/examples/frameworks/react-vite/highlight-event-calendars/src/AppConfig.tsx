import { type BryntumPanelProps, type BryntumSchedulerProProps } from '@bryntum/schedulerpro-react';
import { type CalendarModel, DateHelper, StringHelper, type SchedulerProListenersTypes, type SlideToggleListenersTypes } from '@bryntum/schedulerpro';
import TaskWithCalendar from './lib/TaskWithCalendar';

// SchedulerPro configuration
export const useschedulerProProps = (
    getAvailableResources : Function,
    eventDragStart : SchedulerProListenersTypes['eventDragStart'],
    eventSelectionChange : SchedulerProListenersTypes['eventSelectionChange']
) : BryntumSchedulerProProps => {
    return {
        flex         : 1,
        // Enables smoother wheel and pinch zooming
        smoothZoom   : true,
        startDate    : '2022-05-25T09:00',
        endDate      : '2022-05-25T16:00',
        rowHeight    : 80,
        barMargin    : 10,
        allowOverlap : false,
        tickSize     : 100,
        snap         : true,
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
        // A project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager,
        // allowing loading data into all stores at once
        project : {
            autoLoad        : true,
            eventModelClass : TaskWithCalendar,
            transport       : {
                load : {
                    url : './data/data.json'
                }
            }
        },
        resourceImages : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        },
        eventColor : null,
        eventStyle : null,

        // Not using schedule hover tooltip in this demo, nor dependencies
        scheduleTooltipFeature   : false,
        dependenciesFeature      : false,
        // For this demo we highlight event calendars
        calendarHighlightFeature : {
            calendar : 'event',
            // This method should return the available resources for one or more events
            collectAvailableResources({ eventRecords }) {
                return getAvailableResources(eventRecords[0]);
            }
        },
        eventDragFeature : {
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
        },
        eventTooltipFeature : {
            // A custom HTML template shown in a tooltip when events are hovered
            template : ({ eventRecord } : { eventRecord : TaskWithCalendar }) =>
                `<dl>
                    <dt>${StringHelper.encodeHtml(eventRecord.name)}</dt>
                    <dd>
                        <i class = "fa fa-user"></i>${StringHelper.encodeHtml(eventRecord.resource.name)}
                    </dd>
                    <dt>Scheduled at : </dt>
                    <dd>
                        <i class = "fa fa-calendar-alt"></i>${DateHelper.format(eventRecord.startDate as Date, 'LST')} - ${DateHelper.format(eventRecord.endDate as Date, 'LST')}
                    </dd>

                    ${eventRecord.calendar ? `
                    <dt>Schedule info : </dt>
                    <dd>
                        <i class = "fa fa-calendar-alt"></i>${StringHelper.encodeHtml(eventRecord.calendarInfo)}
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

        // This controls the contents of each event bar. You can return JSON(a DOMConfig object)
        // or a simple HTML string
        eventRenderer({ eventRecord }) {
            const taskWithCalendar = eventRecord as TaskWithCalendar;
            return [
                {
                    children : [
                        {
                            class : 'b-event-name',
                            text  : eventRecord.name
                        },
                        {
                            class : 'b-patient',
                            text  : `Patient: ${taskWithCalendar.patient || ''}`
                        }
                    ]
                },
                taskWithCalendar.confirmed ? {
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
                taskWithCalendar = eventRecord as TaskWithCalendar,
                calendar         = taskWithCalendar?.calendar as CalendarModel,
                timeRanges       = calendar?.getWorkingTimeRanges(this.startDate as Date, this.endDate as Date);

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
            eventDragStart,
            eventSelectionChange
        }
    };
};

// Panel configuration
export const usePanelProps = (
    onPanelSlideToggleChange: SlideToggleListenersTypes['change']
) : BryntumPanelProps => {
    return {
        width       : 250,
        minWidth    : 250,
        collapsible : true,
        title       : 'Configuration',
        cls         : 'config-panel',
        items       : {
            // Toggle features on/off (or rather disable/enable)
            features : {
                type     : 'container',
                defaults : {
                    type      : 'slidetoggle',
                    cls       : 'b-blue',
                    listeners : {
                        change : onPanelSlideToggleChange
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
