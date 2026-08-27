import { type BryntumSchedulerProps } from '@bryntum/schedulerpro-react';
import { DateHelper, SchedulerListenersTypes, StringHelper, SummaryConfig } from '@bryntum/schedulerpro';
import { DailyRateModel } from './lib/DailyRateStore';
import { ReservationModel } from './lib/ReservationModel';
import { PropertyModel } from './lib/PropertyModel';

export const useSchedulerProps = (
    summaryFeatureRenderer: SummaryConfig['renderer'],
    onResourceTimeRangeDblClick: SchedulerListenersTypes['resourceTimeRangeDblClick'],
    onBeforeEventAdd: SchedulerListenersTypes['beforeEventAdd']
) : BryntumSchedulerProps => ({
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
    resourceImagePath         : 'resources/',
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
           <h4>Check-in:</h4>
           ${DateHelper.format(eventRecord.startDate as Date, 'MMM Do')}
           <h4>Length of stay:</h4>
            ${eventRecord.duration} nights
       `
    },

    // Different summaries per time axis tick based on which button in the toolbar is pressed
    summaryFeature : {
        renderer : summaryFeatureRenderer
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

    // Disable features not to be used in this demo (mainly to prevent zooming, uses a fixed view)
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
            type       : 'button',
            ref        : 'selectedRowButton',
            text       : 'Sum selected rows',
            toggleable : true
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

        eventStore : {
            // @ts-ignore
            modelClass : ReservationModel
        },

        loadUrl : 'data/data.json'
    },

    eventRenderer : ({ eventRecord }) =>
        StringHelper.xss`${eventRecord.isCreating ? '' : eventRecord.name} <i class="fa fa-user">` +
        `<sup>${(eventRecord as ReservationModel).guests}</sup>`,

    // Render custom property pricePerNight on the range element
    resourceTimeRangeRenderer : ({ resourceTimeRangeRecord }) => {
        const { pricePerNight } = resourceTimeRangeRecord as DailyRateModel;
        return pricePerNight ? StringHelper.xss`$${pricePerNight}` : '';
    },

    onBeforeEventAdd,
    onResourceTimeRangeDblClick
});
