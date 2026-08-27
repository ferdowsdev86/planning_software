/* global Ext, Bryntum */

Ext.define('App.view.main.MainController', {
    extend : 'Ext.app.ViewController',
    alias  : 'controller.main',

    init : function() {
        const
            me             = this,
            schedulerPanel = me.lookupReference('schedulerPanel');

        me.callParent();

        schedulerPanel.on({
            beforeeventedit : function(sender, event) {
                me.editEvent(event.eventRecord, event.eventElement);

                return false;
            }
        });
    },

    getScheduler() {
        return this.lookup('schedulerPanel').getScheduler();
    },

    eventRenderer : function(renderData) {
        renderData.renderData.style = 'background-color:' + renderData.resourceRecord.color;

        return Ext.htmlEncode(renderData.eventRecord.name);
    },

    addTask : function() {
        const
            editor         = this.getEventEditor(),
            scheduler      = this.getScheduler(),
            editorForm     = this.lookup('editorForm').getForm();

        if (!scheduler.resourceStore.count) {
            Ext.toast('There is no resource available');
            return;
        }

        editor.record = null;
        editor.down('#deleteButton').hide();

        editor.setTitle('New Task Details');
        editorForm.reset();
        editorForm.setValues({
            startDate : Ext.Date.clone(scheduler.startDate),
            startTime : '09:00',
            endDate   : Ext.Date.clone(scheduler.startDate),
            endTime   : '10:00'
        });
        editorForm.clearInvalid();
        editor.mode = 'create';
        editor.center();
        editor.show();
        editor.focus();
    },

    addTimeRange : function() {
        const
            editor         = this.getTimeRangeEditor(),
            scheduler      = this.getScheduler(),
            editorForm     = this.lookup('timerangeeditorForm').getForm();

        if (!scheduler.resourceStore.count) {
            Ext.toast('There is no resource available');
            return;
        }

        editorForm.setValues({
            name      : 'Fika',
            startDate : new Date(scheduler.startDate),
            startTime : '10:00',
            endDate   : new Date(scheduler.startDate),
            endTime   : '11:00'
        });

        editor.show();
        editor.focus();
    },

    saveTimeRange : function() {
        const
            editor         = this.getTimeRangeEditor(),
            editorForm     = this.lookup('timerangeeditorForm').getForm(),
            scheduler      = this.getScheduler(),
            values         = editorForm.getFieldValues();

        if (editorForm.isValid()) {
            const { startTime, endTime } = values;

            values.startDate = new Date(values.startDate.setHours(startTime.getHours(), startTime.getMinutes(), 0));
            values.endDate = new Date(values.endDate.setHours(endTime.getHours(), endTime.getMinutes(), 0));

            scheduler.features.timeRanges.store.add(values);
            editor.hide();
        }
    },

    editEvent : function(event, target) {
        const
            me           = this,
            editor       = me.getEventEditor(),
            editorForm   = this.lookup('editorForm').getForm(),
            deleteButton = editor.down('#deleteButton');

        // Drag-create
        if (event.isCreating) {
            editor.setTitle('New Event');
            editor.mode = 'create';
            deleteButton.hide();
        }
        // Existing event
        else {
            deleteButton.show();
            editor.setTitle('Edit Event');
            editor.mode = 'edit';
        }

        editor.record = event;

        editorForm.setValues({
            ...event.data,
            startTime : event.data.startDate,
            endTime   : event.data.endDate
        });

        editor.showBy(target, 't-b?');
        editor.focus();
    },

    cancelEdit : function() {
        // An event created using drag create or dbl click is added early to store, should be removed on cancel
        if (this.getEventEditor().mode === 'create') {
            this.deleteTask();
        }
        else {
            this.eventEditor.hide();
        }
    },

    deleteTask : function() {
        const
            editor    = this.getEventEditor(),
            scheduler = this.getScheduler();

        scheduler.eventStore.remove(editor.record);

        editor.hide();
    },

    saveTask : function() {
        const
            editor     = this.getEventEditor(),
            editorForm = this.lookup('editorForm').getForm(),
            scheduler  = this.getScheduler(),
            values     = editorForm.getFieldValues(true);

        if (editorForm.isValid()) {
            const { startTime, endTime } = values;
            values.startDate = new Date(values.startDate.setHours(startTime.getHours(), startTime.getMinutes(), 0));
            values.endDate = new Date(values.endDate.setHours(endTime.getHours(), endTime.getMinutes(), 0));

            if (editor.mode === 'create' && !editor.record) {
                scheduler.eventStore.add(values);
            }
            else if (editor.mode === 'edit') {
                editor.record.set(values);
            }

            editor.hide();
        }
    },

    addPerson : function() {
        const
            grid        = this.lookup('gridPanel'),
            added       = grid.store.add({}),
            cellContext = grid.getView().getPosition(added[0], grid.getColumns()[0]);

        grid.setActionableMode(true, cellContext);
    },

    getEventEditor : function() {
        return this.eventEditor ??= this.getView().add(Ext.create('App.view.editors.EventEditor', {}));
    },

    getTimeRangeEditor : function() {
        return this.timeRangeEditor ??= this.getView().add(Ext.create('App.view.editors.TimeRangeEditor', {
            reference     : 'timerangeeditor',
            hideOnMaskTap : true
        }));
    }
});
