Ext.application({
    name     : 'App',
    requires : ['App.view.main.Main', 'App.view.main.MainController', 'App.view.scheduler.SchedulerPanel', 'App.view.editors.EventEditor', 'App.view.editors.TimeRangeEditor'],
    launch   : function() {
        Ext.create('Ext.container.Viewport', {
            layout : 'fit',
            items  : [{
                xtype : 'main-view'
            }]
        });
    }
});