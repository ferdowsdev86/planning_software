import { Scheduler, Toast, Button, Checkbox } from '@bryntum/schedulerpro';

const scheduler = window.scheduler = new Scheduler({
    appendTo               : 'container',
    startDate              : new Date(2018, 4, 21, 6),
    endDate                : new Date(2018, 4, 21, 18),
    viewPreset             : 'hourAndDay',
    rowHeight              : 50,
    barMargin              : 5,
    eventColor             : 'blue',
    passStartEndParameters : true,

    features : {
        // Configure event editor to display 'brand' as resource name
        eventEdit : {
            items : {
                resourceField : {
                    displayField : 'car'
                }
            }
        }
    },

    columns : [
        { text : 'Id', field : 'id', width : 100, editor : false, hidden : true },
        { text : 'Name', field : 'name', width : 150 }
    ],

    crudManager : {
        resourceStore : {
            fields : [
                { name : 'id', dataSource : 'Id' },
                { name : 'name', dataSource : 'Name' }
            ]
        },
        eventStore : {
            fields : [
                { name : 'id', dataSource : 'Id' },
                { name : 'name', dataSource : 'Name' },
                { name : 'startDate', dataSource : 'StartDate', type : 'date' },
                { name : 'endDate', dataSource : 'EndDate', type : 'date' },
                { name : 'resourceId', dataSource : 'ResourceId', convert : v => Number(v) },
                { name : 'cls', dataSource : 'Cls' },
                { name : 'draggable', dataSource : 'Draggable' },
                { name : 'resizable', dataSource : 'Resizable' }
            ]
        },
        transport : {
            load : {
                url       : 'schedulercrud/load',
                paramName : 'q'
            },
            sync : {
                url : 'schedulercrud/sync'
            }
        },
        autoLoad         : false,
        autoSync         : false,
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    }
});

scheduler.crudManager.load().then(() => {
    scheduler.zoomToFit();
});

scheduler.crudManager.on({
    hasChanges() {
        syncButton.disabled = false;
    },
    noChanges() {
        syncButton.disabled = true;
    }
});

//region Widgets

new Button({
    appendTo : document.getElementById('tools') || document.body,
    ref      : 'loadButton',
    icon     : 'fa fa-sync',
    tooltip  : 'Reload data',
    onAction() {
        scheduler.crudManager.load().then(() => {
            Toast.show('Data reloaded');
        }).catch(() => {
            Toast.show('Error reloading data');
        });
    }
});

const syncButton =  new Button({
    appendTo : document.getElementById('tools') || document.body,
    type     : 'button',
    ref      : 'syncButton',
    icon     : 'fa fa-save',
    disabled : true,
    tooltip  : 'Sync changes',
    onAction() {
        scheduler.crudManager.sync().then(() => {
            Toast.show('Changes are synchronized');
        }).catch(() => {
            Toast.show('Error synchronizing changes');
        });
    }
});

new Checkbox({
    appendTo : document.getElementById('tools') || document.body,
    ref      : 'checkAutoSync',
    label    : 'Auto-sync changes',
    onChange({ checked }) {
        syncButton.hidden = scheduler.crudManager.autoSync = checked;
    }
});

//endregion
