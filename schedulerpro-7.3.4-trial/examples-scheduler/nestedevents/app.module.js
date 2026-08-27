import shared from '../_shared/shared.module.js';
import { DateHelper, StringHelper, Toast, SchedulerEventStore, SchedulerEventModel, Scheduler } from '../../build/schedulerpro.module.js';

// NOTE:
// This example implements rudimentary support for nested events in Scheduler, all done in demo code. If your use-case
// is more complex, we recommend you check Scheduler Pro out instead. It has more extensive support for nested events
// built-in, and multiple demos that shows how to use it.

class Task extends SchedulerEventModel {
    static get fields() {
        return [
            // Use a nested store to contain the child events of a parent event
            { name : 'agenda', type : 'store', storeClass : SchedulerEventStore }
        ];
    }
}

const
    // Normalizes agenda items on load by converting string dates to actual dates and by calculating start and end offsets
    // from the events startDate, to keep a relative position later on drag/resize
    normalizeAgendaItems = eventData => {
        eventData.startDate = DateHelper.parse(eventData.startDate);
        eventData.agenda?.forEach(nestedEvent => {
            nestedEvent.startDate = DateHelper.parse(nestedEvent.startDate);
            nestedEvent.endDate = DateHelper.parse(nestedEvent.endDate);
            // Calculate offsets, more useful for rendering in case event is dragged to a new date
            nestedEvent.startOffset = DateHelper.diff(eventData.startDate, nestedEvent.startDate);
            nestedEvent.endOffset = nestedEvent.startOffset + DateHelper.diff(nestedEvent.startDate, nestedEvent.endDate);
        });
    },

    // Updates nested events dates on resize, based on events startDate and offsets stored during normalization (above)
    refreshAgendaDates   = eventRecord => {
        eventRecord.agenda?.forEach(nestedEvent => {
            nestedEvent.setStartEndDate(DateHelper.add(eventRecord.startDate, nestedEvent.startOffset), DateHelper.add(eventRecord.startDate, nestedEvent.endOffset));
        });
    };

const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    startDate      : new Date(2018, 8, 24, 7),
    endDate        : new Date(2018, 8, 25),
    viewPreset     : 'hourAndDay',
    rowHeight      : 60,
    barMargin      : 10,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },

    columns : [
        { type : 'resourceInfo', text : 'Name', field : 'name', width : 130 }
    ],

    features : {
        eventTooltip : {
            forSelector : '.b-sch-event, .nested',
            template    : ({ tip, eventRecord }) => {
                const
                    { target }   = tip.triggeredByEvent,
                    { resource } = eventRecord;

                let eventObj = eventRecord;
                if (target.matches('.nested')) {
                    eventObj = eventRecord.agenda.getById(target.id);
                }

                return StringHelper.xss`
                    <h3>${eventObj.name}</h3>
                    <h5>Assigned to:</h5>
                    ${resource.name}
                    <h5>Time:</h5>
                    ${DateHelper.format(eventObj.startDate, 'LT')} - ${DateHelper.format(eventObj.endDate, 'LT')}
                `;
            }
        },
        regionResize : true,
        // Nested events have fixed content
        stickyEvents : false
    },

    listeners : {
        // When clicking a nested event, it shows a toast with its name
        eventClick({ eventRecord, domEvent : { target } }) {
            if (target.matches('.nested')) {
                const nestedEventClicked = eventRecord.agenda.getById(target.id);
                Toast.show(`Nested event clicked: ${nestedEventClicked.name}`);
            }
        }
    },

    crudManager : {
        autoLoad  : true,
        loadUrl   : 'data/data.json',
        listeners : {
            // Will be called after data is fetched but before it is loaded into stores
            beforeLoadApply({ response }) {
                // Turn "nested event" dates into actual dates, to not have to process them each time during render
                response.events.rows.forEach(event => normalizeAgendaItems(event));
            }
        },
        eventStore : {
            modelClass : Task,
            listeners  : {
                // When an events startDate changes we want to update the dates of the nested events too
                update({ record, changes }) {
                    if (changes.startDate) {
                        refreshAgendaDates(record);
                    }
                }
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    // eventRenderer is here used to translate the dates of nested events into pixels
    eventRenderer({ eventRecord, renderData }) {
        const
            // Note that during a resize, we have to use `eventRecord.get('startDate')` to get the current value.
            // The value is not properly updated until the resize finishes
            startDate  = eventRecord.get('startDate'),
            // getDistanceForDuration gives us a px distance value
            dateToPx   = date => this.timeAxisViewModel.getDistanceForDuration(date - startDate),
            { agenda } = eventRecord;

        if (agenda) {
            // Calculate coordinates for all nested events and put in a DomConfig object
            const nestedEventData = agenda.map(nestedTask => {
                const
                    position = dateToPx(DateHelper.add(startDate, nestedTask.startOffset)),
                    size     = dateToPx(DateHelper.add(startDate, nestedTask.endOffset)) - position;

                return {
                    tag   : 'div',
                    id    : nestedTask.id,
                    class : 'nested',
                    style : {
                        [this.isHorizontal ? 'left' : 'top']     : `${position}px`,
                        [this.isHorizontal ? 'width' : 'height'] : `${size}px`
                    },
                    text : nestedTask.name
                };
            });

            renderData.cls.eventWithAgenda = 1;
            return nestedEventData;
        }
        return eventRecord.name;
    }
});


Toast.show({
    html : `
        This example has basic support for nested events implemented in demo code. For proper support, we 
        recommend checking out <a href="https://bryntum.com/products/scheduler-pro/examples/nested-events-configuration">Scheduler Pro</a>
    `,
    timeout : 7500,
    width   : 550
});
