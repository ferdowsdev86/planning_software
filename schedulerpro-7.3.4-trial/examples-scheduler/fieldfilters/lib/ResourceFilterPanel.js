import GridFieldFilterPickerGroup from '../../../lib/Grid/widget/GridFieldFilterPickerGroup.js';

export default class ResourceFilterPanel extends GridFieldFilterPickerGroup {
    static type = 'resourcefilterpanel';
    static $name = 'ResourceFilterPanel';

    static configurable = {
        ref   : 'filterPickers',
        grid  : null,
        items : {
            enableAllCheckbox : {
                type      : 'checkbox',
                text      : 'Enable/disable all',
                checked   : true,
                weight    : -1,
                style     : 'margin-bottom: 1em',
                listeners : {
                    change : 'up.onEnableAllCheckboxChange'
                }
            }
        },
        fields : {
            // Supply field `type` where not already present in the store model, to improve filterability
            type     : { type : 'string', title : 'Employment Type' },
            name     : { type : 'string', title : 'Name' },
            category : { type : 'string', title : 'Projects' }
        },

        filters : [{
            property : 'type',
            operator : '=',
            value    : 'Full time'
        }, {
            property : 'category',
            operator : 'isIncludedIn',
            value    : ['Research', 'Testers', 'Consultants']
        }]
    };

    onEnableAllCheckboxChange({ checked }) {
        if (checked) {
            this.activateAll();
        }
        else {
            this.deactivateAll();
        }
    }
}
ResourceFilterPanel.initClass();
