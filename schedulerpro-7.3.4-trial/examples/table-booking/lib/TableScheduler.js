import SchedulerPro from '../../../lib/SchedulerPro/view/SchedulerPro.js';
import '../../../lib/SchedulerPro/feature/EventBuffer.js';
import '../../../lib/Scheduler/feature/TimeRanges.js';
import '../../../lib/Scheduler/feature/EventEdit.js';
import MessageDialog from '../../../lib/Core/widget/MessageDialog.js';
import Toast from '../../../lib/Core/widget/Toast.js';
import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';
import './DateStrip.js';
import SettingsPanel from './SettingsPanel.js';

export default class TableScheduler extends SchedulerPro {
    static configurable = {
        rowHeight                 : 30,
        tickSize                  : 45,
        barMargin                 : 2,
        eventColor                : 'blue',
        zoomOnMouseWheel          : false,
        zoomOnTimeAxisDoubleClick : false,
        eventLayout               : 'none',
        snap                      : true,
        cls                       : 'b-show-event-times',
        referenceDate             : {
            $config : {
                equal : 'date'
            },
            value : null
        },
        dayStartHour   : 17,
        dayEndHour     : 24,
        subGridConfigs : {
            locked : {
                minWidth : 150
            }
        },
        selectionMode : {
            deselectOnClick : true
        },

        tbar : {
            overflow : null,
            items    : [
                {
                    type     : 'slidetoggle',
                    text     : 'Highlight conflicts',
                    ref      : 'toggleShowConflicts',
                    onChange : 'up.onEventConflictsToggle'
                },
                {
                    type         : 'datestrip',
                    ref          : 'dateStrip',
                    startDate    : new Date(2025, 10, 10, 17, 30),
                    selectedDate : new Date(2025, 10, 10, 17),
                    onSelect     : 'up.onDateSelection'
                },
                {
                    type    : 'button',
                    icon    : 'fa fa-sliders',
                    onClick : 'up.onShowSettings'
                }
            ]
        },

        columns : [
            {
                collapsible  : true,
                collapseMode : 'toggleAll',
                text         : 'Restaurant Tables',
                children     : [
                    {
                        width      : 40,
                        minWidth   : 40,
                        ariaLabel  : 'Credit card provided',
                        // A custom getter defined in Reservation model (see lib/Reservation.js)
                        field      : 'nextGuestCC',
                        htmlEncode : false,
                        renderer   : ({ value }) => {
                            return value ? '<i class="fa fa-credit-card" data-btip="Credit card supplied"></i>' : '';
                        }
                    },
                    {
                        type     : 'date',
                        text     : 'Start',
                        width    : 100,
                        minWidth : 20,
                        cellCls  : 'b-next-or-ongoing-start',
                        field    : 'nextReservationStart',
                        renderer : ({ value }) => {
                            return value && DateHelper.format(value, 'LST');
                        }
                    },
                    {
                        text      : '#',
                        width     : 50,
                        minWidth  : 0,
                        align     : 'center',
                        ariaLabel : 'Number of guests',
                        cellCls   : 'b-next-or-ongoing-nbr-guests',
                        field     : 'nextReservationNbrGuests'
                    },
                    {
                        text    : 'Name',
                        width   : 160,
                        cellCls : 'b-next-or-ongoing-reserved-by',
                        field   : 'nextGuestName'
                    },
                    {
                        text            : 'Name',
                        width           : 120,
                        toggleAllHidden : true,
                        renderer        : ({ record, grid : scheduler }) => record.getOngoingOrNextEvent({
                            startDate : scheduler.referenceDate,
                            endDate   : scheduler.timeAxis.endDate
                        })?.reservedBy
                    },
                    {
                        text     : 'Next',
                        type     : 'date',
                        width    : 100,
                        minWidth : 20,
                        cellCls  : 'b-next-start-date',
                        renderer : ({ record, grid : scheduler }) => {
                            const
                                refEvent           = record.getOngoingOrNextEvent({
                                    startDate : scheduler.referenceDate,
                                    endDate   : scheduler.timeAxis.endDate
                                }),
                                nextFollowingEvent = record.getOngoingOrNextEvent({
                                    startDate     : refEvent?.endDate,
                                    endDate       : scheduler.timeAxis.endDate,
                                    ignoreOngoing : true
                                });

                            if (nextFollowingEvent) {
                                return DateHelper.format(nextFollowingEvent.startDate, 'LST');
                            }
                        }
                    },
                    {
                        text       : 'Table',
                        width      : 80,
                        field      : 'id',
                        htmlEncode : false,
                        renderer   : ({
                            record,
                            grid
                        }) => `${record.id} <span class="b-table-seats" data-btip="${StringHelper.encodeHtml(record.seats)} seats"><i class="fa fa-chair" "></i>${StringHelper.encodeHtml(record.seats)}</span>`
                    }
                ]
            }
        ],

        features : {
            regionResize    : false,
            stripe          : true,
            cellEdit        : false,
            scheduleTooltip : false,
            stickyEvents    : false,
            eventMenu       : false,
            dependencies    : false,
            taskEdit        : false,
            // Disable the built-in tooltip feature
            eventTooltip    : false,
            eventDrag       : {
                // Lock dragging to just one direction
                singleDirection : true
            },
            eventBuffer : {
                showDuration : false
            },
            eventResize : {
                leftHandle : false
            },
            timeRanges : {
                showTooltip        : false,
                showHeaderElements : true,
                enableResizing     : true,
                headerRenderer({ timeRange }) {
                    return DateHelper.format(timeRange.startDate, 'LST');
                }
            },
            group : {
                headerHeight : 30,
                field        : 'room',
                renderer     : ({ groupRowFor, isFirstColumn }) => isFirstColumn && groupRowFor
            },
            eventEdit : {
                triggerEvent   : 'eventclick',
                ignoreSelector : '.b-status-indicator',
                items          : {
                    resourceField : {
                        label : 'Table'
                    },
                    nameField : {
                        label : 'Guest',
                        name  : 'reservedBy'
                    },
                    startDateField : {
                        label : 'Date / time'
                    },
                    endDateField  : null,
                    endTimeField  : null,
                    durationField : {
                        type  : 'duration',
                        label : 'Duration',
                        name  : 'fullDuration'
                    },
                    cleanupField : {
                        type  : 'duration',
                        label : 'Clean up time after',
                        name  : 'postamble',
                        unit  : 'min',
                        step  : 5
                    }
                },
                // Use slide-in overlay editor
                editorConfig : {
                    title  : 'Edit reservation',
                    drawer : {
                        // Don't auto close the drawer when mouse is moved outside its bounds
                        autoCloseDelay : null
                    },
                    listeners : {
                        // Prevent closing the editor when clicking on an event to reveal new details
                        beforeToggleReveal({ reveal }) {
                            if (!reveal) {
                                return !document.activeElement.closest('.b-sch-event-wrap');
                            }
                        }
                    }
                }
            }
        },

        timeRanges : [{
            id        : 1,
            duration  : 0,
            startDate : new Date(2025, 10, 10, 17, 45),
            endDate   : new Date(2025, 10, 10, 17, 45)
        }],

        viewPreset : {
            base    : 'hourAndDay',
            headers : [
                {
                    unit      : 'minute',
                    increment : 15,
                    // Custom renderer to show number of guests arriving at this time slot
                    renderer  : (startDate, endDate, cellData, i, scheduler) => {
                        let totalGuestsArriving = 0;
                        scheduler.eventStore.forEach(eventRecord => {
                            if (eventRecord.startDate - startDate === 0) {
                                totalGuestsArriving += eventRecord.nbrGuests;
                            }
                        });

                        return totalGuestsArriving || '';
                    }
                },
                {
                    unit      : 'minute',
                    increment : 15,
                    // Custom renderer to show hours and minutes differently
                    renderer(startDate, end, cellData) {
                        const minutes = startDate.getMinutes();

                        cellData.headerCellCls = minutes === 0 ? 'hour' : 'minute';
                        return minutes === 0 ? DateHelper.format(startDate, 'h') : minutes;
                    }
                }
            ]
        }
    };

    construct() {
        const me = this;

        super.construct(...arguments);

        me.timeRangeStore.on({
            update        : me.onReferenceDateChange,
            batchedUpdate : me.onReferenceDateChange,
            thisObj       : me
        });
        me.eventStore.on({
            change  : me.onEventStoreChange,
            thisObj : me
        });
    }

    onReferenceDateChange({ record }) {
        this.refresh();
    }

    onEventStoreChange() {
        this.timeAxisColumn.refreshHeader();

        this.refreshDateStrip();
    }

    onTimeAxisChange() {
        this.refreshDateStrip();
    }

    refreshDateStrip() {
        // Find all events that are conflicting for the week displayed in the DateStrip
        const conflictingEventsMap = this.getConflictingEventsMap();

        this.widgetMap.dateStrip.highlightConflicts(conflictingEventsMap);
    }

    getConflictingEventIdMap() {
        const
            overlappingEventsByDate = this.getConflictingEventsMap(),
            conflictingEventIds     = {};

        overlappingEventsByDate.forEach(eventSet => eventSet.forEach(event => conflictingEventIds[event.id] = true));

        return conflictingEventIds;
    }

    getConflictingEventsMap() {
        const overlappingEventsByDate = new Map();

        for (let d = 0; d < 7; d++) {
            const
                date      = DateHelper.add(this.widgetMap.dateStrip.startDate, d, 'd'),
                dayEvents = this.eventStore.getEvents({
                    startDate : DateHelper.startOf(date, 'd'),
                    endDate   : DateHelper.endOf(date, 'd')
                }),
                dateKey   = DateHelper.format(date, 'YYYY-MM-DD');

            // Initialize a Set to hold overlapping events for this date
            overlappingEventsByDate.set(dateKey, new Set());

            dayEvents.forEach(eventA => {
                dayEvents.forEach(eventB => {
                    if (eventA !== eventB &&
                        eventA.resourceId === eventB.resourceId &&
                        DateHelper.intersectSpans(eventA.startDate, eventA.endDate, eventB.startDate, eventB.endDate)
                    ) {
                        overlappingEventsByDate.get(dateKey).add(eventA);
                        overlappingEventsByDate.get(dateKey).add(eventB);
                    }
                });
            });
        }

        return overlappingEventsByDate;
    }

    onDateSelection({ date }) {
        this.goToDate(date);
    }

    // Define the DOM markup rendered inside the events bar using simple DOMConfig objects
    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        const labels = [
            ...eventRecord.tags,
            ...eventRecord.allergies
        ];
        eventRecord.isVip && labels.push('VIP');
        eventRecord.isBirthday && labels.push('BDAY');

        renderData.cls['b-new-guest'] = eventRecord.isNewGuest;

        // Event contents, laid out using a CSS grid
        const domConfig = [
            {
                class : 'b-guest-count',
                text  : eventRecord.nbrGuests
            },
            {
                class    : 'b-name-ct',
                children : [
                    eventRecord.isVip ? {
                        tag     : 'i',
                        class   : 'fa fa-star',
                        dataset : { btip : 'VIP Guest' }
                    } : undefined,
                    eventRecord.isBirthday ? {
                        tag     : 'i',
                        class   : 'fa fa-cake',
                        dataset : { btip : 'Birthday event' }
                    } : undefined,
                    eventRecord.tags.length > 0 ? { tag : 'i', class : 'fa fa-tag' } : undefined,
                    eventRecord.allergies.length > 0 ? {
                        tag     : 'i',
                        class   : 'fa fa-hand-dots',
                        dataset : { btip : 'Allergies: ' + eventRecord.allergies.join(', ') }
                    } : undefined,
                    {
                        class : 'b-reserved-by',
                        text  : eventRecord.reservedBy
                    }
                ]
            },
            {
                class : 'b-times',
                text  : DateHelper.format(eventRecord.startDate, 'LST') + ' - ' + DateHelper.format(eventRecord.endDate, 'LST')
            },
            {
                class    : 'b-label-ct',
                children : labels.map(tag => ({ class : 'b-reservation-label', text : tag }))
            }
        ];

        return domConfig;
    }

    onEventDetailsToggle({ value }) {
        this.rowHeight = value ? 65 : 30;
    }

    onEventConflictsToggle({ value, source }) {
        if (value) {
            const ids = this.highlightConflictingEvents();

            if (ids.length === 0) {
                source.value = false;
            }
        }
        else {
            this.unhighlightEvents();
        }
    }

    highlightConflictingEvents() {
        const conflictingEventIds = Object.keys(this.getConflictingEventIdMap());
        if (conflictingEventIds.length === 0) {
            Toast.show('No conflicting reservations found');
        }
        else {
            this.highlightEvents({ events : conflictingEventIds, scroll : false, unhighlightOnClick : false });
        }
        return conflictingEventIds;
    }

    get referenceDate() {
        return this.timeRangeStore.first.startDate;
    }

    updateReferenceDate(date) {
        this.clearInterval(this.referenceDateTimer);
        this.timeRangeStore.first.setStartDate(date, true);
    }

    async onBeforeEventResizeFinalize({ source : scheduler, context }) {
        const { startDate, endDate, eventRecord, resourceRecord } = context;

        if (!this.isDateRangeAvailable(startDate, endDate, eventRecord, resourceRecord, false)) {
            const result = await MessageDialog.confirm({
                title   : 'Please confirm',
                message : 'Reservation overlaps, continue?'
            });

            // `true` to accept the changes or `false` to reject
            context.finalize(result === MessageDialog.yesButton);
        }
    }

    // If dropping a booking such that it overlaps with other booking, swap places
    onBeforeEventDropFinalize({ context }) {
        const
            eventRecord         = context.eventRecords[0],
            { newResource }     = context,
            overlappingBookings = this.eventStore.getEvents({
                resourceRecord : newResource,
                startDate      : context.startDate,
                endDate        : DateHelper.add(context.endDate, eventRecord.postamble)
            });

        overlappingBookings.forEach(overlappingBooking => overlappingBooking.resourceId = eventRecord.resourceId);
    }

    goToDate(date) {
        const me = this;

        date = DateHelper.clearTime(date);
        date.setHours(this.dayStartHour);
        me.setTimeSpan(date, DateHelper.add(date, this.dayEndHour - this.dayStartHour, 'h'));
        me.referenceDate = DateHelper.copyTimeValues(date, me.referenceDate || new Date());

        me.clearInterval(me.referenceDateTimer);

        if (DateHelper.isSameDate(date, new Date())) {
            // Update reference date every 10 seconds to keep "next reservation" columns up to date'
            me.referenceDateTimer = me.setInterval(() => {
                me.referenceDate = new Date();
            }, 10000);
        }
    }

    onShowSettings() {
        if (!this.settingsPanel) {
            this.settingsPanel = new SettingsPanel({ scheduler : this });
        }
        this.settingsPanel.show();
    }
}
