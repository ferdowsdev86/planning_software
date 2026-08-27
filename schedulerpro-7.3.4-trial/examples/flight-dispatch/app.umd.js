var {
    ResourceModel,
    EventModel,
    DateHelper,
    StringHelper,
    List,
    SchedulerPro
} = window.bryntum.schedulerpro;
//region "lib/Aircraft.js"

// Custom Aircraft model, based on ResourceModel with additional fields
class Aircraft extends ResourceModel {
    static fields = ['fleet'];
}

//endregion

//region "lib/Flight.js"

// Custom Flight model, based on EventModel with additional fields and changed defaults
class Flight extends EventModel {
    static fields = ['airline', {
        name         : 'flightNumber',
        defaultValue : ''
    }, 'pairedFlightNumber', {
        name         : 'originAirportCode',
        defaultValue : ''
    }, {
        name         : 'destinationAirportCode',
        defaultValue : ''
    }, {
        name       : 'resourceId',
        dataSource : 'aircraftId'
    }, {
        name       : 'startDate',
        dataSource : 'schedule.departureTime'
    }, {
        name       : 'endDate',
        dataSource : 'schedule.arrivalTime'
    }, {
        name         : 'preamble',
        dataSource   : 'schedule.loading',
        defaultValue : '10 minutes'
    }, {
        name         : 'postamble',
        dataSource   : 'schedule.unloading',
        defaultValue : '10 minutes'
    }, {
        name       : 'pilots',
        dataSource : 'staff.pilots'
    }, {
        name       : 'flightAttendants',
        dataSource : 'staff.flightAttendants'
    }, {
        name       : 'groundCrew',
        dataSource : 'staff.groundCrew'
    }, {
        name       : 'departureTime',
        dataSource : 'schedule.departureTime'
    }, {
        name       : 'arrivalTime',
        dataSource : 'schedule.arrivalTime'
    }, {
        name : 'warning'
    }, 'nonmutable', 'mutable', 'changed', 'maintenance', 'overlap', 'delayed', 'shortened', 'tailviolation', 'locked', 'crewfeasibility', 'crewlink', 'uncertainty'];
    static defaults = {
    // In this demo, default duration for sessions will be hours (instead of days)
        durationUnit : 'h'
    };
    get linkedFlight() {
        return this.firstStore.find(flight => flight.flightNumber === this.pairedFlightNumber);
    }
    get loadingTimeMinutes() {
        return parseInt(this.loadingTimeMinutes || 0);
    }
    get unloadingTimeMinutes() {
        return parseInt(this.unloadingTimeMinutes || 0);
    }
    get loadingStartDate() {
        return DateHelper.add(this.startDate, -this.preamble.magnitude, this.preamble.unit);
    }
    get unloadingStartDate() {
        return DateHelper.add(this.endDate, this.postamble.magnitude, this.postamble.unit);
    }
    get iconCls() {
        switch (true) {
            case Boolean(this.warning):
            case this.uncertainty:
                return 'fa fa-warning';
            case this.crewlink:
                return 'fa fa-minus';
            case this.crewfeasibility:
                return 'fa fa-person';
            case this.locked:
                return 'fa fa-lock';
            case this.maintenance:
                return 'fa fa-wrench';
        }
    }
    get eventColor() {
        switch (true) {
            case this.nonmutable:
                return 'pink';
            case this.mutable:
                return 'indigo';
            case this.changed:
                return 'purple';
            case this.maintenance:
                return 'lime';
            case this.overlap:
                return 'violet';
            case this.delayed:
                return 'orange';
            case this.shortened:
                return 'teal';
        }
    }
}

//endregion

//region "lib/FlightTooltip.js"

// Custom tooltip template

const flightTemplate = eventRecord => {
        var _eventRecord$preamble, _eventRecord$postambl;
        const color = eventRecord.eventColor,
            primaryColor = color ? `--b-primary: var(--b-color-${color})` : '';
        return StringHelper.xss`
<div class="flight">
    <div class="taxiing">${((_eventRecord$preamble = eventRecord.preamble) === null || _eventRecord$preamble === undefined ? undefined : _eventRecord$preamble.magnitude) || ''}<i class="fa fa-plane-departure"></i></div>
    <div class="flightTime" style="${primaryColor}"><strong>${eventRecord.flightNumber}</strong> ${eventRecord.originAirportCode} <i class="fa fa-arrow-right"></i> ${eventRecord.destinationAirportCode}</div>
    <div class="taxiing">${((_eventRecord$postambl = eventRecord.postamble) === null || _eventRecord$postambl === undefined ? undefined : _eventRecord$postambl.magnitude) || ''}<i class="fa fa-plane-arrival"></i></div>
</div>`;
    },
    timingRowTemplate = eventRecord => `
<div class="timing">
    <div>${DateHelper.format(eventRecord.loadingStartDate, 'HH:mm')}</div>
    <div>${DateHelper.format(eventRecord.startDate, 'HH:mm')}</div>
    <div class="duration">${eventRecord.fullDuration}</div>
    <div>${DateHelper.format(eventRecord.endDate, 'HH:mm')}</div>
    <div>${DateHelper.format(eventRecord.unloadingStartDate, 'HH:mm')}</div>
</div> 
`;
const flightTooltip = (flight1, flight2) => flightTemplate(flight1) + timingRowTemplate(flight1) + (
// Show info about linked flight when available
    flight2 ? flightTemplate(flight2) + timingRowTemplate(flight2) : '') + (flight1.warning ? `<div class="warning"><i class="fa fa-warning"></i> ${flight1.warning}</div>` : '');

//endregion

//region "lib/Legend.js"

// Custom legend that allows user to filter by clicking labels
class Legend extends List {
    static $name = 'Legend';
    static type = 'legend';
    static configurable = {
        multiSelect : true,
        itemTpl     : record => `${record.icon ? `
            <i class="${record.icon} b-colorize b-color-${record.color}"></i>` : `<div class="b-colorize b-color-square b-color-${record.color}"></div>`}
            <span class="b-legend-text">${record.text}</span>
        `,
        store : {
            fields : ['icon'],
            data   : [{
                text  : 'Non-mutable',
                color : 'pink'
            }, {
                text  : 'Mutable',
                color : 'indigo'
            }, {
                text  : 'Changed',
                color : 'purple'
            }, {
                text  : 'Maintenance',
                color : 'lime'
            }, {
                text  : 'Overlap',
                color : 'violet'
            }, {
                text  : 'Delayed',
                color : 'orange'
            }, {
                text  : 'Shortened',
                color : 'teal'
            }, {
                text  : 'Tail violation',
                icon  : 'fa fa-warning',
                color : 'red'
            }, {
                text  : 'No escape',
                color : 'deep-orange'
            }, {
                text  : 'Locked',
                icon  : 'fa fa-lock',
                color : 'pink'
            }, {
                text  : 'Crew feasibility',
                icon  : 'fa fa-person',
                color : 'blue'
            }, {
                text  : 'Crew link',
                icon  : 'fa fa-minus',
                color : 'blue'
            }, {
                text  : 'Uncertainty',
                icon  : 'fa fa-warning',
                color : 'gray'
            }]
        }
    };
}
Legend.initClass();

//endregion

//region "lib/Schedule.js"

// Customized scheduler displaying flights
class Schedule extends SchedulerPro {
    static $name = 'Schedule';
    static configurable = {
        rowHeight                     : 65,
        barMargin                     : 5,
        snap                          : true,
        useInitialAnimation           : false,
        updateTimelineContextOnScroll : false,
        stickyHeaders                 : false,
        columns                       : [{
            type  : 'tree',
            text  : 'Aircraft',
            width : 200,
            field : 'name'
        }],
        // Custom view preset with header configuration
        viewPreset : {
            base           : 'hourAndDay',
            tickWidth      : 35,
            timeResolution : {
                unit      : 'min',
                increment : 5
            },
            headers : [{
                unit       : 'hour',
                dateFormat : 'HH:mm'
            }]
        },
        features : {
            tree         : true,
            dependencies : {
                allowCreate : false
            },
            split       : true,
            eventBuffer : true,
            eventDrag   : {
                // Prevent dragging flights to other aircraft
                constrainDragToResource : true,
                snapToResource          : true
            },
            // Customize its contents
            taskEdit : {
                items : {
                    generalTab : {
                        // Customize the title of the general tab
                        title : 'Flight details',
                        items : {
                            nameField : {
                                name  : 'flightNumber',
                                label : 'Flight'
                            },
                            resourcesField : {
                                label : 'Aircraft'
                            },
                            startDateField : {
                                label : 'Departs'
                            },
                            preambleField : {
                                label  : 'Loading',
                                // Above duration field
                                weight : 350
                            },
                            postambleField : {
                                label  : 'Unloading',
                                weight : 360
                            },
                            effortField      : null,
                            endDateField     : null,
                            percentDoneField : null,
                            originField      : {
                                type   : 'text',
                                name   : 'originAirportCode',
                                label  : 'From',
                                // Place after name field
                                weight : 150
                            },
                            destinationField : {
                                type   : 'text',
                                name   : 'destinationAirportCode',
                                label  : 'To',
                                weight : 151
                            }
                        }
                    },
                    predecessorsTab : null,
                    successorsTab   : null
                }
            },
            resourceTimeRanges : true,
            eventMenu          : {
                items : {
                    splitEvent : null,
                    editEvent  : {
                        text : 'Edit flight'
                    },
                    copyEvent : null,
                    cutEvent  : null
                }
            },
            eventTooltip : {
                template : ({
                    eventRecord
                }) => flightTooltip(eventRecord, eventRecord.linkedFlight)
            },
            stickyEvents    : false,
            scheduleTooltip : false
        },
        eventRenderer({
            eventRecord,
            renderData
        }) {
            renderData.iconCls = null;
            const roundedDuration = Math.round(eventRecord.duration * 10) / 10;
            return [{
                tag       : 'span',
                className : 'b-flight-number',
                children  : [{
                    tag   : 'i',
                    class : eventRecord.iconCls
                }, eventRecord.flightNumber]
            }, {
                class    : 'b-flight-details',
                children : [{
                    tag   : 'i',
                    class : 'fa fa-plane-departure'
                },
                // Show origin and destination if set
                (eventRecord.originAirportCode || eventRecord.destinationAirportCode) && {
                    tag  : 'span',
                    text : `${eventRecord.originAirportCode} -> ${eventRecord.destinationAirportCode}`
                },
                // Show duration when available
                roundedDuration && {
                    tag   : 'span',
                    class : 'b-flight-duration',
                    text  : `${roundedDuration} ${eventRecord.durationUnit}s`
                }]
            }];
        },
        listeners : {
            // Only allow creating flights on planes
            beforeDragCreate({
                resourceRecord
            }) {
                return resourceRecord.isLeaf;
            }
        }
    };
}

//endregion

const scheduler = new Schedule({
    project : {
        autoLoad      : true,
        resourceStore : {
            modelClass : Aircraft
        },
        eventStore : {
            modelClass : Flight
        },
        loadUrl : './data/data.json'
    },
    appendTo     : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom   : true,
    startDate    : '2023-06-13T00:00:00',
    endDate      : '2023-06-13T23:45:00',
    rowHeight    : 30,
    barMargin    : 5,
    tickSize     : 100,
    eventStyle   : 'tonal',
    eventLayout  : 'none',
    allowOverlap : false,
    tbar         : {
        overflow : null,
        items    : {
            rowHeight : {
                type      : 'slider',
                label     : 'Row height',
                showValue : 'thumb',
                value     : 30,
                min       : 30,
                step      : 1,
                max       : 75,
                onInput({
                    source,
                    value
                }) {
                    scheduler.rowHeight = value;
                }
            },
            spacer : {
                type : 'widget',
                cls  : 'b-toolbar-fill'
            },
            legend : {
                type : 'legend',
                flex : 1,
                async onItem({
                    source
                }) {
                    await scheduler.eventStore.clearFilters();
                    if (source.selected.count > 0) {
                        const items = source.selected.map(item => item.text.toLowerCase().replace(/[\s-]/, '', 'g'));
                        await scheduler.eventStore.filter(eventRecord => items.some(item => eventRecord[item]));
                    }
                }
            }
        }
    }
});