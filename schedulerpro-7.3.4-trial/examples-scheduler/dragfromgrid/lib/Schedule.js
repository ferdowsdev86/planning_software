import Scheduler from '../../../lib/Scheduler/view/Scheduler.js';
import '../../../lib/Grid/column/TemplateColumn.js';
import '../../../lib/Grid/feature/Stripe.js';
import '../../../lib/Grid/feature/Sort.js';
import '../../../lib/Scheduler/feature/TimeRanges.js';
import '../../../lib/Scheduler/feature/EventDrag.js';
import '../../../lib/Scheduler/feature/EventDragCreate.js';
import '../../../lib/Scheduler/feature/EventResize.js';
import '../../../lib/Scheduler/column/ResourceInfoColumn.js';
import './IconCombo.js';

export default class Schedule extends Scheduler {

    // Original class name getter. See Widget.$name docs for the details.
    static $name = 'Schedule';

    // Factoryable type name
    static type = 'schedule';

    static configurable = {
        // Custom property for this demo, set to true to reschedule any conflicting tasks automatically
        autoRescheduleTasks : false,
        subGridConfigs      : {
            locked : {
                width : 300
            },
            normal : {
                flex : 1
            }
        },
        features : {
            stripe     : true,
            timeRanges : true,
            eventMenu  : {
                items : {
                    // Custom item with inline handler
                    unassign : {
                        text   : 'Unassign',
                        icon   : 'fa fa-user-times',
                        weight : 200,
                        onItem : ({ eventRecord }) => eventRecord.unassign()
                    }
                }
            },
            eventEdit : {
                items : {
                    nameField : {
                        required : true
                    },
                    // Custom field for picking icon
                    iconCls : {
                        type   : 'iconcombo',
                        // Name should match a record field, to read and write value from that field
                        name   : 'iconCls',
                        label  : 'Icon',
                        weight : 200
                    }
                }
            }
        },

        rowHeight  : 50,
        barMargin  : 4,
        eventColor : 'indigo',
        //allowOverlap : false,

        columns : [
            {
                type           : 'resourceInfo',
                text           : 'Name',
                flex           : 1,
                showEventCount : false,
                showRole       : true
            },
            {
                text     : 'Tasks',
                editor   : false,
                width    : 100,
                renderer : data => `${data.record.events.length || ''}`,
                align    : 'center',
                sortable : (a, b) => a.events.length < b.events.length ? -1 : 1
            }
        ],

        // Custom view preset with header configuration
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

        // Only used in vertical mode
        resourceColumns : {
            columnWidth : 120
        },

        // Do not remove event when unassigning, we want to add it to grid instead
        removeUnassignedEvent : false,

        resourceImages : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        }
    };

    updateAutoRescheduleTasks(autoRescheduleTasks) {
        this.eventStore.autoRescheduleTasks = autoRescheduleTasks;
    }
}

Schedule.initClass();
