import { TaskStore } from './lib/TaskStore';
import { Task } from './lib/Task';
import { SchedulerEventModel, Model, StringHelper, SchedulerResourceModel, type EventStoreListenersTypes } from '@bryntum/schedulerpro';
import type { BryntumGridProps, BryntumSchedulerProps } from '@bryntum/schedulerpro-vue-3';

export const useSchedulerProps = ({ onEventStoreAdd, onEventStoreUpdate } : {
    onEventStoreAdd : EventStoreListenersTypes['add'];
    onEventStoreUpdate : EventStoreListenersTypes['update'];
}) : BryntumSchedulerProps => ({
    rowHeight  : 50,
    barMargin  : 4,
    eventColor : 'indigo',
    startDate  : new Date(2025, 11, 1, 8),
    endDate    : new Date(2025, 11, 1, 18),
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    resourceImagePath : './users/',

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
          eventRecord: SchedulerEventModel;
          resourceRecord: SchedulerResourceModel;
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
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },
    tbar : [
        'Schedule view',
        '->',
        { type : 'viewpresetcombo' },
        {
            type    : 'slidetoggle',
            text    : 'Automatic rescheduling',
            ref     : 'autoRescheduleTasks',
            tooltip : 'Toggles whether to automatically reschedule overlapping tasks',
            cls     : 'reschedule-button'
        }
    ]
});

export const gridProps : BryntumGridProps = {
    cls           : 'b-unplanned-grid',
    stripeFeature : true,
    sortFeature   : 'name',
    columns       : [
        {
            text       : 'Unassigned tasks',
            minWidth   : 200,
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
        readUrl    : 'data/unplanned.json',
        autoLoad   : true
    }
};
