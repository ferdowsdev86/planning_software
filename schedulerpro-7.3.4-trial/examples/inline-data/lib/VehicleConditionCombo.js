import Combo from '../../../lib/Core/widget/Combo.js';

export default class VehicleConditionCombo extends Combo {
    static $name         = 'vehicleConditionCombo';
    static type          = 'vehicleconditioncombo';
    // Sets the combo configs
    static configurable  = {
        items : [
            { value : 0, text : 'Average' },
            { value : 1, text : 'Good' },
            { value : 2, text : 'Better' },
            { value : 3, text : 'Best' }
        ],
        picker : {
            minWidth : '8em'
        },
        listItemTpl : ({ text }) => `
            <div>
                <i style="margin-inline-end: 0.5em" class="fa fa-car ${text.toLowerCase()}"></i>
                <small>${text}</small>
            </div>
        `
    };

    // Keeps selected item's icon synchronized
    syncInputFieldValue(...args) {
        const condition = this.store.getById(this.value)?.text;
        this.icon.className = `fa fa-car ${condition?.toLowerCase()}`;
        super.syncInputFieldValue(...args);
    }

    // Adds reference for the icon to help keeping the selected item's icon synchronized
    get innerElements() {
        return [
            {
                reference : 'icon',
                tag       : 'i',
                style     : {
                    marginInlineStart : '.8em',
                    marginInlineEnd   : '-.3em'
                }
            },
            ...super.innerElements
        ];
    }
}

// Register class to be able to create widget by type
VehicleConditionCombo.initClass();
