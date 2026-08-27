import Popup from '../../../lib/Core/widget/Popup.js';
import '../../../lib/Scheduler/widget/ResourceCombo.js';

// Custom editor for time ranges and resource time ranges
export default class TimeRangeEditor extends Popup {
    // Class name, to survive minification
    static $name = 'TimeRangeEditor';

    // Initial configs
    static configurable = {
        title                   : 'Add time range',
        modal                   : true,
        centered                : true,
        width                   : '30em',
        closeAction             : 'destroy',
        highlightExternalChange : false,
        // Config that determines if we are editing a time range or a resource time range
        mode                    : 'timeRange',
        // Make all labels same width, to align nicely
        defaults                : {
            labelWidth : '8em'
        },
        // Fields to show in the editor
        items : {
            // Will be matched with the fields in the record based on the key: name, resourceId etc
            name : {
                type     : 'text',
                label    : 'Name',
                required : true
            },
            resourceId : {
                type           : 'resourcecombo',
                label          : 'Team',
                showEventColor : true
            },
            startDate : {
                type     : 'date',
                label    : 'Start date',
                required : true,
                value    : new Date(2023, 0, 30)
            },
            fullDuration : {
                type     : 'duration',
                label    : 'Duration',
                required : true,
                value    : 0
            }
        },
        // Save when pressing enter
        keyMap : {
            enter : 'onSaveClick'
        },
        // Buttons in the footer
        bbar : {
            items : {
                save : {
                    text    : 'Save',
                    onClick : 'up.onSaveClick'
                },
                cancel : {
                    text    : 'Cancel',
                    onClick : 'up.close'
                }
            }
        }
    };

    // Mode toggled, either 'timeRange' or 'resourceTimeRange'. Toggle fields etc based on this.
    updateMode(mode) {
        const me = this;

        const
            { resourceId, fullDuration } = me.widgetMap,
            { resourceStore }            = me.owner;

        if (mode === 'resourceTimeRange') {
            // Show all resources in the resource picker
            resourceId.store = resourceStore.chain();
            fullDuration.min = 1;

            // If we are adding, default to first resource and 1 day duration
            if (!me.record?.isModel) {
                resourceId.value = resourceId.store.first;
                fullDuration.value = 1;
            }

            me.title = me.record ? 'Edit resource time range' : 'Add resource time range';
        }
        else {
            // Hide resource picker
            me.widgetMap.resourceId.hidden = true;

            me.title = me.record ? 'Edit time range' : 'Add time range';

            // Lines might not have a 0 duration set, default to showing 0 for them
            if (me.record?.duration == null) {
                fullDuration.value = 0;
            }
        }
    }

    // Clicked save or pressed enter
    onSaveClick() {
        const me = this;

        if (me.isValid) {
            const { values } = me;

            // If we are editing, update the record
            if (me.record?.isModel) {
                me.record.set(values);
            }
            // Otherwise add a new one (to the correct store)
            else {
                me.owner[`${me.mode}Store`].add(values);
            }

            me.close();
        }
    }
}
