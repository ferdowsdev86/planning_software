import Column from '../../../lib/Grid/column/Column.js';
import ColumnStore from '../../../lib/Grid/data/ColumnStore.js';
import './RoomThemeCombo.js';

export default class RoomThemeColumn extends Column {
    static $name    = 'RoomThemeColumn';
    static type     = 'roomthemecolumn';
    static defaults = {
        // Set your default instance config properties here
        field   : 'theme',
        text    : 'Theme',
        cellCls : 'b-room-theme-column-cell',
        editor  : { type : 'roomthemecombo' }
    };

    //endregion

    renderer({ column, value }) {
        const
            { store }  = column.editor,
            theme = store.getById(value);

        return theme ? [{
            tag       : 'i',
            className : theme.iconCls
        }, theme.text] : '';
    }
}

ColumnStore.registerColumnType(RoomThemeColumn);
