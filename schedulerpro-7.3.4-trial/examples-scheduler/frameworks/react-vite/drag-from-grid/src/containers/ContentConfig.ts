import { SchedulerEventModel, Model, SchedulerResourceModel, StringHelper } from '@bryntum/schedulerpro';
import { BryntumGridProps, BryntumSchedulerProps } from '@bryntum/schedulerpro-react';
import { TaskStore } from '../lib/TaskStore';

export const schedulerProps: BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    startDate  : new Date(2025, 11, 1, 8),
    endDate    : new Date(2025, 11, 1, 18),

    rowHeight      : 50,
    barMargin      : 4,
    eventColor     : 'indigo',
    resourceImages : {
        path      : 'users/',
        extension : '.png'
    },
    flex : 1,

    stripeFeature     : true,
    timeRangesFeature : true,

    eventDragFeature : {
        showTooltip : true
    },

    eventMenuFeature : {
        items : {
            // custom item with inline handler
            unassign : {
                text   : 'Unassign',
                icon   : 'fa fa-user-times',
                weight : 200,
                onItem : ({ eventRecord, resourceRecord }) =>
                    (eventRecord as SchedulerEventModel).unassign(resourceRecord as SchedulerResourceModel)
            }
        }
    },

    viewPreset : {
        base           : 'hourAndDay',
        columnLinesFor : 0,
        headers        : [
            {
                unit       : 'd',
                align      : 'center',
                dateFormat : 'ddd DD MMM'
            },
            {
                unit       : 'h',
                align      : 'center',
                dateFormat : 'HH'
            }
        ]
    },

    columns : [
        {
            type           : 'resourceInfo',
            text           : 'Name',
            width          : 200,
            showEventCount : false,
            showRole       : true
        },
        {
            text     : 'Nbr tasks',
            editor   : false,
            align    : 'center',
            renderer : (data: { record: Model }) => `${(data.record as SchedulerResourceModel).events.length || ''}`,
            sortable : (a: Model, b: Model) => (a as SchedulerResourceModel).events.length < (b as SchedulerResourceModel).events.length ? -1 : 1,
            width    : 100
        }
    ],

    crudManager : {
        autoLoad   : true,
        eventStore : {
            storeClass : TaskStore
        },
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    }
};

export const unplannedGridProps: BryntumGridProps = {
    rowHeight : 50,
    cls       : 'b-unplanned-grid',
    columns   : [
        {
            text       : 'Unassigned tasks',
            flex       : 1,
            field      : 'name',
            htmlEncode : false,
            renderer   : (data: { record: Model }) => {
                const record = data.record as SchedulerEventModel;
                return StringHelper.xss`<i class="${record.iconCls}"></i>${record.name}`;
            }
        },
        {
            text     : 'Duration',
            width    : 100,
            align    : 'right',
            editor   : false,
            field    : 'duration',
            renderer : (data: { record: Model }) => {
                const record = data.record as SchedulerEventModel;
                return StringHelper.xss`${record.duration} ${record.durationUnit}`;
            }
        }
    ],
    stripeFeature : true,
    sortFeature   : 'name'
};
