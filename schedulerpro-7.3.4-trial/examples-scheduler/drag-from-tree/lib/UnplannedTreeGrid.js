import TreeGrid from '../../../lib/Grid/view/TreeGrid.js';
import '../../../lib/Scheduler/column/DurationColumn.js';

export default class UnplannedTreeGrid extends TreeGrid {
    // Original class name getter. See Widget.$name docs for the details.
    static $name = 'UnplannedTreeGrid';

    // Factoryable type name
    static type = 'unplannedtreegrid';

    static configurable = {
        features : {
            stripe : true,
            sort   : 'name'
        },

        columns : [
            {
                type     : 'tree',
                text     : 'Name',
                flex     : 1,
                field    : 'name',
                minWidth : 200
            },
            {
                type  : 'duration',
                text  : 'Duration',
                width : 90
            }
        ],

        rowHeight : 50
    };
}

// Register this widget type with its Factory
UnplannedTreeGrid.initClass();
