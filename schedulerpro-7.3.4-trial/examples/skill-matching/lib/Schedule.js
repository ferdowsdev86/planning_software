import SchedulerPro from '../../../lib/SchedulerPro/view/SchedulerPro.js';
import '../../../lib/Grid/feature/FilterBar.js';
import '../../../lib/SchedulerPro/feature/CalendarHighlight.js';
import '../../../lib/Scheduler/column/ResourceInfoColumn.js';
import '../../../lib/SchedulerPro/feature/ResourceNonWorkingTime.js';
import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';

// Customized scheduler displaying planned maintenance work for vehicles
export default class Schedule extends SchedulerPro {
    static $name = 'Schedule';

    static configurable = {
        resourceImages : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        },
        rowHeight                 : 65,
        barMargin                 : 7,
        tickSize                  : 150,
        fillTicks                 : true,
        eventStyle                : 'tonal',
        eventColor                : 'indigo',
        useInitialAnimation       : false,
        zoomOnMouseWheel          : false,
        zoomOnTimeAxisDoubleClick : false,
        title                     : 'Planned maintenance activities',
        ui                        : 'toolbar',
        autoCreate                : {
            useEventModelDefaults : true
        },
        features : {
            scheduleMenu      : false,
            eventDragCreate   : false,
            dependencies      : false,
            calendarHighlight : {
                calendar : 'resource',
                inflate  : {
                    x : -8,
                    y : -1
                },
                collectAvailableResources({ scheduler, eventRecords }) {
                    return scheduler.resourceStore.query(technician => technician.canPerformTask(eventRecords[0]));
                }
            },
            scheduleTooltip : false,
            columnLines     : true,
            group           : {
                field        : 'type',
                headerHeight : 45,
                showCount    : false
            },
            resourceNonWorkingTime : {
                enableMouseEvents : true
            },
            filterBar : {
                compactMode : true
            },
            // Configure event menu items with correct phrases (could also be done through localization)
            eventMenu : {
                items : {
                    splitEvent : false,
                    unassign   : {
                        icon : 'fa fa-calendar-xmark',
                        text : 'Move to unplanned list',
                        onItem({ eventRecord }) {
                            const { project } = eventRecord;
                            eventRecord.remove();

                            project.getCrudStore('unplanned').add(eventRecord);
                        }
                    }
                }
            },
            eventResize : false,
            eventDrag   : {
                tooltipTemplate : ({ eventRecord, startDate, newResource }) => {
                    const firstAvailableTimeSlot = newResource.isSpecialRow ? null : newResource.getFirstAvailableTimeSlot(startDate, eventRecord);

                    return `<div class="b-tooltip-section">
                        <strong><i class="fa fa-calendar-days"'}"></i>Schedule on</strong>
                        ${DateHelper.format(startDate, 'MMM DD')}
                    </div>
                    <div class="b-tooltip-section">
                        <strong><i class="fa fa-tools"'}"></i>Required skills</strong>
                        <ul class="skills">
                            ${eventRecord.skills.map(skillRecord => `<li><i class="fa fa-${!newResource.isSpecialRow && newResource.skillIds?.includes?.(skillRecord.id) ? 'check' : 'xmark'}"></i>${StringHelper.encodeHtml(skillRecord.name)}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="b-tooltip-section">
                        <strong><i class="fa fa-clock"'}"></i>Resource availability</strong>
                        <i class="fa fa-${firstAvailableTimeSlot ? 'check' : 'xmark'}"></i> ${firstAvailableTimeSlot ? DateHelper.format(firstAvailableTimeSlot, 'LST') : 'No availability'}
                    </div>
                    `;
                },
                // Validation method, called as you drag events around in the schedule
                validatorFn({ eventRecords, newResource, startDate }) {
                    const
                        task  = eventRecords[0],
                        valid = newResource.canPerformTask(task, startDate);

                    return valid;
                }
            },
            eventTooltip : {
                template({ eventRecord }) {
                    return `<div class="field"><label>Task</label><span>${StringHelper.encodeHtml(eventRecord.name)}</span></div>
                        <div class="field"><label>Required skills</label><ul class="skills">${eventRecord.requiredSkillNames.map(skill => `<li>${skill}</li>`).join('')}</ul></div>
                        <div class="field"><label>Start</label><span>${DateHelper.format(eventRecord.startDate, 'MMM DD LST')}</span></div>
                        <div class="field"><label>Duration</label><span>${eventRecord.fullDuration}</span></div>
                        <div class="field"><label>Assigned to</label><span>${StringHelper.encodeHtml(eventRecord.resource.name)}</span></div>
                        <div class="field"><label>Completed</label><span></span></div>
                    `;
                }
            },
            taskEdit : {
                editorConfig : {
                    title : 'Task'
                },

                // Add items to the General tab
                items : {
                    generalTab : {
                        items : {
                            resourcesField : {
                                label : 'Technician'
                            },
                            effortField  : false,
                            // Add a vehicle field
                            vehicleField : {
                                type   : 'text',
                                name   : 'licensePlate',
                                label  : 'Vehicle',
                                // Place after name field
                                weight : 150
                            },
                            skillField : {
                                type         : 'combo',
                                multiSelect  : true,
                                idField      : 'id',
                                displayField : 'name',
                                label        : 'Skills',
                                name         : 'skillIds',
                                weight       : 160
                            }
                        }
                    }
                }
            },
            stickyEvents : false
        },

        // Define the columns to use
        columns : [
            {
                type           : 'resourceInfo',
                id             : 'resourceInfo', // for state
                text           : 'Staff',
                width          : 300,
                showEventCount : false,
                // Show skills each technician has
                showMeta(resourceRecord) {
                    const
                        { skillNames = [] }    = resourceRecord,
                        { startDate, endDate } = this.grid,
                        bookedHours            = resourceRecord.getBookedHours(startDate, endDate),
                        overAllocated          = bookedHours > resourceRecord.hoursPerWeek;

                    return `<ul class="skills">${skillNames.map(skill => `<li>${StringHelper.encodeHtml(skill)}</li>`).join('')}</ul>
                        <div data-btip="${bookedHours}h / ${resourceRecord.hoursPerWeek} allocated"><i class="fa ${overAllocated ? 'fa-triangle-exclamation' : 'fa-clock'}"></i>${bookedHours} / ${resourceRecord.hoursPerWeek}</div>`;
                },
                filterable : {
                    filterField : {
                        triggers : {
                            search : {
                                cls : 'fa fa-filter'
                            }
                        },
                        placeholder : 'Staff'
                    }
                }
            }
        ],

        // Custom view preset with single header row configuration
        viewPreset : {
            base      : 'dayAndWeek',
            shiftUnit : 'week',
            headers   : [
                {
                    unit       : 'd',
                    align      : 'center',
                    dateFormat : 'ddd DD'
                }
            ]
        },

        // navigation buttons
        tools : [
            {
                type      : 'button',
                icon      : 'fa fa-chevron-left',
                rendition : 'text',
                onAction  : 'up.onPreviousWeekClick'
            },
            {
                type      : 'button',
                text      : 'Today',
                rendition : 'text',
                onAction  : 'up.onTodayClick'
            },
            {
                type      : 'button',
                icon      : 'fa fa-chevron-right',
                rendition : 'text',
                onAction  : 'up.onNextWeekClick'
            },
            {
                type      : 'button',
                text      : 'Auto-schedule',
                icon      : 'fa fa-wand-magic-sparkles',
                rendition : 'text',
                tooltip   : 'Tries to fit the unplanned events into the currently displayed timeframe',
                onAction  : 'up.onAutoScheduleClick'
            }
        ],

        onNextWeekClick() {
            this.shiftNext();
        },

        onTodayClick() {
            this.scrollToDate(new Date());
        },

        onPreviousWeekClick() {
            this.shiftPrevious();
        },

        async onAutoScheduleClick() {
            const
                unplannedStore = this.project.getCrudStore('unplanned'),
                toRemove       = [];

            this.suspendRefresh();

            // Basic implementation of assigning unplanned tasks to available resources
            for (let i = unplannedStore.count - 1; i >= 0; --i) {
                const eventRecord = unplannedStore.getAt(i);

                this.resourceStore.forEach(technicianRecord => {
                    if (technicianRecord.hoursPerWeek - technicianRecord.getBookedHours(this.startDate, this.endDate) < eventRecord.duration) {
                        return;
                    }
                    this.timeAxis.forEach(({ startDate })  => {
                        startDate = technicianRecord.getFirstAvailableTimeSlot(startDate, eventRecord);
                        if (startDate && technicianRecord.canPerformTask(eventRecord, startDate)) {
                            // Collect records to remove instead of removing right away, which would cause multiple
                            // UI refreshes
                            toRemove.push(eventRecord);
                            this.scheduleEvent({
                                eventRecord,
                                startDate,
                                resourceRecord : technicianRecord
                            });
                            return false;
                        }
                    });
                    return eventRecord.resources.length === 0;
                }, undefined, { includeCollapsedGroupRecords : true });

                await this.project.commitAsync();
            }
            this.resumeRefresh();

            // Remove from unplanned in one go, only causing a single refresh of the grid
            unplannedStore.remove(toRemove);
        }
    };

    construct() {
        super.construct(...arguments);

        // Populate the skills combo in the event editor
        this.features.taskEdit.items.generalTab.items.skillField.store = this.project.getCrudStore('skills');
    }

    // Return a DOM config object for what to show inside the event bar (you can return an HTML string too)
    eventRenderer({ eventRecord }) {
        return [
            {
                class    : 'b-event-header',
                children : [{
                    class : 'b-event-name',
                    text  : eventRecord.name
                },
                {
                    class : 'b-event-duration',
                    text  : eventRecord.fullDuration.toString(true)
                }]
            },
            {
                class : 'licensePlate',
                html  : StringHelper.xss`<div>Vehicle: ${eventRecord.licensePlate}</div>`
            }
        ];
    }

    // Remove highlights on days when there already are events
    onBeforeRenderCalendarHighlights(event) {
        const { events, highlights } = event;

        if (events.length) {
            event.highlights = highlights.filter(h => !events.some(e => DateHelper.isEqual(e.startDate, h.startDate, 'day')));
        }
    }

    getResourceImage(resource) {
        return this.resourceImagePath + (resource.image !== false ? StringHelper.encodeHtml(resource.name.toLowerCase() + '.jpg') : 'none.png');
    }

    onBeforeEventEditShow({ editor, eventRecord }) {
        editor.widgetMap.vehicleField.readOnly = !eventRecord.isCreating;
    }
}
