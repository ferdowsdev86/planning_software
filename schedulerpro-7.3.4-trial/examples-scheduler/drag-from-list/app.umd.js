var {
    DragHelper,
    Toast,
    List,
    Scheduler,
    DateHelper,
    StringHelper,
    SchedulerEventModel,
    AjaxStore,
    Panel
} = window.bryntum.schedulerpro;
//region "lib/Drag.js"

class Drag extends DragHelper {
    static configurable = {
        callOnFunctions      : true,
        // Don't drag the actual cell element, clone it
        cloneTarget          : true,
        // We size the cloned element using CSS
        autoSizeClonedTarget : false,
        // Only allow drops on scheduled tasks
        dropTargetSelector   : '.b-sch-event',
        // Drag only the icon inside the cell
        proxySelector        : 'i',
        // Only allow dragging cell elements inside on the equipment grid
        targetSelector       : '.b-list-item'
    };

    // Listening to events using the onXXX notation, similar to this.on('dragStart', () => {})
    onDragStart({
        event,
        context
    }) {
    // save a reference to the equipment so we can access it later
        context.equipment = this.equipmentList.getRecordFromElement(context.grabbed);

        // Prevent tooltips from showing while dragging
        this.schedule.features.eventTooltip.disabled = true;
    }

    // In the onDrop, we instruct the drag helper to transition the drag proxy element to an approximate destination
    // before updating the event record (done in onDropFinalized)
    async onDrop({
        context
    }) {
        const {
            target
        } = context;
        if (context.valid) {
            const equipment = context.equipment,
                eventRecord = this.schedule.resolveEventRecord(target),
                alignTarget = target.closest('.b-sch-event').querySelector('.b-sch-event-equipment-wrap');
            await this.animateProxyTo(alignTarget, {
                align  : 'l0-r0',
                offset : [0, -11]
            });
            eventRecord.equipment = eventRecord.equipment.concat(equipment);

            // Show a toast
            Toast.show(`Added ${equipment.name} to ${eventRecord.name}`);
        }
        this.schedule.features.eventTooltip.disabled = false;
    }
}

//endregion

//region "lib/EquipmentList.js"

// A List subclass showing equipment
class EquipmentList extends List {
    // Class name getter, to ensure class name can read also in minified code
    static $name = 'EquipmentList';

    // Factoryable type name
    static type = 'equipmentlist';
    static configurable = {
        itemTpl : record => `<i class="b-equipment-icon ${record.iconCls} b-colorize"></i>${record.name}`
    };
}

// Register this widget type with its Factory
EquipmentList.initClass();

//endregion

//region "lib/Schedule.js"

// A demo subclass of the Scheduler component
class Schedule extends Scheduler {
    // Original class name getter. See Widget.$name docs for the details.
    static $name = 'Schedule';

    // Factoryable type name
    static type = 'schedule';

    // In the configurable block, you can configure features / settings
    static configurable = {
        features : {
            eventMenu : {
                items : [
                    // custom item with inline handler
                    {
                        text   : 'Remove all equipment',
                        icon   : 'fa fa-times',
                        weight : 200,
                        onItem : ({
                            eventRecord
                        }) => eventRecord.equipment = []
                    }]
            },
            eventEdit : {
                // Add an extra combo box to the editor to select equipment
                items : {
                    equipment : {
                        type         : 'combo',
                        weight       : 900,
                        // At end
                        editable     : false,
                        multiSelect  : true,
                        valueField   : 'id',
                        displayField : 'name',
                        ref          : 'equipment',
                        name         : 'equipment',
                        label        : 'Equipment',
                        // Will be populated with items on first show
                        items        : []
                    }
                }
            }
        },
        rowHeight      : 100,
        barMargin      : 4,
        eventColor     : 'indigo',
        eventStyle     : 'traced',
        resourceImages : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        },
        columns : [{
            type           : 'resourceInfo',
            text           : 'Name',
            width          : 200,
            showEventCount : false,
            showRole       : true
        }],
        // The crud manager will load all its data (resource + events) in one ajax request
        crudManager : {
            autoLoad  : true,
            transport : {
                load : {
                    url : 'data/data.json'
                }
            }
        },
        // Custom view preset with header configuration
        viewPreset : {
            base            : 'hourAndDay',
            columnLinesFor  : 0,
            mainHeaderLevel : 1,
            headers         : [{
                unit       : 'd',
                align      : 'center',
                dateFormat : 'ddd DD MMM'
            }, {
                unit       : 'h',
                align      : 'center',
                dateFormat : 'HH'
            }]
        }
    };
    construct(config) {
        const me = this;
        super.construct(config);
        me.on({
            eventEditBeforeSetRecord : me.onBeforeRecordLoaded,
            thisObj                  : me,
            once                     : true
        });
        me.equipmentStore.on('load', me.onEquipmentStoreLoad, me);
    }

    // This method provides the HTML template for the event bars. Some extra elements have been added for the equipment items
    eventRenderer({
        eventRecord
    }) {
        const equipment = eventRecord.equipment.map(itemId => this.equipmentStore.getById(itemId) || {});
        return `
            <div class="b-sch-event-name">${StringHelper.encodeHtml(eventRecord.name || '')}</div>
            <div class="b-sch-event-startdate">${DateHelper.format(eventRecord.startDate, 'LT')}</div> 
            <ul class="b-sch-event-equipment-wrap">
                ${equipment.map(item => `<li title="${StringHelper.encodeHtml(item.name || '')}" class="${item.iconCls || ''}"></li>`).join('')}
            </ul>
        `;
    }

    // Populate the equipment combo first time editor is shown
    onBeforeRecordLoaded({
        source: editor
    }) {
        const equipmentCombo = editor.widgetMap.equipment;
        if (!equipmentCombo.items.length) {
            equipmentCombo.items = this.equipmentStore.getRange();
        }
    }
    onEquipmentStoreLoad() {
    // Setup the data for the equipment combo inside the event editor
    // Since the event bars contain icons for equipment, we need to refresh rows once equipment store is available
        this.refreshRows();
    }
}

// Register this widget type with its Factory
Schedule.initClass();

//endregion

//region "lib/Task.js"

// Our custom model class where we add an extra `equipment` field and reconfigure the default duration unit to 'h'
class Task extends SchedulerEventModel {
    static fields = [{
        name         : 'equipment',
        type         : 'array',
        defaultValue : []
    },
    // in this demo, default duration for tasks will be hours (instead of days)
    {
        name         : 'durationUnit',
        defaultValue : 'h'
    }];
}

//endregion

// The data store which contains the equipment for the right hand side data grid
const equipmentStore = new AjaxStore({
    // Defined in ./lib/Task.js
    modelClass : Task,
    autoLoad   : true,
    readUrl    : 'data/equipment.json',
    sorters    : [{
        field     : 'name',
        ascending : true
    }]
});
const schedule = new Schedule({
    ref         : 'schedule',
    appendTo    : 'bodycontainer',
    // Enables smoother wheel and pinch zooming
    smoothZoom  : true,
    startDate   : new Date(2017, 11, 1, 8),
    endDate     : new Date(2017, 11, 1, 18),
    equipmentStore,
    // The crudManager is responsible for loading remote data (you can also load inline data from arrays)
    crudManager : {
        autoLoad   : true,
        eventStore : {
            modelClass : Task
        },
        loadUrl : 'data/data.json'
    }
});
const equipmentList = new EquipmentList({
    // Use a chained Store to avoid its filtering to interfere with Scheduler's rendering
        store : equipmentStore.chain()
    }),
    equipmentPanel = new Panel({
        title    : 'Equipment (draggable)',
        cls      : 'equipmentpanel',
        ui       : 'toolbar',
        appendTo : 'bodycontainer',
        items    : {
            // Pass our list of equipment
            equipment : equipmentList
        }
    });

// Our drag drop implementation
const drag = new Drag({
    equipmentList,
    schedule,
    outerElement : equipmentList.element
});