import List from '../../../lib/Core/widget/List.js';

// A List subclass showing equipment
export default class EquipmentList extends List {

    // Class name getter, to ensure class name can read also in minified code
    static $name = 'EquipmentList';

    // Factoryable type name
    static type = 'equipmentlist';

    static configurable = {
        itemTpl : record => `<i class="b-equipment-icon ${record.iconCls} b-colorize"></i>${record.name}`
    };
}

// Register this widget type with its Factory
EquipmentList.initClass();
