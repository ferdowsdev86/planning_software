import StringHelper from '../../../lib/Core/helper/StringHelper.js';
import Grid from '../../../lib/Grid/view/Grid.js';
import '../../../lib/Core/widget/DurationField.js';
import '../../../lib/Grid/column/TemplateColumn.js';

// Custom grid that holds unassigned appointments
export default class UnplannedGrid extends Grid {
    static type = 'unplannedgrid';
    static $name = 'UnplannedGrid';

    static configurable = {
        cls                        : 'no-demo-app-style', // Opt out of shared demo app styling
        rowHeight                  : 40,
        disableGridRowModelWarning : true,
        collapsible                : true,
        header                     : false,
        minHeight                  : 0,
        selectionMode              : {
            cell : false
        },
        features : {
            stripe : true,
            sort   : 'name'
        },

        columns : [
            {
                text       : 'Unscheduled tasks',
                flex       : 1,
                field      : 'name',
                cellCls    : 'unscheduledNameCell',
                htmlEncode : false,
                tooltip    : 'Drag and drop from this grid to the schedule',
                renderer   : ({ value }) => `<i class="fa fa-grip"></i>${StringHelper.encodeHtml(value) || ''}`
            },
            {
                text     : 'Location',
                icon     : 'fa fa-map-marker-alt',
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
