import { Column, ColumnStore, Combo, Store } from '@bryntum/schedulerpro';
import { VehicleCondition } from './VehicleCondition';
import './VehicleConditionCombo';

// A column representing the vehicle condition
export default class VehicleConditionColumn extends Column {

    static override $name = 'VehicleConditionColumn';

    static override type = 'vehicleconditioncolumn';

    static override defaults = {
        // Set your default instance config properties here
        field   : 'vehicleCondition',
        text    : 'Vehicle Condition',
        cellCls : 'b-vehicle-condition-column-cell',
        editor  : { type : 'vehicleconditioncombo' }
    };

    override renderer: Column['renderer'] = ({ column, value }) => {
        const
            store     = (column.editor as Combo).store as Store,
            condition = (store.getById(value) as VehicleCondition)?.text;

        return condition ? [
            {
                tag       : 'i',
                className : `fa fa-car ${condition.toLowerCase()}`
            },
            condition
        ] : '';
    };
}

ColumnStore.registerColumnType(VehicleConditionColumn);
