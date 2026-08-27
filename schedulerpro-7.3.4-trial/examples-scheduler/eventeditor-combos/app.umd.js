var {
    DateHelper,
    AjaxStore,
    Scheduler,
    SchedulerEventModel,
    Toast,
    StringHelper
} = window.bryntum.schedulerpro;
class Task extends SchedulerEventModel {
    static get fields() {
        return ['floor', 'room', {
            name         : 'eventType',
            defaultValue : 'Meeting'
        }];
    }
}

// these two custom stores will be loaded w/ Crud Manager

const floors = new AjaxStore({
    id : 'floors'
});
const rooms = new AjaxStore({
    id : 'rooms'
});
const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    eventStyle     : 'bordered',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    features : {
        stripe     : true,
        timeRanges : true,
        eventEdit  : {
            // Add extra widgets to the event editor
            items : {
                eventType : {
                    type      : 'combo',
                    name      : 'eventType',
                    label     : 'Type',
                    weight    : 110,
                    items     : ['Appointment', 'Internal', 'Meeting'],
                    listeners : {

                        change : ({
                            source: combo,
                            value
                        }) => {
                            // toggle visibility of widgets belonging to eventTypes
                            combo.owner.items.forEach(widget => {
                                if (widget.dataset && widget.dataset.eventType) {
                                    widget.hidden = widget.dataset.eventType !== value;
                                }
                            });
                        }
                    }
                },
                floor : {
                    type        : 'combo',
                    store       : floors,
                    name        : 'floor',
                    label       : 'Floor',
                    placeholder : 'Select floor...',
                    weight      : 120,
                    editable    : false,
                    clearable   : true,
                    dataset     : {
                        eventType : 'Meeting'
                    },
                    // This field is only displayed for meetings
                    listeners : {
                        change : async({
                            source: combo,
                            value
                        }) => {
                            const roomCombo = combo.owner.widgetMap.roomCombo;
                            if (combo.record) {
                                await roomCombo.store.filter({
                                    property : 'floorId',
                                    value
                                });
                                roomCombo.disabled = false;

                                // if the selected record has been filtered out need to reset value
                                const index = roomCombo.store.indexOf(roomCombo.record);
                                // check both undefined and -1 until https://app.assembla.com/spaces/bryntum/tickets/8890 is resolved
                                if (index === -1 || index == null) {
                                    roomCombo.value = null;
                                }
                            }
                            else {
                                roomCombo.value = null;
                                roomCombo.disabled = true;
                            }
                        }
                    }
                },
                roomCombo : {
                    type        : 'combo',
                    ref         : 'roomCombo',
                    store       : rooms,
                    name        : 'room',
                    label       : 'Room',
                    placeholder : 'Select room...',
                    weight      : 130,
                    editable    : false,
                    clearable   : true,
                    disabled    : true,
                    dataset     : {
                        eventType : 'Meeting'
                    } // This field is only displayed for meetings
                }
            }
        }
    },
    subGridConfigs : {
        locked : {
            width : 400
        }
    },
    columns : [{
        type : 'resourceInfo',
        text : 'Staff',
        flex : 1
    }, {
        text   : 'Type',
        field  : 'role',
        width  : 150,
        editor : {
            type        : 'combo',
            items       : ['Sales', 'Developer', 'Marketing', 'Product manager', 'CEO', 'CTO'],
            editable    : false,
            pickerWidth : 140
        }
    }],
    crudManager : {
        autoLoad   : true,
        stores     : [floors, rooms],
        loadUrl    : 'data/data.json',
        eventStore : {
            modelClass : Task
        }
    },
    eventColor : null,
    // disable default color for events (colors are set in scss file depending on its type)
    barMargin  : 2,
    rowHeight  : 50,
    startDate  : new Date(2025, 1, 7, 8),
    endDate    : new Date(2025, 1, 7, 22),
    viewPreset : {
        base      : 'hourAndDay',
        tickWidth : 100
    },
    // Specialized event bar template with header and footer
    eventRenderer({
        eventRecord,
        renderData
    }) {
        renderData.wrapperCls.add(`b-event-type-${eventRecord.eventType.toLowerCase()}`);
        let headerText = DateHelper.format(eventRecord.startDate, 'LT');
        if (eventRecord.eventType === 'Meeting') {
            if (eventRecord.floor) {
                headerText += ` | Floor #${eventRecord.floor}`;
            }
            if (eventRecord.room) {
                headerText += ` | Room #${eventRecord.room}`;
            }
        }
        return StringHelper.xss`
            <section>
                <div class="b-sch-event-header">${headerText}</div>
                <div class="b-sch-event-footer">${eventRecord.name || ''}</div>
            </section>
        `;
    },
    listeners : {
        beforeEventEditShow({
            eventRecord,
            editor
        }) {
            editor.title = eventRecord.eventStore ? `Edit ${eventRecord.eventType || ''}` : 'Add new event';
        }
    },
    tbar : [{
        type      : 'button',
        icon      : 'b-icon-add',
        text      : 'Add new event',
        rendition : 'filled',
        onAction  : () => {
            const resource = scheduler.resourceStore.first;
            if (!resource) {
                Toast.show('There is no resource available');
                return;
            }
            const event = new Task({
                resourceId   : resource.id,
                startDate    : scheduler.startDate,
                duration     : 1,
                durationUnit : 'h',
                name         : 'New task'
            });
            scheduler.editEvent(event);
        }
    }, {
        type     : 'button',
        icon     : 'b-icon-trash',
        color    : 'b-red',
        text     : 'Clear all events',
        onAction : () => scheduler.eventStore.removeAll()
    }]
});