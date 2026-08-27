import Grid from '../../../lib/Grid/view/Grid.js';
import '../../../lib/Grid/feature/FilterBar.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';

export default class EquipmentGrid extends Grid {

    /**
     * Original class name getter. See Widget.$name docs for the details.
     * @returns {string}
     */
    static $name = 'EquipmentGrid';

    // Factoryable type name
    static type = 'equipmentgrid';

    static configurable = {
        disableGridRowModelWarning : true,

        features : {
            filterBar : true,
            cellEdit  : false
        },

        rowHeight : 100,

        columns : [{
            field      : 'name',
            ariaLabel  : this.L('L{Column.columnLabel}', { text : 'Equipment' }),
            filterable : {
                filterField : {
                    ariaLabel : 'Filter Equipment'
                }
            },
            htmlEncode : false,
            cellCls    : 'b-equipment',
            renderer   : data => StringHelper.xss`<i class="b-equipment-icon ${data.record.iconCls}"></i>${data.record.name}`
        }]
    };
}

// Register this widget type with its Factory
EquipmentGrid.initClass();
