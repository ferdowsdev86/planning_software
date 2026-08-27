/* global Ext */
// import SchedulerPro from '../../lib/SchedulerPro/view/SchedulerPro.js';

Ext.Loader.setPath('Bryntum', './Bryntum');

Ext.application({
    name : 'Main',

    requires : [
        'App.view.Main',
        'App.view.MainController',
        'Bryntum.Compat',
        'Bryntum.SchedulerProPanel'
    ],

    launch : function() {
        Ext.Viewport.add({
            xtype : 'main-view'
        });
    }
});
