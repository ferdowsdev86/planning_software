var _staticBlock;
function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value : t, enumerable : !0, configurable : !0, writable : !0 }) : e[r] = t, e;
}
function _toPropertyKey(t) {
    var i = _toPrimitive(t, 'string'); return typeof i == 'symbol' ? i : i + '';
}
function _toPrimitive(t, r) {
    if ('object' != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (undefined !== e) {
        var i = e.call(t, r || 'default'); if ('object' != typeof i) return i; throw new TypeError('@@toPrimitive must return a primitive value.');
    } return (r === 'string' ? String : Number)(t);
}
var {
    DragHelper,
    Toast,
    Grid,
    StringHelper,
    Scheduler,
    DateHelper,
    SchedulerEventModel,
    AjaxStore
} = window.bryntum.schedulerpro;
//region "lib/Drag.js"

class Drag extends DragHelper {
    static get configurable() {
        return {
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
            targetSelector       : '.b-grid-row:not(.b-group-row) .b-grid-cell'
        };
    }

    // Listening to events using the onXXX notation, similar to this.on('dragStart', () => {})
    onDragStart({
        context
    }) {
    // save a reference to the equipment so we can access it later
        context.equipment = this.grid.getRecordFromElement(context.grabbed);

        // Prevent tooltips from showing while dragging
        this.schedule.features.eventTooltip.disabled = true;
    }

    // In the onDrop, we instruct the drag helper to transition the drag proxy element to an approximate destination
    // before updating the event record (done in onDropFinalized)
    async onDrop({
        context
    }) {
        if (context.valid) {
            const {
                    target
                } = context,
                equipmentItem = context.equipment,
                eventRecord = this.schedule.resolveEventRecord(target);
            if (eventRecord.equipment.includes(equipmentItem.id)) {
                context.valid = false;
                Toast.show(`${equipmentItem.name} is already assigned to ${eventRecord.name}`);
            }
            else {
                const equipmentWrap = context.target.closest('.b-sch-event').querySelector('.b-sch-event-equipment-wrap'),
                    animTarget = (equipmentWrap === null || equipmentWrap === undefined ? undefined : equipmentWrap.lastElementChild) || equipmentWrap;
                if (animTarget) {
                    await this.animateProxyTo(animTarget, {
                        align  : 'l0-r14',
                        offset : [equipmentWrap !== null && equipmentWrap !== undefined && equipmentWrap.lastElementChild ? parseInt(getComputedStyle(equipmentWrap.lastElementChild).marginInlineEnd) : 0]
                    });
                }
                eventRecord.equipment = eventRecord.equipment.concat(equipmentItem.id);
                Toast.show(`Added ${equipmentItem.name} to ${eventRecord.name}`);
            }
        }
    }
}

//endregion

//region "lib/EquipmentGrid.js"

class EquipmentGrid extends Grid {
    /**
   * Original class name getter. See Widget.$name docs for the details.
   * @returns {string}
   */
    static $name = 'EquipmentGrid';

    // Factoryable type name
    static type = (_staticBlock = () => _defineProperty(this, 'configurable', {
        disableGridRowModelWarning : true,
        features                   : {
            filterBar : true,
            cellEdit  : false
        },
        rowHeight : 100,
        columns   : [{
            field     : 'name',
            ariaLabel : this.L('L{Column.columnLabel}', {
                text : 'Equipment'
            }),
            filterable : {
                filterField : {
                    ariaLabel : 'Filter Equipment'
                }
            },
            htmlEncode : false,
            cellCls    : 'b-equipment',
            renderer   : data => StringHelper.xss`<i class="b-equipment-icon ${data.record.iconCls}"></i>${data.record.name}`
        }]
    }), 'equipmentgrid');
}

// Register this widget type with its Factory
_staticBlock();
EquipmentGrid.initClass();

//endregion

//region "lib/Schedule.js"

class Schedule extends Scheduler {
    // Original class name. See Widget.$name docs for the details.
    static $name = 'Schedule';

    // Factoryable type name
    static type = 'schedule';
    static configurable = {
        rowHeight      : 85,
        barMargin      : 10,
        eventColor     : 'indigo',
        eventStyle     : 'tonal',
        resourceImages : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        },
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
        columns : [{
            type           : 'resourceInfo',
            text           : 'Name',
            width          : 200,
            showEventCount : false,
            showRole       : true
        }],
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

    // Render some extra elements for the assignment equipment items
    eventRenderer({
        eventRecord
    }) {
        const equipment = eventRecord.equipment.map(itemId => this.equipmentStore.getById(itemId) || {});
        return `
            <div class="b-sch-event-startdate"><span>${DateHelper.format(eventRecord.startDate, 'LT')}</span><span class="b-sch-event-name">${StringHelper.encodeHtml(eventRecord.name || '')}</span></div>
            
            <ul class="b-sch-event-equipment-wrap">
                ${equipment.map(item => `<li title="${StringHelper.encodeHtml(item.name)}" class="${item.iconCls ?? ''}"></li>`).join('')}
            </ul>
            </div>
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

class Task extends SchedulerEventModel {
    static get fields() {
        return ['equipment'];
    }
    static get defaults() {
        return {
            // in this demo, default duration for tasks will be hours (instead of days)
            durationUnit : 'h',
            equipment    : []
        };
    }
}

//endregion

const equipmentStore = new AjaxStore({
    readUrl : 'data/equipment.json',
    fields  : ['name', 'iconCls'],
    sorters : [{
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
    crudManager : {
        autoLoad   : true,
        eventStore : {
            modelClass : Task
        },
        loadUrl : 'data/data.json'
    }
});
equipmentStore.load();

// Create our list of equipment
const equipmentGrid = new EquipmentGrid({
    ref        : 'equipment',
    appendTo   : 'bodycontainer',
    eventStore : schedule.eventStore,
    // Use a chained Store to avoid its filtering to interfere with Scheduler's rendering
    store      : equipmentStore.chain()
});
const drag = new Drag({
    grid         : equipmentGrid,
    schedule,
    outerElement : equipmentGrid.element
});