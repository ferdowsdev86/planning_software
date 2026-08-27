import { StringHelper, DateHelper } from '@bryntum/schedulerpro';
import { BryntumSchedulerProProjectModelProps, BryntumSchedulerProProps } from '@bryntum/schedulerpro-react';
import { DriverResource } from './lib/DriverResources';
import { EventWithBoundaries } from './lib/EventWithBoundaries';

export const projectProps : BryntumSchedulerProProjectModelProps = {
    autoLoad        : true,
    eventModelClass : EventWithBoundaries,
    resourceStore   : {
        modelClass : DriverResource,
        sorters    : [{
            field     : 'name',
            ascending : true
        }]
    },
    loadUrl : './data/data.json'
};

export const schedulerProProps : BryntumSchedulerProProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,
    startDate         : new Date(2025, 0, 20, 7),
    endDate           : new Date(2025, 0, 20, 20),
    rowHeight         : 80,
    barMargin         : 10,
    resourceImagePath : './users/',
    eventColor        : 'blue',
    eventStyle        : 'filled',
    timeResolution    : {
        unit      : 'min',
        increment : 20
    },
    snap : true,

    viewPreset : {
        base    : 'hourAndDay',
        headers : [
            {
                unit       : 'd',
                align      : 'center',
                dateFormat : 'LL'
            },
            {
                unit       : 'h',
                align      : 'center',
                dateFormat : 'h A'
            }
        ]
    },

    columns : [
        {
            type           : 'resourceInfo',
            text           : 'Driver',
            width          : 180,
            showEventCount : false,
            filterable     : {
                filterField : {
                    triggers : {
                        search : {
                            cls : 'fa fa-filter'
                        }
                    },
                    placeholder : 'Search drivers...'
                }
            },
            showMeta : record => {
                const driver = record as DriverResource;
                return StringHelper.xss`<i class="fa fa-circle b-active-status ${driver.active ? 'b-active' : ''}"></i><i class="fa fa-${driver.vehicle || ''}"></i >`;
            }
        },
        {
            text   : 'City',
            field  : 'city',
            editor : false
        }
    ],

    eventDragFeature : {
        snapToResource : true
    },
    scheduleTooltipFeature   : false,
    dependenciesFeature      : false,
    timeSpanHighlightFeature : true,
    filterBarFeature         : true,
    taskEditFeature          : {
        items : {
            generalTab : {
                items : {
                    // two custom fields for min / max daily delivery time
                    minStartTime : {
                        type  : 'number',
                        min   : 0,
                        max   : 23,
                        label : 'Delivery time',
                        width : 200,
                        flex  : '0 0 200px',
                        name  : 'minStartTime',
                        span  : 1
                    },
                    maxEndTime : {
                        label : '-',
                        type  : 'number',
                        min   : 0,
                        max   : 24,
                        flex  : '0 0 90px',
                        name  : 'maxEndTime',
                        span  : 1
                    },

                    // Not using % done field in this demo
                    percentDoneField : false,

                    // Make effort field half width, it can share row with Duration
                    effortField : {
                        span : 1
                    }
                }
            }
        }
    },
    eventTooltipFeature : {
        template : ({ eventRecord }) => {
            const { minStartDate, maxEndDate } = eventRecord as EventWithBoundaries;
            return `<dl>
                <dt>${StringHelper.encodeHtml(eventRecord.name)}</dt>
                <dd>
                     <i class="fa fa-map-marker-alt"></i>${StringHelper.encodeHtml(eventRecord.resource.name)}
                </dd>
                <dt>Scheduled at:</dt>
                <dd>
                    <i class="fa fa-calendar-alt"></i>${DateHelper.format(eventRecord.startDate as Date, 'LST')} - ${DateHelper.format(eventRecord.endDate as Date, 'LST')}
                </dd>
                ${'minStartTime' in eventRecord ? `
                <dt>Deliver between:</dt>
                <dd>
                    <i class="fa fa-clock"></i>${DateHelper.format(minStartDate, 'LST')} - ${DateHelper.format(maxEndDate, 'LST')}
                </dd>` : ''}
            </dl>`;
        }
    },
    // A custom event renderer returning a DOMConfig object
    eventRenderer({ eventRecord }) {
        const { minStartDate, maxEndDate } = eventRecord as EventWithBoundaries;

        if (!minStartDate || !maxEndDate) {
            return StringHelper.encodeHtml(eventRecord.name);
        }

        return [
            {
                children : [
                    {
                        class : 'eventName',
                        html  : StringHelper.encodeHtml(eventRecord.name)
                    },
                    {
                        class : 'b-delivery-window',
                        html  : `Deliver ${DateHelper.format(minStartDate, 'LST')} - ${DateHelper.format(maxEndDate, 'LST')}</div>`
                    }
                ]
            }
        ];
    }

};
