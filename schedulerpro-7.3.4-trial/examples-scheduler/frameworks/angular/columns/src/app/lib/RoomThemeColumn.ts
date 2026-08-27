import { Column, ColumnStore } from '@bryntum/schedulerpro';
import './RoomThemeCombo';

export default class RoomThemeColumn extends Column {
    static $name    = 'RoomThemeColumn';
    static type     = 'roomthemecolumn';
    static defaults = {
        // Set your default instance config properties here
        field    : 'theme',
        text     : 'Theme',
        cellCls  : 'b-room-theme-column-cell',
        editor   : { type : 'roomthemecombo' },
        renderer : ({ column, value }) => {
            const
                { store }  = column.editor,
                theme = store.getById(value);

            return theme ? [{
                tag       : 'i',
                className : theme.iconCls
            }, theme.text] : '';
        }
    };

    //endregion
}

ColumnStore.registerColumnType(RoomThemeColumn);
