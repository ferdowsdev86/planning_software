import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';
import '../../../lib/Grid/feature/Stripe.js';
import '../../../lib/Scheduler/column/ResourceInfoColumn.js';
import '../../../lib/SchedulerPro/feature/EventBuffer.js';
import SchedulerPro from '../../../lib/SchedulerPro/view/SchedulerPro.js';
import './AddressSearchField.js';

export default class Schedule extends SchedulerPro {
    static type = 'schedule';
    static $name =  'Schedule';

    static configurable = {
        allowOverlap : false,
        // Custom view preset with header configuration
        viewPreset   : {
            tickWidth         : 20,
            displayDateFormat : 'LST',
            shiftIncrement    : 1,
            shiftUnit         : 'day',
            timeResolution    : {
                unit      : 'minute',
                increment : 30
            },
            headers : [{
                unit       : 'hour',
                dateFormat : 'LST'
            }]
        },
        features : {
            stripe      : true,
            eventBuffer : {
                // The event buffer time spans are considered as unavailable time
                bufferIsUnavailableTime : true
            },
            taskEdit : {
                items : {
                    generalTab : {
                        items : {
                            resourcesField : {
                                required : true
                            },
                            // For this demo we add an extra remote address search field
                            addressField : {
                                type   : 'addresssearchfield',
                                label  : 'Address',
                                name   : 'address',
                                weight : 100
                            },
                            preambleField : {
                                label : 'Travel to'
                            },
                            postambleField : {
                                label : 'Travel from'
                            }
                        }
                    }
                }
            }
        },

        rowHeight  : 80,
        barMargin  : 4,
        eventStyle : 'traced',

        columns : [
            {
                type           : 'resourceInfo',
                text           : 'Name',
                width          : 200,
                showEventCount : false,
                showRole       : true
            }
        ],

        resourceImages : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        },

        tbar : [
            {
                text    : 'Add task',
                icon    : 'fa fa-plus',
                color   : 'b-green',
                onClick : 'up.onNewEventClick'
            },
            '->',
            {
                type     : 'datefield',
                ref      : 'dateField',
                width    : 180,
                editable : false,
                step     : 1,
                onChange : 'up.onDateFieldChange'
            },
            {
                type                 : 'textfield',
                ref                  : 'filterByName',
                width                : 180,
                placeholder          : 'Filter tasks',
                clearable            : true,
                keyStrokeChangeDelay : 100,
                triggers             : {
                    filter : {
                        align : 'start',
                        cls   : 'fa fa-filter'
                    }
                },
                onChange : 'up.onFilterChange'
            },
            {
                type     : 'slidetoggle',
                ref      : 'toggleUnscheduled',
                label    : 'Show unscheduled',
                value    : true,
                height   : 'auto',
                onChange : 'up.onToggleUnscheduled'
            }
        ]
    };

    construct(...args) {
        super.construct(...args);

        this.widgetMap.dateField.value = this.startDate;
    }

    onFilterChange({ value }) {
        value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Replace all previous filters and set a new filter
        this.eventStore.filter({
            filters : event => new RegExp(value, 'i').test(event.name),
            replace : true
        });
    }

    onDateFieldChange({ value, userAction }) {
        userAction && this.setTimeSpan(DateHelper.add(value, 8, 'hour'), DateHelper.add(value, 20, 'hour'));
    }

    onNewEventClick() {
        const newTask = new this.eventStore.modelClass({
            startDate : this.startDate
        });

        this.editEvent(newTask);
    }

    onPrevious() {
        this.shiftPrevious();
    }

    onNext() {
        this.shiftNext();
    }

    onToggleUnscheduled({ value }) {
        this.trigger('unscheduledToggle', { value });
    }

    // Custom event renderer showing the task name + location icon with a shortened address text
    eventRenderer({ eventRecord }) {
        return [
            {
                tag       : 'span',
                className : 'event-name',
                html      : StringHelper.encodeHtml(eventRecord.name)
            },
            {
                tag       : 'span',
                className : 'location',
                children  : [
                    eventRecord.shortAddress ? {
                        tag       : 'i',
                        className : 'fa fa-map-marker-alt'
                    } : null,
                    eventRecord.shortAddress || '⠀'
                ]
            }
        ];
    }
}

Schedule.initClass();
