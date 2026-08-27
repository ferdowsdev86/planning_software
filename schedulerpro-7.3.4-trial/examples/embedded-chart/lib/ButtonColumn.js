import { Toast } from '../../../build/thin/core.module.thin.js';
import { ColumnStore, WidgetColumn } from '../../../build/thin/grid.module.thin.js';

// The widget column showing two icons, and when expanded, also a utilization scale for the line chart
export default class ButtonColumn extends WidgetColumn {
    static $name = 'ButtonColumn';

    static type = 'buttoncolumn';

    static defaults = {
        width   : 90,
        // Put a custom CSS class on each cell to make styling easy
        cellCls : 'b-button-cell',
        align   : 'end',
        // Define the widgets we want
        widgets : [
            {
                type      : 'button',
                rendition : 'text',
                menuIcon  : null,
                icon      : 'fa fa-ellipsis-h',
                menu      : [
                    {
                        text : 'Cool action',
                        icon : 'fa fa-vial',
                        onItem({ item, menu }) {
                            const rowRecord = menu.owner.cellInfo.record;

                            Toast.show(`You clicked ${item.text} for ${rowRecord.name}`);
                        }
                    }
                ]
            },
            {
                type      : 'button',
                rendition : 'text',
                icon      : 'fa fa-chevron-down',
                // uncomment to show a tooltip
                // tooltip : 'Toggle row expanded state',
                onAction({ source: button }) {
                    const { record } = button.cellInfo;

                    record.toggleExpanded();
                }
            }
        ]
    };
}

ColumnStore.registerColumnType(ButtonColumn);
