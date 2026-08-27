import shared from '../_shared/shared.module.js';
import { Splitter, Scheduler, SchedulerEventModel, Grid } from '../../build/schedulerpro.module.js';

const scheduler = new Scheduler({
    appendTo       : 'main',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    flex           : 1,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    multiEventSelect : true,
    features         : {
        stripe    : true,
        sort      : 'name',
        eventDrag : {
            // Allow dragging events outside of the Scheduler
            constrainDragToTimeline : false,
            // With this method, you can let the scheduler now if the drop operation is valid or not
            validatorFn({ draggedRecords, event }) {
                return true;
            },
            // This CSS selector defines where a user may drop events outside the scheduler element
            externalDropTargetSelector : '.b-external-grid'
        }
    },

    columns : [
        {
            type : 'resourceInfo',
            text : 'Staff'
        }
    ],

    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data/data.json'
            }
        }
    },
    startDate  : new Date(2022, 7, 26, 6),
    endDate    : new Date(2022, 7, 26, 20),
    viewPreset : 'hourAndDay',
    listeners  : {
        // We listen for the `eventDrop` event and take action if dropped on the external grid
        eventDrop({ browserEvent, eventRecords, externalDropTarget }) {
            if (externalDropTarget) {
                // Remove record from the event store
                scheduler.eventStore.remove(eventRecords);
                // Now add it to the grid store instead
                grid.store.add(eventRecords);
                // Finally re-sort the grid store (by name)
                grid.store.sort();
            }
        }
    }
});

new Splitter({
    appendTo    : 'main',
    showButtons : 'end'
});

const grid = new Grid({
    appendTo  : 'main',
    cls       : 'b-external-grid',
    flex      : '0 0 300px',
    emptyText : 'Drop events here',

    collapsible : true,
    header      : false,

    features : {
        stripe : true,
        sort   : 'name'
    },

    store : {
        // Setup the Grid store to use the same data model as the Scheduler
        modelClass : SchedulerEventModel
    },

    columns : [
        {
            text  : 'Unscheduled tasks',
            field : 'name',
            flex  : 1
        },
        {
            type : 'duration'
        }
    ]
});
