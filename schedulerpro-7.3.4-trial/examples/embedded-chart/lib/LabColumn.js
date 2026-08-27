import { WidgetColumn, ColumnStore } from '../../../build/thin/grid.module.thin.js';
import { StringHelper } from '../../../build/thin/core.module.thin.js';

// The widget column showing the laboratory name, and when expanded also two widgets for interacting with the chart
export default class LabColumn extends WidgetColumn {
    static $name = 'LabColumn';

    static type = 'labcolumn';

    static defaults = {
        text          : 'Test Laboratory',
        width         : 200,
        editor        : false,
        cellCls       : 'b-lab-cell',
        instantUpdate : true,
        widgets       : [
            {
                type : 'widget',
                cls  : 'b-name'
            },
            {
                type      : 'slider',
                step      : 100,
                width     : 160,
                min       : 100,
                max       : 400,
                label     : 'Max capacity',
                // The record field name to read & write to / from
                name      : 'maxCapacity',
                showValue : false
            },
            {
                type    : 'slidetoggle',
                label   : 'Show capacity',
                width   : 140,
                checked : true,
                // The record field name to read & write to / from
                name    : 'showCapacityLine'
            }

        ],
        afterRenderCell({ widgets, record }) {
            widgets[0].html = StringHelper.xss`<i class="${record.iconCls}"></i>${record.name}`;
        }
    };
}

ColumnStore.registerColumnType(LabColumn);
