import '../../../lib/Scheduler/column/ResourceInfoColumn.js';
import Scheduler from '../../../lib/Scheduler/view/Scheduler.js';
import '../../../lib/Grid/feature/Tree.js';

export default class Schedule extends Scheduler {
    /**
     * Original class name getter. See Widget.$name docs for the details.
     * @returns {string}
     */
    static $name = 'Schedule';

    // Factoryable type name
    static type = 'schedule';

    static configurable = {
        subGridConfigs : {
            locked : {
                width : 300
            },
            normal : {
                flex : 1
            }
        },
        features : {
            tree : true
        },
        resourceImages : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        },
        rowHeight  : 50,
        barMargin  : 4,
        eventStyle : 'indented',
        eventColor : 'indigo',
        tickSize   : 120,
        //allowOverlap : false,

        columns : [
            {
                type  : 'resourceinfo',
                tree  : true,
                field : 'name',
                text  : 'Name',
                flex  : 1
            },
            {
                text     : 'Tasks',
                editor   : false,
                width    : 75,
                renderer : ({ record }) => record.events.length || '',
                align    : 'center',
                sortable : (a, b) => a.events.length < b.events.length ? -1 : 1
            }
        ],

        // View preset which configures the time axis header
        viewPreset : 'dayAndWeek'
    };

    onEventDrop({ eventRecords, targetResourceRecord }) {
        // When dropping on a parent row, assign to all team members
        if (targetResourceRecord.isParent) {
            this.eventStore.assignEventToResource(eventRecords[0], targetResourceRecord.children, true);
        }
    }
}

Schedule.initClass();
