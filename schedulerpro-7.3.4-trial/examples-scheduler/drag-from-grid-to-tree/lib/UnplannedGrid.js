import Grid from '../../../lib/Grid/view/Grid.js';
import '../../../lib/Scheduler/column/DurationColumn.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';

export default class UnplannedGrid extends Grid {
    /**
     * Original class name getter. See Widget.$name docs for the details.
     * @returns {string}
     */
    static  $name = 'UnplannedGrid';

    // Factoryable type name
    static  type = 'unplannedgrid';

    static configurable  = {
        features : {
            stripe : true,
            sort   : 'name'
        },

        columns : [{
            text       : 'Tasks',
            flex       : 1,
            field      : 'name',
            htmlEncode : false,
            minWidth   : 200,
            renderer   : data => StringHelper.xss`<i class="${data.record.iconCls}"></i>${data.record.name}`
        }, {
            type  : 'duration',
            text  : 'Duration',
            width : 90
        }],

        rowHeight : 50
    };
}

// Register this widget type with its Factory
UnplannedGrid.initClass();
