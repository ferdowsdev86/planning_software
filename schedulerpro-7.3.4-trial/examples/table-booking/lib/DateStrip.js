import ButtonGroup from '../../../lib/Core/widget/ButtonGroup.js';
import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import Duration from '../../../lib/Core/data/Duration.js';
import '../../../lib/Scheduler/widget/SchedulerDatePicker.js';

const hasProject = w => w.project;
export default class DateStrip extends ButtonGroup {

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

