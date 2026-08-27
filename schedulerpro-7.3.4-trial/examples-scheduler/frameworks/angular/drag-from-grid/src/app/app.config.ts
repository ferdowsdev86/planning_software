import { SchedulerEventModel, EventStoreListenersTypes, Model, SchedulerResourceModel, StringHelper } from '@bryntum/schedulerpro';
import { BryntumGridProps, BryntumSchedulerProps } from '@bryntum/schedulerpro-angular';
import { Task } from './lib/Task';
import { TaskStore } from './lib/TaskStore';

export const schedulerProps  = ({ onEventStoreAdd, onEventStoreUpdate } : {
    onEventStoreAdd : EventStoreListenersTypes['add']
    onEventStoreUpdate : EventStoreListenersTypes['update']
}) : BryntumSchedulerProps => ({
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    rowHeight  : 50,
    barMargin  : 4,
    eventColor : 'indigo',
    startDate  : new Date(2025, 11, 1, 8),
    endDate    : new Date(2025, 11, 1, 18),
    flex       : 4,

    resourceImages : {
        path      : 'assets/users/',
        extension : '.png'
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
            text     : 'Tasks',
            editor   : false,
            align    : 'center',
            renderer : (data: { record: Model }) =>
                `${(data.record as SchedulerResourceModel).events.length || ''}`,
            sortable : (a: Model, b: Model) =>
                (a as SchedulerResourceModel).events.length < (b as SchedulerResourceModel).events.length
                    ? -1
                    : 1,
            width : 100
        }
    ],
    viewPreset : {
        base           : 'hourAndDay',
        tickWidth      : 20,
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

    stripeFeature     : true,
    timeRangesFeature : true,
    eventMenuFeature  : {
        items : {
            // custom item with inline handler
            unassign : {
                text   : 'Unassign',
                icon   : 'fa fa-user-times',
                weight : 200,
                onItem : ({
                    eventRecord,
                    resourceRecord
                }: {
                    eventRecord: SchedulerEventModel
                    resourceRecord: SchedulerResourceModel
                }) => eventRecord.unassign(resourceRecord)
            }
        }
    },
    crudManager : {
        autoLoad   : true,
        eventStore : {
            storeClass : TaskStore,
            onAdd      : onEventStoreAdd,
            onUpdate   : onEventStoreUpdate
        },
        loadUrl          : 'assets/data/data.json',
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    }
});

export const gridProps : BryntumGridProps = {
    cls           : 'b-unplanned-grid',
    stripeFeature : true,
    sortFeature   : 'name',
    flex          : '0 0 300px',
    columns       : [
        {
            text       : 'Unassigned tasks',
            flex       : 1,
            field      : 'name',
            htmlEncode : false,
            type       : 'column',
            renderer   : ({ record }) => {
                const recordData = record as SchedulerEventModel;
                return StringHelper.xss`<i class="${recordData.iconCls}"></i>${recordData.name}`;
            }
        },
        {
            text     : 'Duration',
            width    : 100,
            align    : 'right',
            editor   : false,
            type     : 'column',
            field    : 'duration',
            renderer : ({ record }) => {
                const recordData = record as SchedulerEventModel;
                return StringHelper.xss`${recordData.duration} ${recordData.durationUnit}`;
            }
        }
    ],
    rowHeight : 50,
    store     : {
        modelClass : Task,
        readUrl    : 'assets/data/unplanned.json',
        autoLoad   : true
    }
};
