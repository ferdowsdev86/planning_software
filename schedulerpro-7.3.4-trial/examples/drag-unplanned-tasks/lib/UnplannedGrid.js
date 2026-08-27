import StringHelper from '../../../lib/Core/helper/StringHelper.js';
import Grid from '../../../lib/Grid/view/Grid.js';
import '../../../lib/Core/widget/DurationField.js';
import '../../../lib/Grid/column/TemplateColumn.js';

// Custom grid that holds unassigned appointments
export default class UnplannedGrid extends Grid {
    static $name = 'UnplannedGrid';

    static configurable = {
        rendition : {
            button : 'text'
        },
        selectionMode : {
            cell : false
        },
        features : {
            stripe : true,
            sort   : 'name',
            group  : {
                headerHeight : 40,
                field        : 'requiredRole',
                renderer({ groupRowFor, column }) {
                    if (column.parentIndex === 0) {
                        return `Tasks for ${groupRowFor}`;
                    }
                }
            }
        },

        columns : [
            {
                type     : 'template',
                text     : 'Appointment',
                flex     : 1,
                cellCls  : 'unscheduledNameCell',
                template : ({ record: appointment }) => `
                        <i class="fa fa-${appointment.iconCls || 'question'}"></i>
                        <div class="name-container">
                            <span>${StringHelper.encodeHtml(appointment.name)}</span>
                            <span class="patient-name">Patient: ${appointment.patient || '?'}</span>
                        </div>
                    `
            },
            {
                text   : 'Required role',
                field  : 'requiredRole',
                hidden : true
            }, {
                icon     : 'fa fa-clock',
                width    : 80,
                align    : 'center',
                editor   : 'duration',
                field    : 'fullDuration',
                renderer : ({ record }) => `${record.duration ?? 0} ${record.durationUnit}`
            }
        ],

        tbar : [
            {
                type : 'widget',
                tag  : 'strong',
                html : 'Unplanned appointments',
                flex : 1
            },
            {
                icon     : 'fa fa-angle-double-down',
                cls      : 'b-transparent',
                tooltip  : 'Expand all groups',
                onAction : 'up.expandAll'
            },
            {
                icon     : 'fa fa-angle-double-up',
                cls      : 'b-transparent',
                tooltip  : 'Collapse all groups',
                onAction : 'up.collapseAll'
            }
        ],

        rowHeight : 65,

        disableGridRowModelWarning : true
    };

    set project(project) {
        // Create a chained version of the event store as our store. It will be filtered to only display events that
        // lack assignments
        this.store = project.eventStore.chain(eventRecord => !eventRecord.assignments.length);

        // When assignments change, update our chained store to reflect the changes
        project.assignmentStore.on({
            change() {
                this.store.fillFromMaster();
            },
            thisObj : this
        });
    }
}
