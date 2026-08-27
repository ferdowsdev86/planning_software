import { DateHelper, StringHelper } from '@bryntum/schedulerpro';
import { BryntumSchedulerProps } from '@bryntum/schedulerpro-angular';
import DailyRateStore, { DailyRateModel } from 'src/lib/DailyRateStore';
import PropertyModel from 'src/lib/PropertyModel';
import ReservationModel from 'src/lib/ReservationModel';

export const schedulerProps: BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    viewPreset : {
        base           : 'dayAndMonth',
        timeResolution : {
            unit      : 'day',
            increment : 1
        }
    },
    rowHeight                 : 70,
    barMargin                 : 15,
    tickSize                  : 100,
    snap                      : true,
    resourceImagePath         : 'assets/resources/',
    startDate                 : new Date(2022, 10, 28),
    endDate                   : new Date(2022, 11, 20),
    allowOverlap              : false,
    zoomOnTimeAxisDoubleClick : false,
    zoomOnMouseWheel          : false,
    autoCreate                : false,

    // Prevent dragging or resizing events into the "past" (the shaded part of the schedule)
    getDateConstraints() {
        return {
            start : new Date(2022, 11, 1),
            end   : new Date(2022, 11, 20)
        };
    },
    // Built-in features:
    // Customize the event tooltip to display check in date and stay duration
    eventTooltipFeature : {
        template : ({ eventRecord }) => `
            <event-tooltip-renderer
            checkin="${DateHelper.format(eventRecord.startDate as Date, 'MMM Do')}"
            duration="${eventRecord.duration}"
            </event-tooltip-renderer>
           `
    },

    // Time ranges are used to shade time in the past (simulated)
    timeRangesFeature : true,

    // Resource time ranges are used to display prices per date and property
    resourceTimeRangesFeature : {
        enableMouseEvents : true
    },

    // Customize the event editor to better fit the use-case
    eventEditFeature : {
        editorConfig : {
            autoUpdateRecord : true,
            defaults         : {
                labelPosition : 'above'
            }
        },
        items : {
            startTimeField : false,
            endTimeField   : false,
            endDateField   : false,

            nameField : {
                label : 'Guest name'
            },
            resourceField : {
                label : 'Property'
            },
            startDateField : {
                label : 'Check-in',
                flex  : '1 0 50%',
                // Prevent changing a booking to start in the "past"
                min   : new Date(2022, 11, 1)
            },
            durationField : {
                type   : 'number',
                label  : 'Nights',
                name   : 'duration',
                flex   : '1 0 50%',
                cls    : 'b-inline',
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
    cellMenuFeature           : false,
    scheduleMenuFeature       : false,
    timeAxisHeaderMenuFeature : false,
    eventDragCreateFeature    : false,
    scheduleTooltipFeature    : false,
    eventDragFeature          : {
        snapToResource : true
    },

    tbar : [
        {
            type : 'widget',
            html : 'Sum:'
        },
        {
            type        : 'buttongroup',
            ref         : 'summaryGroup',
            rendition   : 'padded',
            toggleGroup : true,
            items       : [
                {
                    type    : 'button',
                    ref     : 'countButton',
                    pressed : true,
                    text    : 'Booked properties / day'
                },
                {
                    type : 'button',
                    ref  : 'guestsButton',
                    text : 'Booked guests / day'
                }
            ]
        },
        {
            type : 'slidetoggle',
            ref  : 'selectedRowButton',
            text : 'Sum selected rows'
        },
        {
            type : 'button',
            ref  : 'printButton',
            text : 'Print'
        }
    ],

    columns : [
        {
            type            : 'resourceInfo',
            text            : 'Property',
            width           : 260,
            sum             : 'count',
            summaryRenderer : ({ sum }) => StringHelper.xss`Total properties: ${sum}`,
            showEventCount  : false,
            showMeta        : resource => StringHelper.xss`Sleeps ${(resource as PropertyModel).sleeps}`
        }
    ],

    crudManager : {
        autoLoad      : true,
        // @ts-ignore
        resourceStore : {
            modelClass : PropertyModel
        },

        resourceTimeRangeStore : new DailyRateStore(),

        eventStore : {
            // @ts-ignore
            modelClass : ReservationModel
        },

        loadUrl : 'assets/data/data.json'
    },

    eventRenderer({ eventRecord }) {
        return `
        <event-renderer
            destination="${StringHelper.xss`${eventRecord.isCreating ? '' : eventRecord.name}`}"
            guests="${(eventRecord as ReservationModel).guests}"
        </event-renderer>
        `;
    },

    // Render custom property pricePerNight on the range element
    resourceTimeRangeRenderer({ resourceTimeRangeRecord }) {
        const { pricePerNight } = resourceTimeRangeRecord as DailyRateModel;
        return pricePerNight ? StringHelper.xss`$${pricePerNight}` : '';
    }

};

