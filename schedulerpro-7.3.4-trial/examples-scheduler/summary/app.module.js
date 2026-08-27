import shared from '../_shared/shared.module.js';
import { Scheduler, SchedulerResourceModel, SchedulerEventModel, StringHelper } from '../../build/schedulerpro.module.js';

class Property extends SchedulerResourceModel {
    static get fields() {
        return [
            { name : 'sleeps', type : 'int', defaultValue : 2 },
            { name : 'rate', type : 'int', defaultValue : 100 },
            // Using icons for resources
            {
                name         : 'image',
                defaultValue : false
            }
        ];
    }
}

class Booking extends SchedulerEventModel {
    static get fields() {
        return [
            {
                name         : 'guests',
                defaultValue : 2
            }
        ];
    }

    get value() {
        return this.duration * this.resource.rate;
    }
}

const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    eventStyle     : 'rounded',
    viewPreset     : 'weekAndDayLetter',
    rowHeight      : 50,
    barMargin      : 5,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },

    features : {
        summary : {
            renderer : ({ events : reservations }) => {
                let result;
                if (scheduler.widgetMap.summaryCombo.value === 'count') {
                    result = reservations.length;
                }
                else {
                    result = reservations.reduce((total, reservation) => total += reservation.guests, 0);
                }
                result = result || '';
                return StringHelper.xss`${result}`;
            }
        },

        eventEdit : {
            editorConfig : {
                defaults : {
                    labelPosition : 'above'
                }
            },
            items : {
                startDateField : {
                    flex : '1 0 50%'
                },
                endDateField : {
                    flex : '1 0 50%',
                    cls  : ''
                },
                startTimeField : false,
                endTimeField   : false,
                // Custom field for number of guests
                guestsField    : {
                    type     : 'number',
                    name     : 'guests',
                    label    : 'Guests',
                    weight   : 210,
                    value    : 2,
                    required : true,
                    min      : 1
                }
            }
        }
    },

    startDate    : new Date(2025, 11, 1),
    endDate      : new Date(2025, 11, 20),
    allowOverlap : false,
    tbar         : [
        {
            type         : 'combo',
            ref          : 'summaryCombo',
            width        : 320,
            label        : 'Summary:',
            displayField : 'name',
            valueField   : 'id',
            editable     : false,
            items        : [{
                id   : 'count',
                name : 'Booked properties / day'
            }, {
                id   : 'guests',
                name : 'Booked guests / day'
            }],
            value : 'count',
            onChange() {
                scheduler.features.summary.refresh();
            }
        },
        {
            text       : 'Sum selected rows',
            toggleable : true,
            onToggle   : 'up.onSelectToggle'
        }
    ],

    tickSize : 80,
    columns  : [
        {
            type            : 'resourceInfo',
            text            : 'Name',
            width           : 220,
            sum             : 'count',
            summaryRenderer : ({ sum }) => StringHelper.xss`Total properties: ${sum}`,
            showEventCount  : false,
            showMeta        : property => StringHelper.xss`Sleeps ${property.sleeps}`
        },
        {
            type  : 'number',
            text  : 'Daily rate',
            width : 150,
            field : 'rate',
            sum   : (sum, resourceRecord) => {
                const { startDate, endDate } = scheduler;

                return sum + scheduler.eventStore.getEvents({
                    resourceRecord,
                    startDate,
                    endDate
                }).reduce((sum, record) => sum + record.value || 0, 0);
            },
            format : {
                style    : 'currency',
                currency : 'USD',
                fraction : 0
            },
            summaryRenderer : ({ sum }) => StringHelper.xss`Revenue: $${sum}`
        }
    ],

    crudManager : {
        autoLoad      : true,
        resourceStore : {
            modelClass : Property
        },

        eventStore : {
            modelClass : Booking,
            listeners  : {
                change() {
                    // Update grid column summaries when any event data changes
                    scheduler.features.summary.refresh();
                }
            }
        },

        transport : {
            load : {
                url : 'data/data.json'
            }
        }
    },

    eventRenderer({ eventRecord }) {
        return StringHelper.xss`${eventRecord.name} <i class="fa fa-user"><sup>${eventRecord.guests}</sup>`;
    },

    onSelectToggle() {
        this.features.summary.selectedOnly = !this.features.summary.selectedOnly;
    }
});
