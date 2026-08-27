import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import '../../../lib/Core/widget/DurationField.js';
import '../../../lib/Grid/column/DateColumn.js';
import '../../../lib/Grid/feature/CellTooltip.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';
import Grid from '../../../lib/Grid/view/Grid.js';
import Order from './Order.js';
import OrderForm from './OrderForm.js';

// Custom grid that holds the orders for the production facility
export default class OrderGrid extends Grid {

    static $name = 'OrderGrid';

    static type = 'ordergrid';

    static configurable = {
        rowHeight     : 70,
        readOnly      : true,
        selectionMode : {
            row  : true,
            cell : false
        },
        store : {
            modelClass : Order
        },

        project : null,

        features : {
            stripe      : true,
            group       : false,
            cellTooltip : {
                hoverDelay      : 300,
                textContent     : true,
                tooltipRenderer : ({ record : order }) => order.isScheduled ? StringHelper.xss`<h4>${order.name}</h4>This order is scheduled to finish by <b>${DateHelper.format(order.finishDate, 'MMM d, h A')}</b>` : `<h4>Type: ${order.templateName}</h4>Try dragging this order onto the schedule`
            }
        },

        tbar : [
            {
                text       : 'Add order',
                icon       : 'fa fa-plus',
                toggleable : true,
                onAction   : 'up.onAddClick'
            },
            '->',
            {
                text       : 'Hide scheduled',
                toggleable : true,
                onToggle   : 'up.onScheduledOrdersButtonToggle'
            }
        ],

        columns : [{
            type       : 'template',
            text       : 'Order List',
            flex       : 1,
            minWidth   : 180,
            field      : 'name',
            htmlEncode : false,
            cellCls    : 'order-cell',
            template   : ({ record : order }) => StringHelper.xss`<div>${'#' + order.id} ${order.name}</div>
                    <div class="customer">${order.customer}, size: ${order.size}</div>`
        }, {
            text       : 'Start',
            type       : 'date',
            htmlEncode : false,
            format     : 'MMM D, h A',
            width      : 110,
            field      : 'firstTask.startDate',
            renderer({ value, record : order, row }) {
                row.toggleCls('scheduled', order.isScheduled);

                return DateHelper.format(value, this.format);
            }
        }, {
            text   : 'Finish',
            type   : 'date',
            width  : 110,
            format : 'MMM D, h A',
            editor : false,
            field  : 'lastTask.endDate'
        }],

        disableGridRowModelWarning : true
    };

    updateProject(project) {
        // Sync dates in this grid when tasks are updated
        project.on({
            refresh : 'updateOrderDates',
            thisObj : this
        });
    }

    // region Event handlers
    onScheduledOrdersButtonToggle({ pressed }) {
        if (pressed) {
            this.store.filter({
                property : 'isScheduled',
                operator : '=',
                value    : false
            });
        }
        else {
            this.store.clearFilters();
        }
    }

    onAddClick({ source : button }) {
        const
            templateStore = this.project.templates,
            form          = new OrderForm({
                templateStore,
                bbar : [
                    {
                        text : 'Cancel',
                        onClick() {
                            form.destroy();
                        }
                    },
                    {
                        text    : 'Create',
                        onClick : () => {
                            const data = form.values;

                            if (form.isValid) {
                                const added = this.store.add({
                                    id   : Order.generateNewOrderId(),
                                    name : templateStore.getById(data.type).name,
                                    ...data
                                });

                                this.scrollRowIntoView(added[0], { highlight : true });

                                form.destroy();
                            }
                        }
                    }
                ]
            });

        form.showBy({
            target : button,
            anchor : true
        });
    }

    // endregion

    updateOrderDates() {
        this.refreshColumn(this.columns.getAt(1));
        this.refreshColumn(this.columns.getAt(2));
    }
}
