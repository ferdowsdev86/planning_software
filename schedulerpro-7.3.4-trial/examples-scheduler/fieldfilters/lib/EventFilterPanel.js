import FieldFilterPickerGroup from '../../../lib/Core/widget/FieldFilterPickerGroup.js';

export default class EventFilterPanel extends FieldFilterPickerGroup {
    static type = 'eventfilterpanel';
    static $name = 'EventFilterPanel';

    static configurable = {
        tbar : {
            enableAllCheckbox : {
                type      : 'checkbox',
                text      : 'Enable/disable all',
                checked   : true,
                listeners : {
                    change : 'up.onEnableAllCheckboxChange'
                }
            }
        },
        fields : {
            // Supply field `type` where not already present in the store model, to improve filterability
            startDate    : { type : 'date', title : 'Start Date' },
            endDate      : { type : 'date', title : 'Finish Date' },
            name         : { type : 'string', title : 'Name' },
            fullDuration : { type : 'duration', title : 'Duration' }
        },

        filters : [{
            property : 'name',
            operator : '=',
            value    : 'Partner meeting',
            disabled : true
        }]
    };

    onEnableAllCheckboxChange({ checked }) {
        const { filterPickers } = this.widgetMap;

        checked ? filterPickers.activateAll() : filterPickers.deactivateAll();
    }
}
EventFilterPanel.initClass();
