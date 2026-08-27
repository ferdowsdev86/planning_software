var {
    Column,
    ColumnStore,
    Combo,
    Scheduler,
    StringHelper
} = window.bryntum.schedulerpro;
//region "lib/RoomThemeColumn.js"

class RoomThemeColumn extends Column {
    static $name = 'RoomThemeColumn';
    static type = 'roomthemecolumn';
    static defaults = {
    // Set your default instance config properties here
        field   : 'theme',
        text    : 'Theme',
        cellCls : 'b-room-theme-column-cell',
        editor  : {
            type : 'roomthemecombo'
        }
    };

    //endregion

    renderer({
        column,
        value
    }) {
        const {
                store
            } = column.editor,
            theme = store.getById(value);
        return theme ? [{
            tag       : 'i',
            className : theme.iconCls
        }, theme.text] : '';
    }
}
ColumnStore.registerColumnType(RoomThemeColumn);

//endregion

//region "lib/RoomThemeCombo.js"

class RoomThemeCombo extends Combo {
    static type = 'roomthemecombo';
    static configurable = {
        items : [{
            value   : 1,
            text    : 'Beachfront Bliss',
            iconCls : 'fa fa-umbrella-beach'
        }, {
            value   : 2,
            text    : 'Cityscape Retreat',
            iconCls : 'fa fa-city'
        }, {
            value   : 3,
            text    : 'Jungle Hideaway',
            iconCls : 'fa fa-leaf'
        }, {
            value   : 4,
            text    : 'Artistic Haven',
            iconCls : 'fa fa-paint-brush'
        }, {
            value   : 5,
            text    : 'Alpine Getaway',
            iconCls : 'fa fa-snowflake'
        }],
        picker : {
            minWidth : '11em'
        },
        listItemTpl : ({
            text,
            iconCls
        }) => `
            <div>
                <i style="margin-inline-end: 0.5em" class="${iconCls}"></i>
                <small>${text}</small>
            </div>
        `
    };
    syncInputFieldValue(...args) {
        const theme = this.store.getById(this.value);
        this.icon.className = `${theme === null || theme === undefined ? undefined : theme.iconCls}`;
        super.syncInputFieldValue(...args);
    }
    get innerElements() {
        return [{
            reference : 'icon',
            tag       : 'i',
            style     : {
                marginInlineStart : '.8em',
                marginInlineEnd   : '-.3em'
            }
        }, ...super.innerElements];
    }
}

// Register class to be able to create widget by type
RoomThemeCombo.initClass();

//endregion

const scheduler = new Scheduler({
    appendTo    : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom  : true,
    startDate   : new Date(2019, 1, 19, 6),
    endDate     : new Date(2019, 1, 19, 20),
    viewPreset  : 'hourAndDay',
    rowHeight   : 50,
    barMargin   : 5,
    eventStyle  : 'indented',
    crudManager : {
        autoLoad      : true,
        resourceStore : {
            // Additional fields for resources
            fields : ['capacity', 'condition', 'color', 'floor', {
                name : 'theme',
                type : 'number'
            }, {
                name : 'redecorated',
                type : 'date'
            }]
        },
        loadUrl : 'data/data.json'
    },
    columns : [{
        text       : 'Room',
        field      : 'name',
        width      : 135,
        region     : 'left',
        htmlEncode : false,
        renderer   : ({
            value,
            record
        }) => StringHelper.xss`<div class="box b-color-${record.color}"></div>${value}`
    }, {
        text   : 'Floor',
        field  : 'floor',
        width  : 100,
        region : 'left'
    }, {
        text       : 'Capacity',
        field      : 'capacity',
        width      : 110,
        region     : 'left',
        type       : 'number',
        htmlEncode : false,
        renderer({
            value
        }) {
            const icon = value < 25 ? 'user' : value < 200 ? 'user-friends' : 'users';
            return StringHelper.xss`${value}<div class="capacity fa fa-fw fa-${icon}"></div>`;
        }
    }, {
        type     : 'roomthemecolumn',
        region   : 'left',
        minWidth : '14em'
    }, {
        text   : 'Redecorated',
        field  : 'redecorated',
        width  : 120,
        region : 'right',
        type   : 'date'
    }, {
        text   : 'Condition',
        field  : 'condition',
        region : 'right',
        type   : 'rating'
    }],
    subGridConfigs : {
        left : {
            width : 550
        },
        // A "normal" flexed region is automatically added for scheduler unless specified
        right : {
            width : 300
        }
    },
    eventRenderer({
        eventRecord,
        renderData
    }) {
        const hours = eventRecord.duration * 24;
        if (hours > 8) {
            renderData.eventColor = 'red';
        }
        else if (hours > 4) {
            renderData.eventColor = 'orange';
        }
        else if (hours > 2) {
            renderData.eventColor = 'lime';
        }
        return StringHelper.xss`${eventRecord.name}<span>(${hours} hour${hours > 1 ? 's' : ''})</span>`;
    },
    features : {
        columnReorder : {
            stretchedDragProxy : true
        },
        eventEdit : {
            items : {
                resourceField : {
                    label : 'Room'
                }
            }
        }
    },
    columnLines : false,
    tbar        : [{
        type : 'button',
        ref  : 'addButton',
        icon : 'fa fa-plus',
        text : 'Add column',
        onClick() {
            // scheduler.columns is a store, it supports the normal Store CRUD operations
            scheduler.columns.insert(1, {
                text   : 'Accessible',
                field  : 'accessible',
                region : 'left',
                type   : 'check'
            });
            scheduler.widgetMap.addButton.disable();
            scheduler.widgetMap.removeButton.enable();
        }
    }, {
        type     : 'button',
        ref      : 'removeButton',
        cls      : 'b-red',
        icon     : 'fa fa-trash',
        text     : 'Remove column',
        disabled : true,
        onClick() {
            scheduler.columns.getAt(1).remove();
            scheduler.widgetMap.addButton.enable();
            scheduler.widgetMap.removeButton.disable();
        }
    }]
});