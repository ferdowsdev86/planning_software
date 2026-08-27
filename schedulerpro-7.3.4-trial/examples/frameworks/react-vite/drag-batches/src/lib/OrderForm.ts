import { Combo, Popup, PopupConfig, Store, StringHelper } from '@bryntum/schedulerpro';
import { Template } from './Template';

type OrderFormConfig = PopupConfig & {
    templateStore: Store
}

export class OrderForm extends Popup {

    static $name = 'OrderForm';

    declare templateStore: Store;

    rootTemplates?: Store;

    static configurable = {
        title       : 'New order',
        rootElement : document.body,
        centered    : true,
        width       : '30em',
        defaults    : {
            labelWidth : '10em'
        },
        items : [
            {
                type         : 'combo',
                ref          : 'typeCombo',
                valueField   : 'id',
                displayField : 'name',
                label        : 'Type',
                name         : 'type',
                listItemTpl  : record => {
                    const template = record as Template;
                    return StringHelper.xss`${template.name} (${template.children.length} tasks)`;
                },
                editable    : false,
                required    : true,
                pickerWidth : '20em'
            },
            {
                type        : 'text',
                label       : 'Customer',
                name        : 'customer',
                placeholder : 'Customer Name',
                required    : true
            },
            {
                type  : 'number',
                label : 'Order quantity',
                step  : 10,
                min   : 10,
                value : 10,
                name  : 'size'
            }
        ]
    } as PopupConfig;

    constructor(config?: OrderFormConfig) {
        super(config);
    }

    construct(...args : OrderFormConfig[]) {
        super.construct(...args);

        const
            orderTypeCombo = this.widgetMap['typeCombo'] as Combo,
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
