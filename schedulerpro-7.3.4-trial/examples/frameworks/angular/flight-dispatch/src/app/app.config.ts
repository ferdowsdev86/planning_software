import { type BryntumSchedulerProProjectModelProps, type BryntumSchedulerProProps } from '@bryntum/schedulerpro-angular';
import { Aircraft } from './models/aircraft.model';
import { Flight } from './models/flight.model';
import { Collection, DateHelper, EventModel, List, SchedulerPro, Widget } from '@bryntum/schedulerpro';
import { Legend, LegendConfig } from './lib/legend';

export const projectProps: BryntumSchedulerProProjectModelProps = {
    loadUrl       : 'assets/data/data.json',
    autoLoad      : true,
    resourceStore : {
        modelClass : Aircraft
    },
    eventStore : {
        modelClass : Flight
    }
};

// helper function to get the schedulerPro instance
const getSchedulerPro = (source: Widget) => source.up(SchedulerPro.type) as SchedulerPro;

export const schedulerProProps: BryntumSchedulerProProps = {
    startDate                     : new Date('2025-06-13T00:00:00'),
    endDate                       : new Date('2025-06-13T23:45:00'),
    rowHeight                     : 30,
    barMargin                     : 5,
    snap                          : true,
    useInitialAnimation           : false,
    updateTimelineContextOnScroll : false,
    stickyHeaders                 : false,
    tickSize                      : 100,
    eventStyle                    : 'tonal',
    eventLayout                   : 'none',
    allowOverlap                  : false,
    // Enables smoother wheel and pinch zooming
    smoothZoom                    : true,

    columns : [
        {
            type  : 'tree',
            text  : 'Aircraft',
            width : 200,
            field : 'name'
        }
    ],

    // Custom view preset with header configuration
    viewPreset : {
        base           : 'hourAndDay',
        tickWidth      : 35,
        timeResolution : {
            unit      : 'min',
            increment : 5
        },
        headers : [
            {
                unit       : 'hour',
                dateFormat : 'HH:mm'
            }
        ]
    },

    treeFeature         : true,
    dependenciesFeature : {
        allowCreate : false
    },

    splitFeature       : true,
    eventBufferFeature : true,
    eventDragFeature   : {
        // Prevent dragging flights to other Aircraft
        constrainDragToResource : true,
        snapToResource          : true
    },

    // Customize its contents
    taskEditFeature : {
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
    resourceTimeRangesFeature : true,
    eventMenuFeature          : {
        items : {
            splitEvent : null,
            editEvent  : {
                text : 'Edit flight'
            },
            copyEvent : null,
            cutEvent  : null
        }
    },
    eventTooltipFeature : {
        template : ({ eventRecord } : { eventRecord : EventModel }) => {
            const thisFlight = eventRecord as Flight;

            const
                // Flight template function
                flightTemplate    = (flight: Flight) => `
                <div class="flight">
                    <div class="taxiing">${flight.preamble?.magnitude || ''}<i class="fa fa-plane-departure"></i></div>
                    <div class="flightTime"><strong>${flight.flightNumber}</strong> ${flight.originAirportCode} <i class="fa fa-arrow-right"></i> ${flight.destinationAirportCode}</div>
                    <div class="taxiing">${flight.postamble?.magnitude || ''}<i class="fa fa-plane-arrival"></i></div>
                </div>`,
                // Timing row template function
                timingRowTemplate = (flight: Flight) => `
                <div class="timing">
                    <div>${DateHelper.format(flight.loadingStartDate, 'HH:mm')}</div>
                    <div>${DateHelper.format(flight.startDate, 'HH:mm')}</div>
                    <div class="duration">${flight.fullDuration}</div>
                    <div>${DateHelper.format(flight.endDate, 'HH:mm')}</div>
                    <div>${DateHelper.format(flight.unloadingStartDate, 'HH:mm')}</div>
                </div>`;

            return flightTemplate(thisFlight) + timingRowTemplate(thisFlight) +
                // Show info about linked flight when available
                (thisFlight.linkedFlight ? flightTemplate(thisFlight.linkedFlight) + timingRowTemplate(thisFlight.linkedFlight) : '') +
                (thisFlight.warning ? `<div class="warning"><i class="fa fa-warning"></i> ${thisFlight.warning}</div>` : '');
        }
    },
    stickyEventsFeature    : false,
    scheduleTooltipFeature : false,

    eventRenderer({ eventRecord, renderData } : Record<string, any>) {
        renderData['iconCls'] = '';

        const
            flight          = eventRecord as Flight,
            roundedDuration = Math.round(flight.duration * 10) / 10;

        return [
            {
                tag       : 'span',
                className : 'b-flight-number',
                children  : [
                    {
                        tag   : 'i',
                        class : eventRecord.iconCls
                    },
                    flight.flightNumber
                ]
            },
            {
                class    : 'b-flight-details',
                children : [
                    {
                        tag   : 'i',
                        class : 'fa fa-plane-departure'
                    },
                    // Show origin and destination if set
                    (flight.originAirportCode || flight.destinationAirportCode) && {
                        tag  : 'span',
                        text : `${flight.originAirportCode} -> ${flight.destinationAirportCode}`
                    },
                    // Show duration when available
                    roundedDuration && {
                        tag   : 'span',
                        class : 'b-flight-duration',
                        text  : `${roundedDuration} ${flight.durationUnit}s`
                    }
                ]
            }
        ];
    },

    listeners : {
        // Only allow creating flights on planes
        beforeDragCreate({ resourceRecord } : Record<string, any>) {
            return resourceRecord.isLeaf;
        }
    },

    tbar : {
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
                onInput({ source, value } : { source : Widget, value : number }) {
                    getSchedulerPro(source).rowHeight = value;
                }
            },
            spacer : {
                type : 'widget',
                cls  : 'b-toolbar-fill'
            },
            legend : {
                type : Legend.type,
                flex : 1,
                async onItem({ source }: { source: List })  {
                    const
                        selected  = source.selected as Collection,
                        scheduler = getSchedulerPro(source);

                    await scheduler.eventStore.clearFilters();

                    if (selected.count > 0) {
                        const items = (selected.allValues as { text: string }[]).map(
                            (item: { text: string }) => item.text.toLowerCase().replace(/[\s-]/g, '')
                        ) as unknown as [keyof Flight];
                        await (scheduler.eventStore as any).filter({
                            filters : (record : Flight) => items.some(item => record[item]),
                            replace : true
                        });
                    }
                }
            } as LegendConfig
        }
    }
};
