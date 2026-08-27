/* global Ext */

Ext.define('App.view.editors.TimeRangeEditor', {
    extend : 'Ext.window.Window',
    xtype  : 'timerangeeditor',

    defaultFocus : 'textfield',
    title        : 'Time Range',
    closeAction  : 'hide',
    layout       : 'fit',
    draggable    : false,

    items : [{
        xtype       : 'form',
        reference   : 'timerangeeditorForm',
        bodyPadding : 10,
        items       : [{
            xtype      : 'textfield',
            name       : 'name',
            fieldLabel : 'Name',
            required   : true
        }, {
            xtype      : 'fieldcontainer',
            fieldLabel : 'Start',
            layout     : 'hbox',
            items      : [{
                xtype    : 'datefield',
                name     : 'startDate',
                flex     : 6,
                margin   : '0 10 0 0',
                required : true
            }, {
                xtype    : 'timefield',
                name     : 'startTime',
                flex     : 4,
                required : true
            }]
        }, {
            fieldLabel : 'End',
            xtype      : 'fieldcontainer',
            layout     : 'hbox',
            items      : [{
                xtype    : 'datefield',
                name     : 'endDate',
                flex     : 6,
                margin   : '0 10 0 0',
                required : true
            }, {
                xtype    : 'timefield',
                name     : 'endTime',
                flex     : 4,
                required : true
            }]
        }]
    }],

    // Link up the ENTER key to saving the time range
    keyMap : {
        ENTER : 'saveTimeRange'
    },

    bbar : [{
        reference : 'saveButton',
        text      : 'Save',
        handler   : 'saveTimeRange'
    }, '->', {
        text    : 'cancel',
        handler : 'up.close'
    }]
});
