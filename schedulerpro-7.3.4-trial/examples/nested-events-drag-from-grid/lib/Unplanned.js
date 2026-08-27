import Grid from '../../../lib/Grid/view/Grid.js';
import '../../../lib/Scheduler/column/DurationColumn.js';

// Customized Grid subclass
export default class Unplanned extends Grid {
    // Widget factory type, can be used to create an instance decoratively
    static type = 'unplanned';

    static configurable = {
        // Accept a project from the outside
        project : null,

        columns : [
            { text : 'Unscheduled jobs', field : 'name', flex : 1 },
            { type : 'duration', field : 'fullDuration', width : 90 }
        ],

        // Records are going to be event records
        disableGridRowModelWarning : true
    };

    updateProject(project) {
        // Update our store when assignments change in the schedule
        this.project.assignmentStore.on({
            change() {
                this.store.fillFromMaster();
            },
            thisObj : this
        });

        // Our store chains projects event store, only including unassigned nestable events
        this.store = project.eventStore.chain(r => !r.isParent && !r.assigned?.size, null, {
            excludeCollapsedRecords : false,
            sorters                 : [{ field : 'name' }]
        });
    }
}

// Register with widget factory, to allow creation by type
Unplanned.initClass();
