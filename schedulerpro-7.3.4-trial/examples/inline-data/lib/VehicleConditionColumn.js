import Column from '../../../lib/Grid/column/Column.js';
import ColumnStore from '../../../lib/Grid/data/ColumnStore.js';
import './VehicleConditionCombo.js';

// A column representing the vehicle condition
export default class VehicleConditionColumn extends Column {
    static $name    = 'VehicleConditionColumn';
    static type     = 'vehicleconditioncolumn';
    static defaults = {
        // Set your default instance config properties here
        field   : 'vehicleCondition',
        text    : 'Condition',
        cellCls : 'b-vehicle-condition-column-cell',
        editor  : { type : 'vehicleconditioncombo' }
    };

    renderer({ column, value }) {
        const
            { store } = column.editor,
            condition = store.getById(value)?.text;

        return condition ? [{
            tag       : 'i',
            className : `fa fa-car ${condition.toLowerCase()}`
        }, condition] : '';
    }
}

ColumnStore.registerColumnType(VehicleConditionColumn);
