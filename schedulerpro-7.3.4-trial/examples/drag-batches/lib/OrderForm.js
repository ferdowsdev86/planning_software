import Popup from '../../../lib/Core/widget/Popup.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';

export default class OrderForm extends Popup {

    static $name = 'OrderForm';

    static configurable = {
        title         : 'New order',
        rootElement   : document.body,
        width         : '32em',
        labelPosition : 'align-before',
        items         : {
            type : {
                type         : 'combo',
                valueField   : 'id',
                displayField : 'name',
                label        : 'Type',
                name         : 'type',
                listItemTpl  : template => StringHelper.xss`${template.name} (${template.children.length} tasks)`,
                editable     : false,
                required     : true,
                pickerWidth  : '20em'
            },
            customer : {
                type        : 'text',
                label       : 'Customer',
                name        : 'customer',
                placeholder : 'Acme Corporation',
                required    : true
            },
            quantity : {
                type  : 'number',
                label : 'Order quantity',
                step  : 10,
                min   : 10,
                value : 10,
                name  : 'size'
            }
        }
    };

    construct(...args) {
        super.construct(...args);

        const
            orderTypeCombo = this.widgetMap.type,
            // Picker shows only root templates; leaves are tasks within an order, not order types
            rootTemplates  = this.templateStore.chain(record => !record.isLeaf);

        this.rootTemplates   = rootTemplates;
        orderTypeCombo.store = rootTemplates;
        orderTypeCombo.value = rootTemplates.first;
    }

    doDestroy() {
        this.rootTemplates?.destroy();
        super.doDestroy();
    }
}
