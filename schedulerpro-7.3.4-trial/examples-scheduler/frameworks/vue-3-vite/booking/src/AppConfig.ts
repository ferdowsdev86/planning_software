import type { BryntumSchedulerProps } from '@bryntum/schedulerpro-vue-3';
import { DateHelper, type SchedulerListenersTypes, StringHelper, type SummaryConfig } from '@bryntum/schedulerpro';
import type { DailyRateModel } from './lib/DailyRateStore';
import { ReservationModel } from './lib/ReservationModel';
import { PropertyModel } from './lib/PropertyModel';

const startDate = new Date(2022, 10, 28);
const endDate = new Date(2022, 11, 20);

export const useSchedulerProps = (
    summaryFeatureRenderer: SummaryConfig['renderer'],
    resourceTimeRangeDblClick: SchedulerListenersTypes['resourceTimeRangeDblClick'],
    beforeEventAdd: SchedulerListenersTypes['beforeEventAdd']
): BryntumSchedulerProps => ({
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
    startDate,
    endDate,
    allowOverlap              : false,
    zoomOnTimeAxisDoubleClick : false,
    zoomOnMouseWheel          : false,
    autoCreate                : false,
    // Enables smoother wheel and pinch zooming
    smoothZoom                : true,

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
                span  : 2,
                // Prevent changing a booking to start in the "past"
                min   : new Date(2022, 11, 1)
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
            rendition   : 'padded',
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
            type : 'slidetoggle',
            ref  : 'selectedRowButton',
            text : 'Sum selected rows'
        },
        '->',
        {
            label          : 'View range:',
            ref            : 'viewRange',
            type           : 'daterangefield',
            // @ts-expect-error - value is typed as string, but per docs can be an array of string /date for rangefields
            value          : [startDate, endDate],
            autoExpand     : true,
            fieldStartDate : {
                placeholder : 'Start date'
            },
            fieldEndDate : {
                placeholder : 'End date'
            },
            style : `{
                marginInlineEnd : '2em'
            }`,
            editable : false
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

    listeners : {
        beforeEventAdd,
        resourceTimeRangeDblClick
    }
});
