import shared from '../_shared/shared.module.js';
import { EventModel, ResourceModel, DateHelper, DragHelper, StringHelper, DomHelper, SchedulerPro, Toast, Grid, Splitter } from '../../build/schedulerpro.module.js';
//region "lib/Appointment.js"

// Custom Appointment model, based on EventModel with additional fields and changed defaults
class Appointment extends EventModel {
    static fields = [
        'patient',
        'requiredRole',
        // override field defaultValue to hours
        { name : 'durationUnit', defaultValue : 'h' }
    ];
}

//endregion

//region "lib/Doctor.js"

// Custom Doctor resource model, based on ResourceModel with additional fields
class Doctor extends ResourceModel {
    static fields = [
        'role',
        'roleIconCls'
    ];
}

//endregion

//region "lib/Drag.js"

// Handles dragging unscheduled appointment from the grid onto the schedule
class Drag extends DragHelper {
    static configurable = {
        // A reference to the outside Scheduler instance
        schedule : null,

        callOnFunctions      : true,
        autoSizeClonedTarget : false,
        unifiedProxy         : true,

        // Prevent removing proxy on drop, we adopt it for usage in the Schedule
        removeProxyAfterDrop : false,

        // Don't drag the actual row element, clone it
        cloneTarget        : true,
        // Only allow drops on the schedule area
        dropTargetSelector : '.b-timeline-sub-grid',
        // Only allow drag of row elements inside on the unplanned grid
        targetSelector     : '.b-grid-row:not(.b-group-row)'
    };

    afterConstruct() {
        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(grabbedElement, initialXY) {
        const
            { context, schedule, grid } = this,
            draggedAppointment          = grid.getRecordFromElement(grabbedElement),
            durationInPixels            = schedule.timeAxisViewModel.getDistanceForDuration(draggedAppointment.durationMS),
            proxy                       = document.createElement('div');

        proxy.style.cssText = '';

        if (schedule.isHorizontal) {
            Object.assign(proxy.style, {
                width    : `${durationInPixels}px`,
                maxWidth : `${schedule.timeAxisSubGrid.width}px`,
                height   : `${schedule.rowHeight - 2 * schedule.resourceMargin}px`
            });

            if (schedule.timeAxisSubGrid.width < durationInPixels) {
                proxy.classList.add('b-exceeds-axis-width');
            }
        }
        else {
            Object.assign(proxy.style, {
                height    : `${durationInPixels}px`,
                maxHeight : `${schedule.timeAxisSubGrid.height}px`,
                width     : `${schedule.resourceColumnWidth - 2 * schedule.resourceMargin}px`
            });
        }

        // Fake an event bar
        proxy.classList.add('b-bryntum', 'b-sch-event-wrap', 'b-style-traced', 'b-unassigned-class', schedule.isHorizontal ? 'b-sch-horizontal' : 'b-sch-vertical');
        proxy.innerHTML = StringHelper.xss`
            <div class="b-sch-event b-has-content b-sch-event-with-icon">
                <div class="b-sch-event-content">
                    <i class="fa ${draggedAppointment.iconCls}"></i>
                    <div>
                        <div>${draggedAppointment.name}</div>
                        <div class="patient-name">Patient: ${draggedAppointment.patient || ''}</div>
                    </div>
                </div>
            </div>
        `;

        let totalDuration = 0;

        grid.selectedRecords.forEach(appointment => totalDuration += appointment.duration);

        context.totalDuration = totalDuration;

        return proxy;
    }

    onDragStart({ context }) {
        const
            me                         = this,
            { schedule, grid }         = me,
            { selectedRecords, store } = grid,
            appointment                = grid.getRecordFromElement(context.grabbed);

        // save a reference to the appointments being dragged so we can access them later
        context.appointments    = selectedRecords.slice();
        context.relatedElements = selectedRecords.sort((r1, r2) => store.indexOf(r1) - store.indexOf(r2)).map(rec => rec !== appointment && grid.rowManager.getRowFor(rec).element).filter(el => el);

        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        // Prevent tooltips from showing while dragging
        schedule.features.eventTooltip.disabled = true;
    }

    onDrag({ event, context }) {
        const
            { schedule }                    = this,
            { appointments, totalDuration } = context,
            coordinate                      = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
            requiredRole                    = appointments[0].requiredRole,
            newStartDate                    = schedule.getDateFromCoordinate(coordinate, 'round', false, true),
            lastAppointmentEndDate          = newStartDate && DateHelper.add(newStartDate, totalDuration, appointments[0].durationUnit),
            doctor                          = context.target && schedule.resolveResourceRecord(context.target, [event.offsetX, event.offsetY]),
            calendar                        = doctor?.effectiveCalendar;

        context.newStartDate = newStartDate;
        // Only allow drops on the timeaxis
        context.valid        = Boolean(newStartDate &&
            // Require a resource with matching role
            (!requiredRole || doctor?.role === requiredRole) &&
            // Ensure we don't break allowOverlap config
            (schedule.allowOverlap || schedule.isDateRangeAvailable(newStartDate, lastAppointmentEndDate, null, doctor) &&
                // Respect resource's working time
                (!calendar || calendar.isWorkingTime(newStartDate, lastAppointmentEndDate, true))));

        // Save reference to the doctor so we can use it in onAppointmentDrop
        context.doctor = doctor;
    }

    // Drop callback after a mouse up, take action and transfer the unplanned appointment to the real EventStore (if it's valid)
    async onDrop({ context }) {
        const
            me           = this,
            { schedule } = me;

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (context.valid) {
            const
                { appointments, element, relatedElements = [], doctor, newStartDate } = context,
                eventBarEls                                                           = [element, ...relatedElements];

            for (let i = 0; i < appointments.length; i++) {
                // We hand over the data + existing element to the Scheduler so it do the scheduling
                // await is used so that we have a reliable end date in the case of multiple event drag
                await schedule.scheduleEvent({
                    eventRecord    : appointments[i],
                    // When dragging multiple appointments, add them back to back + assign to resource
                    startDate      : i === 0 ? newStartDate : appointments[i - 1].endDate,
                    // Assign to the doctor (resource) it was dropped on
                    resourceRecord : doctor,
                    element        : eventBarEls[i]
                });
            }
        }

        schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);
        schedule.features.eventTooltip.disabled = false;
    }

    updateSchedule(schedule) {
        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = schedule.scrollManager;
    }
}

//endregion

//region "lib/Schedule.js"

// Customized scheduler displaying hospital appointments
class Schedule extends SchedulerPro {
    static $name = 'Schedule';

    static configurable = {
        resourceColumns : {
            columnWidth : 220
        },
        rendition : {
            button : 'text'
        },
        resourceImages : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        },
        features : {
            stripe      : true,
            columnLines : true,
            filterBar   : {
                compactMode : true
            },
            calendarHighlight : {
                calendar : 'resource',
                // This method is provided to determine which resources are available for one or more eventRecords,
                // in order to highlight the right availability intervals
                collectAvailableResources({ scheduler, eventRecords }) {
                    const draggedAppointment = eventRecords[0];
                    return scheduler.resourceStore.query(resourceRecord => resourceRecord.role === draggedAppointment.requiredRole || !draggedAppointment.requiredRole);
                }
            },
            // Configure event menu items with correct phrases (could also be done through localization)
            eventMenu : {
                items : {
                    deleteEvent : {
                        text : 'Delete appointment'
                    },
                    unassignEvent : {
                        text : 'Unschedule appointment'
                    }
                }
            },
            eventDrag : {
                // Validation method, called as you drag events around in the schedule
                validatorFn({ eventRecords, newResource, startDate, endDate }) {
                    const
                        task         = eventRecords[0],
                        { calendar } = newResource,
                        valid        = newResource.role === task.requiredRole && (!calendar || calendar.isWorkingTime(startDate, endDate, true)),
                        message      = valid ? '' : 'No available slot';

                    return {
                        valid,
                        message : (valid ? '' : '<i class="fa fa-exclamation-triangle"></i>') + message
                    };
                }
            },
            taskEdit : {
                editorConfig : {
                    title : 'Appointment'
                },

                // Customize its contents inside the General tab
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
            }
        },

        rowHeight           : 80,
        barMargin           : 10,
        eventStyle          : 'traced',
        eventColor          : 'indigo',
        allowOverlap        : false,
        useInitialAnimation : false,
        // Define the columns to use
        columns             : [
            {
                type           : 'resourceInfo',
                text           : 'Doctor',
                width          : 220,
                showEventCount : false,
                showMeta       : ({ role, roleIconCls }) => `<i class="${roleIconCls}"></i>${role}`,
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
                text       : 'Hours',
                editor     : false,
                filterable : false,
                sortable   : false,
                width      : 110,
                align      : 'right',
                renderer   : ({ record, grid: scheduler }) => {
                    const ranges = record.calendar?.getWorkingTimeRanges?.(scheduler.startDate, scheduler.endDate);
                    if (ranges?.length) {
                        const range = ranges[0];
                        return `${DateHelper.format(range.startDate, 'K')} - ${DateHelper.format(range.endDate, 'K')}`;
                    }
                }
            }
        ],

        // Custom view preset with header configuration
        viewPreset : {
            base           : 'hourAndDay',
            columnLinesFor : 1,
            headers        : [
                {
                    unit       : 'd',
                    align      : 'center',
                    dateFormat : 'dddd'
                },
                {
                    unit       : 'h',
                    align      : 'center',
                    dateFormat : 'HH'
                }
            ]
        },

        tbar : [
            {
                text      : 'Save',
                width     : 100,
                rendition : 'filled',
                ref       : 'saveButton',
                disabled  : true,
                onAction  : 'up.onSave'
            },
            {
                type         : 'combo',
                ref          : 'preset',
                editable     : false,
                label        : 'Show',
                value        : 1,
                valueField   : 'value',
                displayField : 'name',
                items        : [
                    {
                        name   : '1 day',
                        value  : 1,
                        preset : {
                            base      : 'hourAndDay',
                            tickWidth : 45
                        }
                    },
                    {
                        name   : '3 days',
                        value  : 3,
                        preset : {
                            base : 'dayAndWeek'
                        }
                    },
                    {
                        name   : '1 week',
                        value  : 7,
                        preset : {
                            base : 'dayAndWeek'
                        }
                    }
                ],
                onSelect : 'up.onRangeSelect'
            },
            '->',
            {
                type  : 'buttongroup',
                items : [
                    {
                        icon     : 'fa fa-chevron-left',
                        onAction : 'up.onPreviousDayClick'
                    },
                    {
                        type     : 'button',
                        text     : 'Today',
                        onAction : 'up.onTodayClick'
                    },
                    {
                        icon     : 'fa fa-chevron-right',
                        onAction : 'up.onNextDayClick'
                    }
                ]
            },
            '->',
            {
                type        : 'buttonGroup',
                rendition   : 'padded',
                toggleGroup : true,
                items       : [
                    {
                        icon            : 'fa fa-fw fa-arrows-alt-v',
                        pressed         : 'up.isVertical',
                        tooltip         : 'Vertical mode',
                        schedulerConfig : {
                            mode           : 'vertical',
                            tickSize       : 100,
                            subGridConfigs : {
                                locked : {
                                    width    : 100,
                                    minWidth : 100,
                                    flex     : null
                                }
                            }
                        }
                    },
                    {
                        icon            : 'fa fa-fw fa-arrows-alt-h',
                        pressed         : 'up.isHorizontal',
                        tooltip         : 'Horizontal mode',
                        schedulerConfig : {
                            mode           : 'horizontal',
                            subGridConfigs : { }
                        }
                    }
                ],
                onAction : 'up.onModeSwitchButton'
            }
        ]
    };

    construct(config = {}) {
        super.construct(config);

        this.project.on({
            change() {
                this.widgetMap.saveButton.disabled = !this.eventStore.changes;
            },
            thisObj : this
        });
    }

    // Return a DOM config object for what to show inside the event bar (you can return an HTML string too)
    eventRenderer({ eventRecord }) {
        return [
            {
                children : [
                    {
                        class : 'b-event-name',
                        text  : eventRecord.name
                    },
                    {
                        class : 'patient-name',
                        html  : StringHelper.xss`Patient: ${eventRecord.patient || ''}`
                    }
                ]
            }
        ];
    }

    onModeSwitchButton({ source: button }) {
        this.trigger('modeSwitch', { modeConfig : button.schedulerConfig });
    }

    onSave() {
        Toast.show('TODO: Save data (see onSave() event for SchedulerPro)');
        // console.log('Changes:', this.project.changes);
    }

    onRangeSelect({ record }) {
        const
            me        = this,
            value     = record.value,
            startDate = DateHelper.add(DateHelper.clearTime(me.startDate), me.startHour, 'h'),
            endDate   = DateHelper.add(startDate, value - 1, 'd');

        endDate.setHours(me.endHour);

        me.viewPreset = record.preset;
        me.setTimeSpan(startDate, endDate);
        // reset scroll
        me.scrollLeft = 0;
    }

    onNextDayClick() {
        this.shiftNext();
    }

    onTodayClick() {
        const startDate = DateHelper.clearTime(new Date());

        this.setTimeSpan(DateHelper.add(startDate, this.startHour, 'h'), DateHelper.add(startDate, this.endHour, 'h'));
    }

    onPreviousDayClick() {
        this.shiftPrevious();
    }
}

//endregion

//region "lib/UnplannedGrid.js"

// Custom grid that holds unassigned appointments
class UnplannedGrid extends Grid {
    static $name = 'UnplannedGrid';

    static configurable = {
        rendition : {
            button : 'text'
        },
        selectionMode : {
            cell : false
        },
        features : {
            stripe : true,
            sort   : 'name',
            group  : {
                headerHeight : 40,
                field        : 'requiredRole',
                renderer({ groupRowFor, column }) {
                    if (column.parentIndex === 0) {
                        return `Tasks for ${groupRowFor}`;
                    }
                }
            }
        },

        columns : [
            {
                type     : 'template',
                text     : 'Appointment',
                flex     : 1,
                cellCls  : 'unscheduledNameCell',
                template : ({ record: appointment }) => `
                        <i class="fa fa-${appointment.iconCls || 'question'}"></i>
                        <div class="name-container">
                            <span>${StringHelper.encodeHtml(appointment.name)}</span>
                            <span class="patient-name">Patient: ${appointment.patient || '?'}</span>
                        </div>
                    `
            },
            {
                text   : 'Required role',
                field  : 'requiredRole',
                hidden : true
            }, {
                icon     : 'fa fa-clock',
                width    : 80,
                align    : 'center',
                editor   : 'duration',
                field    : 'fullDuration',
                renderer : ({ record }) => `${record.duration ?? 0} ${record.durationUnit}`
            }
        ],

        tbar : [
            {
                type : 'widget',
                tag  : 'strong',
                html : 'Unplanned appointments',
                flex : 1
            },
            {
                icon     : 'fa fa-angle-double-down',
                cls      : 'b-transparent',
                tooltip  : 'Expand all groups',
                onAction : 'up.expandAll'
            },
            {
                icon     : 'fa fa-angle-double-up',
                cls      : 'b-transparent',
                tooltip  : 'Collapse all groups',
                onAction : 'up.collapseAll'
            }
        ],

        rowHeight : 65,

        disableGridRowModelWarning : true
    };

    set project(project) {
        // Create a chained version of the event store as our store. It will be filtered to only display events that
        // lack assignments
        this.store = project.eventStore.chain(eventRecord => !eventRecord.assignments.length);

        // When assignments change, update our chained store to reflect the changes
        project.assignmentStore.on({
            change() {
                this.store.fillFromMaster();
            },
            thisObj : this
        });
    }
}

//endregion

// Displays planned sessions
let schedule = new Schedule({
    ref         : 'schedule',
    insertFirst : 'main',
    // Enables smoother wheel and pinch zooming
    smoothZoom  : true,
    startDate   : new Date(2022, 2, 1, 7),
    endDate     : new Date(2022, 2, 1, 19),
    flex        : 1,

    // Some variables used in this demo
    startHour : 7,
    endHour   : 20,

    project : {
        autoLoad           : true,
        eventModelClass    : Appointment,
        resourceModelClass : Doctor,
        resourceStore      : {
            sorters : [{ field : 'name', ascending : true }]
        },
        eventStore : {
            // Unassigned events should remain in store
            removeUnassignedEvent : false
        },
        loadUrl : 'data/data.json'
    },
    onModeSwitch({ modeConfig }) {
        const newConfig = { ...this.initialConfig, ...modeConfig };

        // Recreate the scheduler to switch orientation
        this.destroy();

        // Provide drag helper and unplanned-grid a reference to the new instance / project
        schedule = drag.schedule = new Schedule(newConfig);
        unplannedGrid.project = schedule.project;
    },
    onSelectionChange() {
        const
            { selectedRecords }   = this,
            { calendarHighlight } = this.features;

        if (selectedRecords.length > 0) {
            calendarHighlight.highlightResourceCalendars(selectedRecords);
        }
        else {
            calendarHighlight.unhighlightCalendars();
        }
    }
});

const splitter = new Splitter({
    appendTo    : 'main',
    showButtons : 'end'
});

// Holds unplanned sessions, that can be dragged to the schedule
const unplannedGrid = new UnplannedGrid({
    ref         : 'unplanned',
    flex        : '0 1 350px',
    collapsible : true,
    header      : false,
    appendTo    : 'main',
    project     : schedule.project,
    listeners   : {
        selectionChange() {
            const
                { selectedRecords }   = this,
                { calendarHighlight } = schedule.features,
                requiredRoles         = {};

            selectedRecords.forEach(task => requiredRoles[task.requiredRole] = 1);

            if (Object.keys(requiredRoles).length === 1) {
                const
                    appointment           = selectedRecords[0],
                    availableResources    = schedule.resourceStore.query(resourceRecord => resourceRecord.role === appointment.requiredRole || !appointment.requiredRole);

                calendarHighlight.highlightResourceCalendars(availableResources);
            }
            else {
                calendarHighlight.unhighlightCalendars();
            }
        }
    }
});

// Handles dragging
const drag = new Drag({
    grid         : unplannedGrid,
    schedule,
    constrain    : false,
    outerElement : unplannedGrid.element
});
