import shared from '../_shared/shared.module.js';
import { EventModel, Duration, ResourceModel, DateHelper, SchedulerPro, MessageDialog, Toast, StringHelper, ButtonGroup, Panel } from '../../build/schedulerpro.module.js';
//region "lib/Reservation.js"

const statuses = [
    'not_arrived',
    'arrived',
    'in_bar',
    'all_seated',
    'paid',
    'all_guests_left'
];

class Reservation extends EventModel {
    static $name = 'Reservation';
    static fields = [
        { name : 'reservedBy' },
        { name : 'durationUnit', defaultValue : 'h' },
        { name : 'nbrGuests', defaultValue : 2 },
        { name : 'isBirthday', type : 'boolean', defaultValue : false },
        { name : 'isVip', type : 'boolean', defaultValue : false },
        { name : 'tags', type : 'array', defaultValue : [] },
        { name : 'allergies', type : 'array', defaultValue : [] },
        { name : 'status', defaultValue : 'not_arrived' },
        { name : 'isNewGuest', type : 'boolean' },
        { name : 'creditCard', type : 'boolean' },
        { name : 'postamble', dataSource : 'cleanupBuffer', convert : value => value ? new Duration(typeof value === 'number' ? value + 'min' : value) : null }
    ];
}

//endregion

//region "lib/Table.js"

class Table extends ResourceModel {
    static $name = 'Table';

    static fields = [
        { name : 'seats' },
        { name : 'room' },
        { name : 'name', convert : (val, data) => data?.id }
    ];

    /*
     * Gets the next event for a resource, after the passed date, optionally skipping any ongoing event
     * @param {Scheduler.model.ResourceModel} resourceRecord The resource
     * @param {Object} options
     * @param {Date} [options.startDate=now] The date to search from, defaults to current date/time
     * @param {Date} [options.endDate] The end date to search to, defaults to one year from startDate
     * @param {Boolean} [options.ignoreOngoing=false] `true` to ignore ongoing events in the search
     * @returns {Scheduler.model.EventModel|null} The next event or `null`
     */
    getOngoingOrNextEvent(options = {}) {
        const
            { eventStore } = this,
            now = new Date(),
            {
                startDate     = now,
                endDate       = DateHelper.add(options.startDate || now, 1, 'year'),
                ignoreOngoing = false
            }              = options;

        if (!this.events.length) {
            return null;
        }

        if (!ignoreOngoing) {
            // Check if there's an event that is already in progress
            const ongoing = eventStore.getEvents({
                resourceRecord     : this,
                startDate,
                endDate,
                includeOccurrences : false,
                allowPartial       : true
            });

            if (ongoing.length) {
                return ongoing.sort((a, b) => a.endDate - b.endDate)[0];
            }
        }

        // Otherwise the nearest future start
        const upcomingEvents = eventStore.getEvents({
            resourceRecord     : this,
            startDate,
            endDate,
            includeOccurrences : false,
            allowPartial       : false
        }).sort((a, b) => a.startDate - b.startDate);

        return upcomingEvents[0] || null;
    }

    get ongoingOrNextReservation() {
        const { referenceDate } = this;

        return this.getOngoingOrNextEvent({
            startDate : referenceDate,
            endDate   : DateHelper.getStartOfNextDay(referenceDate, true)
        });
    }

    get nextGuestName() {
        return this.ongoingOrNextReservation?.reservedBy;
    }

    get nextReservationNbrGuests() {
        return this.ongoingOrNextReservation?.nbrGuests;
    }

    get nextReservationStart() {
        return this.ongoingOrNextReservation?.startDate;
    }

    get nextGuestCC() {
        return this.ongoingOrNextReservation?.creditCard;
    }

    get referenceDate() {
        return this.stores[0].eventStore.crudManager.timeRangeStore.first.startDate;
    }
}

//endregion

//region "lib/TableScheduler.js"

class TableScheduler extends SchedulerPro {
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

//endregion

//region "lib/DateStrip.js"

const hasProject = w => w.project;
class DateStrip extends ButtonGroup {

    static $name = 'DateStrip';
    static type = 'datestrip';

    static configurable = {
        startDate : {
            $config : {
                equal : 'date'
            },
            value : null
        },
        selectedDate : {
            $config : {
                equal : 'date'
            },
            value : null
        },

        items : {
            dateMenuButton : {
                icon               : 'fa fa-calendar-days',
                menuIcon           : null,
                weight             : 100,
                toggleGroup        : 'nav',
                supportsUnpressing : true,
                menu               : {
                    type       : 'datepicker',
                    showEvents : 'count',
                    cls        : 'b-date-strip-menu-datepicker',
                    listeners  : {
                        selectionChange : 'up.onDateMenuSelect'
                    },
                    bbar : {
                        items : {
                            todayButton : {
                                text      : 'Today',
                                style     : 'margin-inline:auto',
                                rendition : 'tonal',
                                onClick   : 'up.onTodayClick'
                            }
                        }
                    }
                }
            },
            previousButton : {
                weight     : 200,
                cls        : 'b-nav-previous',
                icon       : 'b-icon-previous',
                onClick    : 'up.shiftPrevious',
                toggleable : false
            },
            nextButton : {
                weight     : 20000,
                cls        : 'b-nav-next',
                icon       : 'b-icon-next',
                onClick    : 'up.shiftNext',
                toggleable : false
            }
        },

        // ButtonGroup defaults
        toggleGroup : true,
        rendition   : 'padded',

        /**
         * Number of days to show in the strip
         * @config {Number}
         */
        duration : 7,

        /**
         * Number of days to shift when clicking the next/previous buttons
         *
         * Or a duration, eg '1 week', '3 days' etc.
         * @prp {Number|String|Object
         */
        shiftIncrement : 1
    };

    construct(config) {
        const me = this;

        super.construct(config);

        if (!me.startDate) {
            me.startDate = new Date();
        }
        if (!me.selectedDate) {
            me.selectedDate = me.startDate;
        }
    }

    changeItems(items) {
        items = {
            ...items,
            ...this.buildDayItems(300)
        };

        items.dateMenuButton.menu.project = this.up(hasProject)?.project;
        items.dateMenuButton.menu.date = this.selectedDate;

        return super.changeItems(items);
    }

    changeShiftIncrement(shiftIncrement) {
        if (typeof shiftIncrement === 'number') {
            shiftIncrement = { magnitude : shiftIncrement, unit : 'd' };
        }
        else if (typeof shiftIncrement === 'string') {
            const unit = DateHelper.parseTimeUnit(shiftIncrement);

            if (unit) {
                shiftIncrement = {
                    magnitude : 1,
                    unit
                };
            }
            else {
                shiftIncrement = DateHelper.parseDuration(shiftIncrement);
            }
        }
        else {
            shiftIncrement.unit = DateHelper.parseTimeUnit(shiftIncrement.unit);
        }
        return new Duration(shiftIncrement);
    }

    changeStartDate(date) {
        return DateHelper.clearTime(date);
    }

    changeSelectedDate(date) {
        return DateHelper.clearTime(date);
    }

    shiftNext() {
        this.shiftRange(this.shiftIncrement);
    }

    shiftPrevious() {
        this.shiftRange(this.shiftIncrement.negate());
    }

    /**
     * Shift the date range by the specified time duration
     * @param {Core.data.Duration} shiftIncrement
     */
    shiftRange(shiftIncrement) {
        const pressedIndex = this.pressed[0]?.dayIndex || 0;

        this.startDate = DateHelper.add(this.startDate, shiftIncrement);
        this.selectedDate = DateHelper.add(this.startDate, pressedIndex, 'd');
    }

    /**
     * Highlights conflicts on the given date button
     * @param {Map} conflictMap
     */
    highlightConflicts(conflictMap) {
        this.items.forEach(btn => {
            if (btn.date) {
                const dateConflicts = conflictMap.get(DateHelper.format(btn.date, 'YYYY-MM-DD'));
                btn.toggleCls('b-date-conflicts', dateConflicts?.size > 0);

                btn.tooltip = dateConflicts?.size > 0 ? `${DateHelper.format(btn.date, 'MMM DD')}: ${dateConflicts.size} conflict${dateConflicts.size ? 's' : ''}` : '';
            }
        });
    }

    // Called by the configurable system when startDate changes
    updateStartDate(startDate) {
        // Reuse existing buttons, just move their dates
        this.items.forEach((btn, index) => {
            if (typeof btn.dayIndex === 'number') {
                this.reconfigureDay(DateHelper.add(this.startDate, btn.dayIndex, 'd'), btn);
            }
        });
    }

    // Called by the configurable system when selectedDate changes
    updateSelectedDate(selectedDate) {
        // Ensure selected date is in range
        if (!DateHelper.betweenLesser(selectedDate, this.startDate, DateHelper.add(this.startDate, this.duration, 'd'))) {
            this.startDate = selectedDate;
        }

        this.items.forEach(btn => {
            if (typeof btn.dayIndex === 'number') {
                btn.pressed = DateHelper.isSameDate(btn.date, selectedDate);
            }
        });

        if (this.widgetMap?.dateMenuButton) {
            this.widgetMap.dateMenuButton.menu.selection = selectedDate;
        }

        if (!this.isConfiguring) {
            this.trigger('select', { date : selectedDate });
        }
    }

    buildDayItems(weight) {
        const items = {};

        for (let i = 0; i < this.duration; i++, weight += 10) {
            const
                date = DateHelper.add(this.startDate, i, 'd'),
                cfg  = {
                    weight,
                    dayIndex : i,
                    date,
                    cls      : 'b-date-strip-day'
                };

            this.reconfigureDay(date, cfg);
            items[`day-${i}`] = cfg;
        }

        return items;
    }

    reconfigureDay(date, button) {
        button.date = date;
        button.text = [
            {
                class    : 'b-date-strip-day-label',
                children : [
                    DateHelper.format(date, 'ddd'),
                    {
                        tag   : 'i',
                        class : 'b-conflict-indicator fa fa-triangle-exclamation'
                    }
                ]
            },
            {
                class : 'b-date-strip-date',
                text  : DateHelper.format(date, 'DD MMM')
            }
        ];

        button.pressed = DateHelper.isSameDate(date, this.selectedDate);
    }

    onChange({ source, event }) {
        if (event.source.date) {
            this.selectedDate = event.source.date;
        }
    }

    onDateMenuSelect({ selection }) {
        this.selectedDate = selection[0];
    }

    onTodayClick() {
        this.selectedDate = this.widgetMap.dateMenuButton.menu.selection = new Date();
    }
}

DateStrip.initClass();

//endregion

//region "lib/SettingsPanel.js"

class SettingsPanel extends Panel {
    static configurable = {
        drawer : {
            autoClose : true
        },
        title : 'Settings',
        width : 400,
        items : {
            container : {
                type  : 'container',
                items : {
                    rowHeight : {
                        type    : 'radiogroup',
                        label   : 'Row height',
                        inline  : true,
                        value   : '30',
                        options : {
                            30  : 'Small',
                            70  : 'Medium',
                            100 : 'Large'
                        },
                        onChange : 'up.onRowHeightChange'
                    },
                    tickWidth : {
                        type      : 'slider',
                        label     : 'Time Cell Width',
                        min       : 40,
                        max       : 100,
                        showValue : true,
                        unit      : 'px',
                        onInput   : 'up.onTickWidthSliderChange'
                    },
                    seatingLength : {
                        type   : 'radiogroup',
                        label  : 'Seating length',
                        inline : true,
                        items  : [
                            { text : 'Two hours', checkedValue : 2 },
                            { text : 'One hour', checkedValue : 1 }
                        ],
                        onChange : 'up.onSeatingLengthChange'
                    }
                }
            },
            bottomContainer : {
                type  : 'container',
                items : {
                    leftSectionToggle : {
                        type     : 'slidetoggle',
                        text     : 'Hide left section',
                        onChange : 'up.onLeftSectionToggle'
                    },
                    eventTimesToggle : {
                        type     : 'slidetoggle',
                        text     : 'Show event times',
                        checked  : true,
                        onChange : 'up.onShowEventTimesToggle'
                    }
                }
            }
        }
    };

    construct({ scheduler }) {
        super.construct(...arguments);

        this.widgetMap.tickWidth.value = scheduler.tickSize;
    }

    onRowHeightChange({ value }) {
        this.scheduler.rowHeight = Number(value);
    }

    onTickWidthSliderChange({ value }) {
        this.scheduler.tickSize = value;
    }

    onSeatingLengthChange({ value }) {
        this.scheduler.tickSize = this.widgetMap.tickWidth.value = value === 2 ? 40 : 80;
    }

    onLeftSectionToggle({ value }) {
        this.scheduler.subGrids.locked.toggleCollapse();
    }

    onShowEventTimesToggle({ value }) {
        this.scheduler.toggleCls('b-show-event-times', value);
    }
}

//endregion

const scheduler = new TableScheduler({
    appendTo       : 'container',
    flex           : 1,
    startDate      : new Date(2025, 10, 10, 17),
    endDate        : new Date(2025, 10, 11),
    timeResolution : {
        increment : 15,
        unit      : 'min'
    },
    project : {
        autoLoad      : true,
        loadUrl       : 'data/data.json',
        resourceStore : {
            modelClass : Table
        },
        eventStore : {
            modelClass : Reservation
        }
    }
});

