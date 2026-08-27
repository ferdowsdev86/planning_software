var {
    DateHelper,
    ResourceTimeRangeStore,
    ResourceTimeRangeModel,
    InstancePlugin,
    GridFeatureManager,
    DomHelper,
    EventHelper,
    Tooltip,
    SchedulerResourceModel,
    SchedulerEventModel,
    StringHelper,
    LocaleManager,
    Scheduler
} = window.bryntum.schedulerpro;
//region "lib/DailyRateStore.js"

// Define a new store extending standard ResourceTimeRangeStore
// with RecurringTimeSpansMixin mixin to add recurrence support to the store.
// This store will contain resource time ranges.

// so we make a special model extending standard ResourceTimeRangeModel
// with RecurringTimeSpan which adds recurrence support
class DailyRateModel extends ResourceTimeRangeModel {
    static fields = [{
        name : 'pricePerNight',
        type : 'number'
    }];
    get name() {
        return this.pricePerNight ? `$${this.pricePerNight}` : '';
    }
}
class DailyRateStore extends ResourceTimeRangeStore {
    static configurable = {
    // Configure store to use our new DailyRateModel model
        modelClass : DailyRateModel
    };
    getPricePerNightFor(property, date) {
        var _this$getRanges;
        const dayModel = (_this$getRanges = this.getRanges({
            resourceRecord : property,
            startDate      : date,
            endDate        : DateHelper.add(date, 1, 'day')
        })) === null || _this$getRanges === undefined ? undefined : _this$getRanges[0];
        return dayModel === null || dayModel === undefined ? undefined : dayModel.pricePerNight;
    }
}

//endregion

//region "lib/DaySelector.js"

/**
 * Custom feature that allows drag selecting a range of days to create a reservation
 */
class DaySelector extends InstancePlugin {
    // Storing class name to avoid issues from minifiers that it
    static $name = 'DaySelector';
    static configurable = {
        isReservingDate : false
    };

    // Hook up a mouse down listener at construction time
    construct(client, config) {
        super.construct(client, config);
        client.on({
            resourceTimeRangeMouseDown : 'onDayMouseDown',
            resourceTimeRangeMouseOver : 'onDayMouseOver',
            thisObj                    : this
        });
    }
    updateIsReservingDate(value) {
        this.client.element.classList[value ? 'add' : 'remove']('b-reserving-dates');
    }

    // User moused down on an "empty" part of the schedule
    onDayMouseDown({
        resourceRecord,
        resourceTimeRangeRecord,
        domEvent
    }) {
        if (resourceTimeRangeRecord && !resourceRecord.readOnly && !this.client.readOnly) {
            var _this$reservingDateLi;
            clearTimeout(this.reservingDateTimer);
            (_this$reservingDateLi = this.reservingDateListenersDetacher) === null || _this$reservingDateLi === undefined || _this$reservingDateLi.call(this);

            // Initiate a new reservation
            this.reservation = {
                startX        : domEvent.clientX,
                resource      : resourceRecord,
                mouseDownDate : resourceTimeRangeRecord.startDate,
                startDate     : resourceTimeRangeRecord.startDate,
                endDate       : resourceTimeRangeRecord.endDate
            };

            // Make resource time ranges part of the selection look selected
            domEvent.target.closest('.b-sch-resource-time-range').classList.add('b-selected', 'b-first', 'b-last');
            this.reservingDateTimer = setTimeout(() => this.isReservingDate = true, EventHelper.dblClickTime);
            this.reservingDateListenersDetacher = EventHelper.on({
                mouseup   : 'clearReservingDate',
                mousemove : 'setReservingDate',
                element   : document,
                thisObj   : this
            });
            EventHelper.on({
                mouseup : 'onMouseUp',
                element : document,
                once    : true,
                thisObj : this
            });
        }
    }

    // Mouse over a new element in the schedule
    onDayMouseOver({
        resourceTimeRangeRecord,
        domEvent
    }) {
        if (!this.reservation) {
            return;
        }
        const {
                client: scheduler,
                reservation
            } = this,
            {
                mouseDownDate,
                resource,
                startX
            } = reservation,
            startDate = DateHelper.min(resourceTimeRangeRecord.startDate, mouseDownDate),
            endDate = DateHelper.max(resourceTimeRangeRecord.endDate, mouseDownDate),
            dayRangeInstances = scheduler.resourceTimeRangeStore.getRanges({
                resourceRecord : resource,
                startDate,
                endDate
            });
        Object.assign(reservation, {
            startDate,
            endDate,
            dayRangeInstances,
            nights     : DateHelper.getDurationInUnit(startDate, endDate, 'days'),
            totalPrice : dayRangeInstances.reduce((pre, day) => pre + day.pricePerNight, 0)
        });

        // Prevent booking over gaps or existing bookings in the schedule
        if (dayRangeInstances.length < reservation.nights || scheduler.eventStore.getEvents({
            resourceRecord : resource,
            startDate,
            endDate
        }).length > 0) {
            reservation.valid = false;
            scheduler.element.classList.add('b-invalid-reservation');
        }
        else {
            reservation.valid = true;
            scheduler.element.classList.remove('b-invalid-reservation');
        }
        DomHelper.removeClsGlobally(scheduler.element, 'b-selected');
        dayRangeInstances.forEach((range, i) => {
            const element = scheduler.getElementFromResourceTimeRangeRecord(range);
            element.classList.add('b-selected');
            element.classList.toggle('b-first', i === 0);
            element.classList.toggle('b-last', i === dayRangeInstances.length - 1);
        });
        if (Math.abs(domEvent.clientX - startX) > 10 && !this.tooltip) {
            reservation.dragStarted = true;
            this.tooltip = new Tooltip({
                rootElement : document.body,
                cls         : 'b-dayselector-tip',
                align       : 'b-t',
                html        : '1 night'
            });
            this.tooltip.show();
        }
        if (this.tooltip) {
            this.tooltip.alignTo(scheduler.getElementFromResourceTimeRangeRecord(dayRangeInstances[dayRangeInstances.length - 1]));
            this.tooltip.html = reservation.valid ? `${reservation.nights} night${reservation.nights > 1 ? 's' : ''}, $${reservation.totalPrice}` : 'Invalid reservation';
        }
    }

    // Mouse up anywhere
    onMouseUp() {
        var _this$tooltip;
        const {
            client: scheduler,
            reservation
        } = this;
        this.isReservingDate = false;
        DomHelper.removeClsGlobally(scheduler.element, 'b-selected');
        (_this$tooltip = this.tooltip) === null || _this$tooltip === undefined || _this$tooltip.destroy();
        this.tooltip = this.reservation = null;
        if (reservation !== null && reservation !== undefined && reservation.valid) {
            const {
                    resource
                } = reservation,
                eventRecord = new scheduler.eventStore.modelClass(reservation);
            scheduler.editEvent(eventRecord, resource);
        }
    }
    setReservingDate() {
        var _this$reservingDateLi2;
        clearTimeout(this.reservingDateTimer);
        this.isReservingDate = true;
        (_this$reservingDateLi2 = this.reservingDateListenersDetacher) === null || _this$reservingDateLi2 === undefined || _this$reservingDateLi2.call(this);
    }
    clearReservingDate() {
        var _this$reservingDateLi3;
        clearTimeout(this.reservingDateTimer);
        this.isReservingDate = false;
        (_this$reservingDateLi3 = this.reservingDateListenersDetacher) === null || _this$reservingDateLi3 === undefined || _this$reservingDateLi3.call(this);
    }
}
GridFeatureManager.registerFeature(DaySelector, false, 'Scheduler');

//endregion

//region "lib/PropertyModel.js"

// Custom resource model, adding the sleeps field
class PropertyModel extends SchedulerResourceModel {
    static $name = 'PropertyModel';
    static fields = [{
        name         : 'sleeps',
        type         : 'number',
        defaultValue : 2
    }];
}

//endregion

//region "lib/ReservationModel.js"

// Custom event model, adding the guests and pricePerNight fields
class ReservationModel extends SchedulerEventModel {
    static $name = 'ReservationModel';
    static fields = [{
        name         : 'guests',
        type         : 'number',
        defaultValue : 2
    }, {
        name : 'pricePerNight',
        type : 'number'
    }];
}

//endregion

// Applying localization settings to translate the placeholder value from 'New Event' to 'Guest' in english in the event editor
LocaleManager.applyLocale('En', {
    Object : {
        newEvent : 'Guest'
    }
});
const {
        xss
    } = StringHelper,
    startDate = new Date(2022, 10, 28),
    endDate = new Date(2022, 11, 20);
const scheduler = new Scheduler({
    appendTo          : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,
    viewPreset        : 'dayAndMonth',
    rowHeight         : 70,
    barMargin         : 15,
    tickSize          : 100,
    snap              : true,
    resourceImagePath : 'resources/',
    timeResolution    : {
        unit      : 'day',
        increment : 1
    },
    allowOverlap              : false,
    zoomOnTimeAxisDoubleClick : false,
    zoomOnMouseWheel          : false,
    autoCreate                : false,
    startDate,
    endDate,
    // Prevent dragging or resizing events into the "past" (the shaded part of the schedule)
    getDateConstraints() {
        return {
            start : new Date(2022, 11, 1),
            end   : new Date(2022, 11, 20)
        };
    },
    features : {
    // Custom feature that allows drag selecting days (see lib/DaySelector.js)
        daySelector  : true,
        // Built-in features:
        // Customize the event tooltip to display check in date and stay duration
        eventTooltip : {
            template : ({
                eventRecord
            }) => `
               <h4>Check-in:</h4>
               ${DateHelper.format(eventRecord.startDate, 'MMM Do')}
               <h4>Length of stay:</h4>
                ${eventRecord.duration} nights
           `
        },
        // Different summaries per time axis tick based on which button in the toolbar is pressed
        summary : {
            renderer : ({
                events: reservations
            }) => {
                let result;
                if (scheduler.widgetMap.summaryButton.value === 'count') {
                    result = reservations.length;
                }
                else {
                    result = reservations.reduce((total, reservation) => total + reservation.guests, 0);
                }
                return xss`${result || ''}`;
            }
        },
        // Time ranges are used to shade time in the past (simulated)
        timeRanges         : true,
        // Resource time ranges are used to display prices per date and property
        resourceTimeRanges : {
            enableMouseEvents : true
        },
        // Customize the event editor to better fit the use-case
        eventEdit : {
            editorConfig : {
                autoUpdateRecord : true,
                defaults         : {
                    labelPosition : 'above'
                },
                listeners : {
                    show() {
                        const {
                            record
                        } = this;
                        this.widgetMap.guestsField.max = record.resource.sleeps;
                    }
                }
            },
            items : {
                startTimeField : false,
                endTimeField   : false,
                endDateField   : false,
                nameField      : {
                    label : 'Guest name'
                },
                resourceField : {
                    label : 'Property'
                },
                startDateField : {
                    label : 'Check-in',
                    // Prevent changing a booking to start in the "past"
                    min   : new Date(2022, 11, 1),
                    span  : 2
                },
                durationField : {
                    type   : 'number',
                    label  : 'Nights',
                    name   : 'duration',
                    min    : 0,
                    weight : 500
                },
                priceField : {
                    type   : 'number',
                    name   : 'pricePerNight',
                    label  : 'Price per night (USD)',
                    weight : 210
                },
                // Custom field for number of guests
                guestsField : {
                    type     : 'number',
                    name     : 'guests',
                    label    : 'Number of guests',
                    weight   : 210,
                    value    : 2,
                    required : true,
                    min      : 1
                }
            }
        },
        //Disable features not to be used in this demo (mainly to prevent zooming, uses a fixed view)
        cellMenu           : false,
        scheduleMenu       : false,
        timeAxisHeaderMenu : false,
        eventDragCreate    : false,
        scheduleTooltip    : false,
        eventDrag          : {
            snapToResource : true
        }
    },
    tbar : [{
        type : 'widget',
        html : 'Sum:'
    }, {
        type        : 'buttongroup',
        rendition   : 'padded',
        ref         : 'summaryButton',
        toggleGroup : true,
        items       : [{
            value   : 'count',
            pressed : true,
            text    : 'Booked properties / day'
        }, {
            value : 'guests',
            text  : 'Booked guests / day'
        }],
        onClick() {
            scheduler.features.summary.refresh();
        }
    }, {
        type     : 'slidetoggle',
        text     : 'Sum selected rows',
        onChange : 'up.onSumChange'
    }, '->', {
        label          : 'View range:',
        type           : 'daterangefield',
        value          : [startDate, endDate],
        autoExpand     : true,
        fieldStartDate : {
            placeholder : 'Start date'
        },
        fieldEndDate : {
            placeholder : 'End date'
        },
        editable  : false,
        listeners : {
            change({
                value
            }) {
                // Change both configs at the same time to avoid invalid intermediate state
                // and double rendering:
                value && scheduler.setConfig({
                    startDate : value[0],
                    endDate   : value[1]
                });
            }
        }
    }],
    columns : [{
        type            : 'resourceInfo',
        text            : 'Property',
        width           : 260,
        sum             : 'count',
        summaryRenderer : ({
            sum
        }) => xss`Total properties: ${sum}`,
        showEventCount : false,
        showMeta       : property => xss`Sleeps ${property.sleeps}`
    }],
    crudManager : {
        autoLoad      : true,
        resourceStore : {
            modelClass : PropertyModel
        },
        resourceTimeRangeStore : new DailyRateStore(),
        eventStore             : {
            modelClass : ReservationModel
        },
        loadUrl : 'data/data.json'
    },
    onBeforeEventAdd({
        eventRecord,
        resourceRecords
    }) {
    // Copy price over to the reservation record when created
        eventRecord.pricePerNight = this.resourceTimeRangeStore.getPricePerNightFor(resourceRecords[0], eventRecord.startDate);
    },
    eventRenderer({
        eventRecord
    }) {
        return xss`${eventRecord.name} <i class="fa fa-user"><sup>${eventRecord.guests}</sup>`;
    },
    onSumChange({
        checked
    }) {
        this.features.summary.selectedOnly = checked;
    },
    // Here you can customize the HTML/content for each day cell
    resourceTimeRangeRenderer({
        resourceTimeRangeRecord
    }) {
    // See DailyRateStore.js for data model information
        return resourceTimeRangeRecord.name;
    },
    listeners : {
    // Create a new booking when double-clicking an available day
        resourceTimeRangeDblClick({
            resourceTimeRangeRecord,
            resourceRecord
        }) {
            scheduler.createEvent(resourceTimeRangeRecord.startDate, resourceRecord);
        }
    }
});