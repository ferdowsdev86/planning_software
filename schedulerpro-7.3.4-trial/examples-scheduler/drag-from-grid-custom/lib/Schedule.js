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
import StringHelper from '../../../lib/Core/helper/StringHelper.js';

export default class Schedule extends Scheduler {
    /**
     * Original class name getter. See Widget.$name docs for the details.
     * @returns {string}
     */
    static $name = 'Schedule';

    // Factoryable type name
    static type = 'schedule';

    static configurable = {
        // Custom property for this demo, set to true to reschedule any conflicting tasks automatically
        autoRescheduleTasks : false,
        eventStyle          : 'indented',
        rowHeight           : 72,
        barMargin           : 8,
        eventColor          : 'indigo',
        //allowOverlap : false,

        subGridConfigs : {
            locked : {
                width : 300
            },
            normal : {
                flex : 1
            }
        },
        features : {
            stickyEvents : false,
            stripe       : true,
            timeRanges   : true,
            eventMenu    : {
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
                        name   : 'icon',
                        label  : 'Icon',
                        weight : 200
                    }
                }
            }
        },

        columns : [
            {
                type           : 'resourceInfo',
                text           : 'Name',
                flex           : 1,
                showEventCount : false,
                showRole       : true
            },
            {
                text   : 'Nbr tasks',
                editor : false,
                width  : 100,
                align  : 'center',
                // A custom field added in the CustomResourceModel (see CustomResourceModel.js)
                field  : 'nbrAssignedEvents'
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

    eventRenderer({ eventRecord, resourceRecord }) {
        // Event contents
        return StringHelper.xss`
            <div class="b-event-header"><span>${eventRecord.name}</span><i class="fa fa-${eventRecord.icon}"></i></div>
            <div class="b-event-footer"><span class="b-meta">${eventRecord.note}</span><span>${eventRecord.eventStartEndTimeString}</span></div>
    `;
    }
}

Schedule.initClass();
