import { Column, ColumnStore, type Store } from '@bryntum/schedulerpro';
import './VehicleConditionCombo';

// A column representing the vehicle condition
export default class VehicleConditionColumn extends Column {
    declare editor: { store: Store };

    static override $name = 'VehicleConditionColumn';

    static override type = 'vehicleconditioncolumn';

    static override defaults = {
        // Set your default instance config properties here
        field   : 'vehicleCondition',
        text    : 'Vehicle Condition',
        cellCls : 'b-vehicle-condition-column-cell',
        editor  : { type : 'vehicleconditioncombo' }
    };

    renderer({ column, value }: { column: VehicleConditionColumn; value: number }) {
        const
            { store } = column.editor,
            condition = (store.getById(value) as VehicleConditionColumn)?.text;

        return condition ? [{
            tag       : 'i',
            className : `fa fa-car ${condition.toLowerCase()}`
        }, condition] : '';
    }
}

ColumnStore.registerColumnType(VehicleConditionColumn);
