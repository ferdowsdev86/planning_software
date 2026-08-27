import { EventStore, StringHelper } from '@bryntum/schedulerpro';
import { BryntumGridProps, BryntumSchedulerProProjectModelProps, BryntumSchedulerProProps } from '@bryntum/schedulerpro-angular';
import Task from 'src/lib/Task';

export class TaskStore extends EventStore {
    override modelClass = Task;
    declare records: Task[];
}

export const projectProps: BryntumSchedulerProProjectModelProps = {
    autoLoad   : true,
    loadUrl    : 'assets/data/data.json',
    eventStore : {
        storeClass : TaskStore
    },
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse : true
};

export const schedulerProProps: BryntumSchedulerProProps = {
    startDate    : new Date(2025, 11, 1, 8),
    endDate      : new Date(2025, 11, 1, 20),
    flex         : 5,
    rowHeight    : 80,
    barMargin    : 4,
    collapsible  : true,
    collapsed    : false,
    header       : false,
    eventColor   : null,
    eventStyle   : 'bordered',
    allowOverlap : false,
    // Enables smoother wheel and pinch zooming
    smoothZoom   : true,
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

    resourceImagePath : './assets/users/',

    columns : [
        {
            type           : 'resourceInfo',
            text           : 'Name',
            width          : 200,
            showEventCount : false,
            showRole       : true
        }
    ],

    stripeFeature      : true,
    eventBufferFeature : {
        // The event buffer time spans are considered as unavailable time
        bufferIsUnavailableTime : true
    },
    taskEditFeature : {
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
    },

    eventRenderer({ eventRecord }) {
        const task = eventRecord as Task;
        return [
            {
                tag       : 'span',
                className : 'event-name',
                html      : StringHelper.encodeHtml(task.name)
            },
            {
                tag       : 'span',
                className : 'location',
                children  : [
                    task.shortAddress ? {
                        tag       : 'i',
                        className : 'fa fa-map-marker-alt'
                    } : null,
                    task.shortAddress || ' '
                ]
            }
        ];
    }
};

export const gridProps: BryntumGridProps = {
    flex                       : '0 1 400px',
    rowHeight                  : 40,
    disableGridRowModelWarning : true,
    collapsible                : true,
    collapsed                  : true,
    header                     : false,
    minHeight                  : 0,
    selectionMode              : {
        cell : false
    },
    stripeFeature : true,
    sortFeature   : true,

    columns : [
        {
            type       : 'column',
            text       : 'Unscheduled tasks',
            flex       : 1,
            field      : 'name',
            cellCls    : 'unscheduledNameCell',
            htmlEncode : false,
            tooltip    : 'Drag and drop from this grid to the schedule',
            renderer   : ({ value }) => `<i class="fa fa-fw fa-grip"></i>${StringHelper.encodeHtml(value) || ''}`
        },
        {
            text     : 'Location',
            icon     : 'fa fa-fw fa-map-marker-alt',
            flex     : 1,
            field    : 'address.display_name',
            readOnly : true
        },
        {
            type  : 'duration',
            icon  : 'fa fa-clock',
            text  : '',
            width : 120,
            align : 'center',
            field : 'fullDuration'
        },
        {
            type                 : 'duration',
            icon                 : 'fa fa-car-side',
            text                 : '<i class="fa fa-arrow-right"></i>',
            tooltip              : 'Start trip',
            width                : 120,
            htmlEncodeHeaderText : false,
            align                : 'center',
            field                : 'preamble'
        },
        {
            type                 : 'duration',
            icon                 : 'fa fa-arrow-left',
            text                 : '<i class="fa fa-car-side"></i>',
            cls                  : 'unplannedReturnTrip',
            tooltip              : 'Return trip',
            width                : 120,
            htmlEncodeHeaderText : false,
            align                : 'center',
            field                : 'postamble'
        }
    ]
};
