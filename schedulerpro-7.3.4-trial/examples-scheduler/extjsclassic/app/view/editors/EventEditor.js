/* global Ext */

Ext.define('App.view.editors.EventEditor', {
    extend : 'Ext.window.Window',
    xtype  : 'eventeditor',

    title        : 'Edit Task',
    closeAction  : 'hide',
    layout       : 'fit',
    draggable    : false,
    width        : 400,
    defaultFocus : 'nameField',

    items : [{
        xtype       : 'form',
        itemId      : 'editorForm',
        reference   : 'editorForm',
        bodyPadding : 10,
        defaults    : {
            anchor     : '100%',
            allowBlank : false
        },
        items : [{
            xtype      : 'textfield',
            name       : 'name',
            fieldLabel : 'Name',
            itemId     : 'nameField'
        }, {
            xtype      : 'combobox',
            fieldLabel : 'Assigned',
            name       : 'resourceId',
            itemId     : 'resourceId',
            store      : {
                fields   : ['id', 'name'],
                autoLoad : true,
                proxy    : {
                    type : 'ajax',
                    url  : 'data/resources.json'
                }
            },
            queryMode      : 'local',
            valueField     : 'id',
            displayField   : 'name',
            editable       : false,
            forceSelection : true,
            autoSelect     : true
        }, {
            xtype      : 'fieldcontainer',
            fieldLabel : 'Start',
            layout     : 'hbox',
            items      : [{
                xtype      : 'datefield',
                name       : 'startDate',
                flex       : 6,
                margin     : '0 10 0 0',
                allowBlank : false,
                format     : 'Y-m-d'
            }, {
                xtype      : 'timefield',
                name       : 'startTime',
                flex       : 4,
                allowBlank : false,
                format     : 'H:i'
            }]
        }, {
            xtype      : 'fieldcontainer',
            fieldLabel : 'End',
            layout     : 'hbox',
            items      : [{
                xtype      : 'datefield',
                name       : 'endDate',
                flex       : 6,
                margin     : '0 10 0 0',
                allowBlank : false,
                format     : 'Y-m-d'
            }, {
                xtype      : 'timefield',
                name       : 'endTime',
                flex       : 4,
                allowBlank : false,
                format     : 'H:i'
            }]
        }]
    }],

    bbar : [{
        itemId  : 'deleteButton',
        text    : 'Delete',
        handler : 'deleteTask'
    }, {
        itemId  : 'cancelButton',
        text    : 'Cancel',
        handler : 'cancelEdit'
    }, '->', {
        itemId  : 'saveButton',
        text    : 'Save',
        handler : 'saveTask'
    }],

    keyMap : {
        ENTER : 'saveTask'
    }
});
