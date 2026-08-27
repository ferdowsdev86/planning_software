var {
    Scheduler,
    DateHelper,
    SchedulerEventModel
} = window.bryntum.schedulerpro;
class Flight extends SchedulerEventModel {
    static fields = [{
        name : 'aircraft'
    }, {
        name : 'airline'
    }, {
        name       : 'resourceId',
        dataSource : 'gate'
    }, {
        name       : 'startDate',
        dataSource : 'arrivalTime'
    }, {
        name       : 'endDate',
        dataSource : 'departureTime'
    }, {
        name         : 'durationUnit',
        defaultValue : 'hour'
    }, {
        name         : 'dollysRequired',
        type         : 'number',
        defaultValue : 0
    }, {
        name         : 'max',
        type         : 'number',
        defaultValue : 10
    }, {
        name : 'starred',
        type : 'boolean'
    }, 'inbound', 'outbound', {
        name         : 'departureAirport',
        defaultValue : ''
    }, {
        name         : 'departureCity',
        defaultValue : ''
    }, 'arrivalCity'];
}
new Scheduler({
    appendTo     : 'container',
    eventStyle   : 'indented',
    eventColor   : 'green',
    allowOverlap : false,
    rowHeight    : 70,
    barMargin    : 5,
    rowLines     : false,
    cellEllipsis : false,
    columns      : [{
        text   : 'Gate',
        field  : 'name',
        editor : false,
        renderer({
            value
        }) {
            return {
                class : 'gate',
                text  : value
            };
        }
    }],
    features : {
        regionResize    : false,
        scheduleTooltip : false,
        eventDragCreate : false,
        eventDrag       : {
            snapToResource : true
        },
        eventTooltip : {
            template : ({
                eventRecord
            }) => `
            <div class="b-timing-container">
                <div class="b-departure-datetime">
                    <span class="b-departure-time">${DateHelper.format(eventRecord.startDate, 'LST')}</span>
                    <span class="b-departure-date">${DateHelper.format(eventRecord.startDate, 'ddd, DD MMM')}</span>
                </div>
                <div class="b-arrival-datetime">
                    <span class="b-arrival-time">${DateHelper.format(eventRecord.endDate, 'LST')}</span>
                    <span class="b-arrival-date">${DateHelper.format(eventRecord.endDate, 'ddd, DD MMM')}</span>
                </div>
            </div>
            <div class="b-icons-container">
                <i class="b-circle"></i>
                <div class="b-vertical-line">
                    <i class="fa fa-plane-up"></i>
                </div>
                <i class="fa fa-map-marker-alt"></i>
            </div>
            <div class="b-airports-container">
                <div class="b-departure-info">
                    <span class="b-departure-city">${eventRecord.departureCity}</span>
                    <span class="b-departure-airport">${eventRecord.departureAirport}</span>
                </div>
                <span class="b-duration">${eventRecord.fullDuration}</span>
                <div class="b-arrival-info">
                    <span class="b-arrival-city">${eventRecord.arrivalCity}</span>
                    <span class="b-arrival-airport">${eventRecord.arrivalAirport}</span>
                </div>
            </div>
            `
        },
        eventEdit : {
            items : {
                airlineField : {
                    weight   : 0,
                    type     : 'textfield',
                    name     : 'airline',
                    label    : 'Airline',
                    readOnly : true
                },
                aircraftField : {
                    weight   : 1,
                    type     : 'textfield',
                    name     : 'aircraft',
                    label    : 'Aircraft',
                    readOnly : true
                },
                nameField : {
                    hidden : true
                },
                // ref for an existing field
                resourceField : {
                    // Change its label
                    label : 'Gate'
                }
            }
        }
    },
    startDate                 : new Date(2023, 9, 6, 6, 30),
    endDate                   : new Date(2023, 9, 8, 6),
    tickSize                  : 100,
    snap                      : true,
    zoomOnMouseWheel          : false,
    zoomOnTimeAxisDoubleClick : false,
    viewPreset                : {
        base    : 'hourAndDay',
        headers : [{
            unit       : 'minute',
            increment  : 30,
            dateFormat : 'LT'
        }]
    },
    timeResolution : {
        increment : 5,
        unit      : 'minute'
    },
    crudManager : {
        autoLoad   : true,
        eventStore : {
            modelClass : Flight
        },
        loadUrl : 'data/data.json'
    },
    eventRenderer({
        eventRecord
    }) {
        return [{
            class    : 'header',
            children : [{
                class : 'inbound',
                text  : eventRecord.inbound
            }, {
                class    : 'aircraft',
                children : [{
                    tag   : 'i',
                    class : 'fa fa-plane-departure'
                }, eventRecord.aircraft]
            }, {
                class : 'outbound',
                text  : eventRecord.outbound
            }]
        }, {
            class    : 'footer',
            children : [{
                tag   : 'i',
                class : {
                    fa        : 1,
                    'fa-star' : 1,
                    starred   : eventRecord.starred
                }
            }, ...new Array(eventRecord.max).fill().map((item, i) => ({
                class : {
                    box    : 1,
                    filled : i < eventRecord.dollysRequired
                },
                dataset : {
                    btip : `${i + 1} dollys required`
                }
            })), {
                tag   : 'span',
                class : 'value',
                text  : `${eventRecord.dollysRequired} / ${eventRecord.max}`
            }]
        }];
    },
    onEventClick({
        eventRecord,
        event
    }) {
        const {
                target
            } = event,
            {
                classList
            } = target;
        if (classList.contains('fa-star')) {
            eventRecord.starred = !eventRecord.starred;
        }
        else if (classList.contains('box')) {
            eventRecord.dollysRequired = Array.from(target.parentElement.children).indexOf(target);
        }
    }
});