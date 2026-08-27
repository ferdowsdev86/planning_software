import shared from '../_shared/shared.module.js';
import { Popup, Menu, Toast, Scheduler } from '../../build/schedulerpro.module.js';
//region "lib/TimeRangeEditor.js"

// Custom editor for time ranges and resource time ranges
class TimeRangeEditor extends Popup {
    // Class name, to survive minification
    static $name = 'TimeRangeEditor';

    // Initial configs
    static configurable = {
        title                   : 'Add time range',
        modal                   : true,
        centered                : true,
        width                   : '30em',
        closeAction             : 'destroy',
        highlightExternalChange : false,
        // Config that determines if we are editing a time range or a resource time range
        mode                    : 'timeRange',
        // Make all labels same width, to align nicely
        defaults                : {
            labelWidth : '8em'
        },
        // Fields to show in the editor
        items : {
            // Will be matched with the fields in the record based on the key: name, resourceId etc
            name : {
                type     : 'text',
                label    : 'Name',
                required : true
            },
            resourceId : {
                type           : 'resourcecombo',
                label          : 'Team',
                showEventColor : true
            },
            startDate : {
                type     : 'date',
                label    : 'Start date',
                required : true,
                value    : new Date(2023, 0, 30)
            },
            fullDuration : {
                type     : 'duration',
                label    : 'Duration',
                required : true,
                value    : 0
            }
        },
        // Save when pressing enter
        keyMap : {
            enter : 'onSaveClick'
        },
        // Buttons in the footer
        bbar : {
            items : {
                save : {
                    text    : 'Save',
                    onClick : 'up.onSaveClick'
                },
                cancel : {
                    text    : 'Cancel',
                    onClick : 'up.close'
                }
            }
        }
    };

    // Mode toggled, either 'timeRange' or 'resourceTimeRange'. Toggle fields etc based on this.
    updateMode(mode) {
        const me = this;

        const
            { resourceId, fullDuration } = me.widgetMap,
            { resourceStore }            = me.owner;

        if (mode === 'resourceTimeRange') {
            // Show all resources in the resource picker
            resourceId.store = resourceStore.chain();
            fullDuration.min = 1;

            // If we are adding, default to first resource and 1 day duration
            if (!me.record?.isModel) {
                resourceId.value = resourceId.store.first;
                fullDuration.value = 1;
            }

            me.title = me.record ? 'Edit resource time range' : 'Add resource time range';
        }
        else {
            // Hide resource picker
            me.widgetMap.resourceId.hidden = true;

            me.title = me.record ? 'Edit time range' : 'Add time range';

            // Lines might not have a 0 duration set, default to showing 0 for them
            if (me.record?.duration == null) {
                fullDuration.value = 0;
            }
        }
    }

    // Clicked save or pressed enter
    onSaveClick() {
        const me = this;

        if (me.isValid) {
            const { values } = me;

            // If we are editing, update the record
            if (me.record?.isModel) {
                me.record.set(values);
            }
            // Otherwise add a new one (to the correct store)
            else {
                me.owner[`${me.mode}Store`].add(values);
            }

            me.close();
        }
    }
}

//endregion

const config = new URLSearchParams(window.location.search).get('config') || '';

const scheduler = new Scheduler({
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    // Configure a CrudManager to load from and sync data with a PHP backend
    crudManager : {
        // `config` parameter is only used for internal testing, you can remove it in your application
        loadUrl : 'php/load.php?config=' + config,
        syncUrl : 'php/sync.php?config=' + config,

        // Kick off loading and syncing automatically by default
        autoLoad : true,
        autoSync : true,

        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true,

        listeners : {
            requestFail(event) {
                const
                    { requestType, response } = event,
                    serverMessage             = response && response.message,
                    exceptionText             = `Action "${requestType}" failed. ${serverMessage ? ` Server response: ${serverMessage}` : ''}`;

                Toast.show({
                    html    : exceptionText,
                    color   : 'b-red',
                    style   : 'color:white',
                    timeout : 3000
                });

                console.error(exceptionText);
            }
        }
    },

    // Disable sync mask and load mask, crud status is displayed in the toolbar instead
    syncMask : null,
    loadMask : null,

    features : {
        // Dependencies, give them a larger click area, and a radius for nicer rendering
        dependencies : {
            clickWidth : 5,
            radius     : 10
        },
        // Allow editing dependencies
        dependencyEdit : true,
        // Time ranges, allow resizing and moving
        timeRanges     : {
            enableResizing : true
        },
        // Resource time ranges, allow mouse interaction
        resourceTimeRanges : {
            enableMouseEvents : true
        },
        // Stripe rows for a cleaner look
        stripe : true
    },

    startDate : '2023-01-29',
    endDate   : '2023-02-19',

    eventStyle     : 'bordered',
    rowHeight      : 130,
    resourceMargin : 20,
    tickSize       : 60,

    // Use a single resource information column, showing team initials, name and assigned events count
    columns : [
        { type : 'resourceInfo', field : 'name', text : 'Name', width : 250, useNameAsImageName : false }
    ],

    // Custom event renderer, display an icon, event name and description
    eventRenderer({ eventRecord }) {
        // Pick icon based on event name
        const icon = eventRecord.name.startsWith('Investigate')
            ? 'magnifying-glass'
            : eventRecord.name.startsWith('Plan')
                ? 'calendar'
                : eventRecord.name.startsWith('Consider')
                    ? 'calculator'
                    : 'user';

        // Event contents
        return [
            {
                className : 'name',
                children  : [
                    // Add icon
                    { tag : 'i', className : `fa fa-${icon}` },
                    // Name as text node
                    eventRecord.name
                ]
            },
            // Description below in its own div
            { className : 'desc', text : eventRecord.description }
        ];
    },

    // Top toolbar with a button to add either a time range or a resource time range
    tbar : {
        items : {
            addButton : {
                text : 'Add range',
                icon : 'fa fa-plus',
                menu : [
                    { text : 'Time range', onItem : 'up.onAddTimeRangeClick' },
                    { text : 'Resource time range', onItem : 'up.onAddResourceTimeRangeClick' }
                ]
            },
            spacer : {
                type : 'widget',
                cls  : 'b-toolbar-fill'
            },
            autoSyncToggle : {
                type    : 'slidetoggle',
                checked : true,
                text    : 'Auto sync',
                onChange({ checked }) {
                    scheduler.crudManager.autoSync = checked;
                    scheduler.widgetMap.syncButton.disabled = checked;
                }
            },
            syncButton : {
                icon     : 'fa fa-cloud-arrow-up',
                text     : 'Sync',
                disabled : true,
                onClick() {
                    scheduler.crudManager.sync();
                }
            },
            reloadButton : {
                icon : 'fa fa-sync',
                text : 'Reload scheduler',
                async onClick() {
                    try {
                        await scheduler.crudManager.load();
                        Toast.show('Data reloaded');
                    }
                    catch (e) {
                        Toast.show('Loading failed');
                    }
                }
            },
            resetButton : {
                color : 'b-red',
                icon  : 'fa fa-recycle',
                text  : 'Reset database',
                async onClick() {
                    try {
                        await scheduler.crudManager.load({ reset : true });
                        Toast.show('Database was reset');
                    }
                    catch (e) {
                        Toast.show('Database reset failed');
                    }
                }
            }
        }
    },

    bbar : [
        {
            type  : 'widget',
            ref   : 'crudStatus',
            width : 300,
            html  : ''
        }
    ],

    //region Time range editing

    // Edit a time range, passing null creates a new
    editTimeRange(record) {
        scheduler.timeRangeEditor = new TimeRangeEditor({
            owner : scheduler,
            mode  : 'timeRange',
            record
        });
    },

    // Double-clicked time range header, edit it
    onTimeRangeHeaderDblClick({ timeRangeRecord }) {
        this.editTimeRange(timeRangeRecord);
    },

    // Clicked add time range in the toolbar, add one
    onAddTimeRangeClick() {
        this.editTimeRange();
    },

    // Clicked edit time range in context menu, edit it
    onTimeRangeEditClick({ source }) {
        this.editTimeRange(source.timeRangeRecord);
    },

    // Remove time range, from context menu
    onTimeRangeDeleteClick({ source }) {
        source.timeRangeRecord.remove();
    },

    // Show custom context menu for time range headers
    onTimeRangeHeaderContextMenu({ timeRangeRecord, domEvent }) {
        domEvent.preventDefault();

        // Create a new menu for each click, so we can pass the timeRangeRecord to the menu items
        const menu = new Menu({
            closeAction : 'destroy',
            rootElement : document.body,
            owner       : scheduler,
            items       : {
                edit : {
                    text   : 'Edit time range',
                    icon   : 'fa fa-pencil',
                    onItem : 'up.onTimeRangeEditClick',
                    timeRangeRecord
                },
                delete : {
                    text   : 'Delete time range',
                    icon   : 'fa fa-trash',
                    onItem : 'up.onTimeRangeDeleteClick',
                    timeRangeRecord
                }
            }
        });

        // Show it where we clicked
        menu.showBy([domEvent.clientX, domEvent.clientY]);
    },

    //endregion

    //region Resource time range editing

    // Edit a resource time range, passing null creates a new
    editResourceTimeRange(record) {
        scheduler.timeRangeEditor = new TimeRangeEditor({
            owner : scheduler,
            mode  : 'resourceTimeRange',
            record
        });
    },

    // Clicked add resource time range in the toolbar, add one
    onAddResourceTimeRangeClick() {
        this.editResourceTimeRange();
    },

    // Double-clicked resource time range, edit it
    onResourceTimeRangeDblClick({ resourceTimeRangeRecord }) {
        this.editResourceTimeRange(resourceTimeRangeRecord);
    },

    // Show custom context menu for resource time ranges
    onResourceTimeRangeContextMenu({ resourceTimeRangeRecord, domEvent }) {
        domEvent.preventDefault();

        const menu = new Menu({
            closeAction : 'destroy',
            rootElement : document.body,
            owner       : scheduler,
            items       : {
                edit : {
                    text   : 'Edit resource time range',
                    icon   : 'fa fa-pencil',
                    onItem : 'up.onResourceTimeRangeEditClick',
                    resourceTimeRangeRecord
                },
                delete : {
                    text   : 'Delete resource time range',
                    icon   : 'fa fa-trash',
                    onItem : 'up.onResourceTimeRangeDeleteClick',
                    resourceTimeRangeRecord
                }
            }
        });

        menu.showBy([domEvent.clientX, domEvent.clientY]);
    },

    // Clicked edit resource time range in context menu, edit it
    onResourceTimeRangeEditClick({ source }) {
        this.editResourceTimeRange(source.resourceTimeRangeRecord);
    },

    // Clicked remove resource time range in context menu, remove it
    onResourceTimeRangeDeleteClick({ source }) {
        source.resourceTimeRangeRecord.remove();
    },

    // endregion

    listeners : {
        timeRangeHeaderContextMenu   : 'onTimeRangeHeaderContextMenu',
        timeRangeHeaderDblClick      : 'onTimeRangeHeaderDblClick',
        resourceTimeRangeDblClick    : 'onResourceTimeRangeDblClick',
        resourceTimeRangeContextMenu : 'onResourceTimeRangeContextMenu'
    }
});

const { crudStatus } = scheduler.widgetMap;

scheduler.crudManager.on({
    beforeLoad() {
        crudStatus.html = 'Loading <i class="fa fa-spinner"></i>';
    },
    load() {
        crudStatus.html = 'Data loaded <i class="fa fa-check-circle"></i>';
    },
    loadFail() {
        crudStatus.html = 'Data loading failed! <i class="fa fa-times-circle"></i>';
    },
    beforeSync() {
        crudStatus.html = 'Saving <i class="fa fa-spinner"></i>';
    },
    sync() {
        crudStatus.html = 'Changes saved <i class="fa fa-check-circle"></i>';
    },
    syncFail() {
        crudStatus.html = 'Saving changes failed <i class="fa fa-times-circle"></i>';
    },
    hasChanges() {
        crudStatus.html = 'Data modified <i class="fa fa-user-edit"></i>';
    }
});
