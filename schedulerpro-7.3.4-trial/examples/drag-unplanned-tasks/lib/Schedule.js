import SchedulerPro from '../../../lib/SchedulerPro/view/SchedulerPro.js';
import '../../../lib/Grid/feature/Stripe.js';
import '../../../lib/SchedulerPro/feature/CalendarHighlight.js';
import '../../../lib/Grid/column/NumberColumn.js';
import '../../../lib/Grid/feature/FilterBar.js';
import '../../../lib/Core/widget/NumberField.js';
import Toast from '../../../lib/Core/widget/Toast.js';
import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';

// Customized scheduler displaying hospital appointments
export default class Schedule extends SchedulerPro {
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
