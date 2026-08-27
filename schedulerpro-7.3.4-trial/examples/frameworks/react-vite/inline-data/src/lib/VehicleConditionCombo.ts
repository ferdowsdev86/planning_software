import { Combo, ComboConfig, ComboModel, type DomConfig, type Store } from '@bryntum/schedulerpro';
import type VehicleConditionColumn from './VehicleConditionColumn';

export default class VehicleConditionCombo extends Combo {
    static override $name = 'vehicleConditionCombo';
    static override type  = 'vehicleconditioncombo';

    declare icon: HTMLElement;

    // Sets the combo configs
    static get configurable() {
        return {
            items : [
                { value : 0, text : 'Average' },
                { value : 1, text : 'Good' },
                { value : 2, text : 'Better' },
                { value : 3, text : 'Best' }
            ],
            picker : {
                minWidth : '8em'
            },
            listItemTpl : record => {
                const row = record as ComboModel;
                return `
                <div>
                    <i style="margin-inline-end: 0.5em" class="fa fa-car ${row.text.toLowerCase()}"></i>
                    <small>${row.text}</small>
                </div>
            `;
            }
        } as ComboConfig;
    }

    // Keeps selected item's icon synchronized
    override syncInputFieldValue(shipHighlight: boolean) {
        const
            store     = this.store as Store,
            condition = (store.getById(this.value as number) as VehicleConditionColumn)?.text;
        this.icon.className = `fa fa-car ${condition?.toLowerCase()}`;
        super.syncInputFieldValue(shipHighlight);
    }

    // Adds reference for the icon to help keeping the selected item's icon synchronized
    override get innerElements(): (HTMLElement | DomConfig)[] {
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

VehicleConditionCombo.initClass();
