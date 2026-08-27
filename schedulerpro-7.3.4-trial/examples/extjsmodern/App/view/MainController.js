/* global Ext */

Ext.define('App.view.MainController', {
    extend   : 'Ext.app.ViewController',
    alias    : 'controller.main',
    requires : [
        'Bryntum.SchedulerProPanel'
    ],

    eventRenderer : function({ eventRecord : task, resourceRecord, renderData, eventRecord }) {
        renderData.eventColor = {
            'Order 1'   : '#ffefd5',
            'Order 2'   : '#87cefa',
            'New order' : '#ffa500'
        }[task.order];

        const schedulerPro = this.lookupReference('schedulerProPanel').getSchedulerPro();

        // Highlight overlapping tasks within a resource
        if (!schedulerPro.eventStore.isDateRangeAvailable(task.startDate, task.endDate, task, resourceRecord)) {
            renderData.eventColor = '#f08080';
        }

        return [
            {
                className : 'desc',
                children  : [
                    Ext.htmlEncode(task.name),
                    {
                        tag       : 'div',
                        className : 'order',
                        html      : `${task.order}, ${task.percentDone}%`
                    }
                ]
            },
            task.note ? {
                tag       : 'i',
                className : 'fa fa-sticky-note b-last',
                dataset   : {
                    btip : Ext.htmlEncode(task.note)
                }
            } : null
        ];
    },

    addTask : async function() {
        const
            schedulerPro = this.lookup('schedulerProPanel').getSchedulerPro(),
            newRec       = new schedulerPro.eventStore.modelClass({
                startDate    : schedulerPro.startDate,
                resourceId   : schedulerPro.resourceStore.getAt(2).id,
                duration     : 1,
                durationUnit : 'h',
                name         : 'New task'
            });

        schedulerPro.editEvent(newRec);
    }
});
