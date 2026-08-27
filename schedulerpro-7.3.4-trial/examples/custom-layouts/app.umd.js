var {
    StringHelper,
    SchedulerPro,
    EventModel
} = window.bryntum.schedulerpro;
class GroupedEventModel extends EventModel {
    static get fields() {
        return [{
            name         : 'priority',
            defaultValue : 'low'
        }, {
            name         : 'confirmed',
            type         : 'boolean',
            defaultValue : false
        }];
    }
}

// Event layout config that we will update at runtime
const eventLayout = {
    type    : 'stack',
    // Specify order of all groups
    weights : {
        true  : 1,
        false : 2,
        high  : 1,
        low   : 2
    },
    groupBy : 'priority'
};
const customEventLayout = {
    layoutFn : items => {
        let bottom = 50;
        items.forEach((item, i) => {
            // Confirmed events should be higher
            item.height = item.confirmed ? 60 : 30;

            // Position every event 10px further down
            item.top = i * 10;
            bottom = Math.max(bottom, item.top + item.height);
        });

        // Return row height in pixels
        return bottom;
    }
};
const scheduler = new SchedulerPro({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    eventStyle : 'indented',
    features   : {
        stripe   : true,
        cellEdit : {
            // Start cell editing on click
            triggerEvent : 'cellclick'
        },
        taskEdit : {
            items : {
                generalTab : {
                    items : {
                        // Customize task editor to handle new model fields
                        priorityField : {
                            type  : 'combo',
                            store : {
                                data : [{
                                    id   : 'high',
                                    text : 'High'
                                }, {
                                    id   : 'low',
                                    text : 'Low'
                                }]
                            },
                            name     : 'priority',
                            label    : 'Priority',
                            editable : false,
                            weight   : 250
                        },
                        eventScopeField : {
                            type   : 'checkbox',
                            name   : 'confirmed',
                            label  : 'Confirmed',
                            weight : 250
                        }
                    }
                }
            }
        }
    },
    listeners : {
    // Auto-show picker on cell editing
        startCellEdit({
            editorContext
        }) {
            var _editorContext$editor, _editorContext$editor2;
            (_editorContext$editor = (_editorContext$editor2 = editorContext.editor.inputField).showPicker) === null || _editorContext$editor === undefined || _editorContext$editor.call(_editorContext$editor2);
        }
    },
    columns : [{
        type : 'resourceInfo',
        text : 'Staff'
    }],
    project : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        eventModelClass  : GroupedEventModel,
        // This config enables responses validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },
    barMargin  : 1,
    rowHeight  : 50,
    startDate  : new Date(2017, 1, 7, 8),
    endDate    : new Date(2017, 1, 7, 18),
    viewPreset : 'hourAndDay',
    eventLayout,
    eventRenderer({
        eventRecord,
        renderData
    }) {
        const {
            groupBy
        } = eventLayout;

        // Color by group
        if (groupBy) {
            if (eventRecord[groupBy] === 'high' || eventRecord[groupBy] === true) {
                renderData.eventColor = 'red';
            }
            else {
                renderData.eventColor = 'blue';
            }
        }
        // Icon by type
        renderData.iconCls = eventRecord.confirmed ? 'fa fa-check' : 'fa fa-question';

        // Encode name to protect against xss
        return StringHelper.encodeHtml(`${eventRecord.name} (${eventRecord.priority} prio)`);
    },
    tbar : [{
        type        : 'buttonGroup',
        toggleGroup : true,
        rendition   : 'padded',
        defaults    : {
            width : '12em'
        },
        items : [{
            type    : 'button',
            ref     : 'defaultButton',
            text    : 'Default layouts',
            pressed : true
        }, {
            type : 'button',
            ref  : 'layoutFnButton',
            text : 'Layout function'
        }],
        onAction({
            source: button
        }) {
            const {
                    ref
                } = button,
                {
                    layoutsGroup,
                    groupCombo
                } = scheduler.tbar.widgetMap;
            let layout;
            if (ref === 'layoutFnButton') {
                layoutsGroup.hidden = true;
                groupCombo.hidden = true;
                layout = customEventLayout;
            }
            else {
                layoutsGroup.hidden = false;
                groupCombo.hidden = false;
                layout = eventLayout;
            }

            // Copy event layout config to an empty object to keep it clean
            scheduler.eventLayout = Object.assign({}, layout);
        }
    }, {
        type        : 'buttonGroup',
        ref         : 'layoutsGroup',
        toggleGroup : true,
        rendition   : 'padded',
        defaults    : {
            width : '8em'
        },
        items : [{
            id      : 'stack',
            type    : 'button',
            ref     : 'stackButton',
            text    : 'Stack',
            pressed : true
        }, {
            id   : 'pack',
            type : 'button',
            ref  : 'packButton',
            text : 'Pack'
        }, {
            id   : 'none',
            type : 'button',
            ref  : 'noneButton',
            text : 'Overlap'
        }],
        onAction({
            source: button
        }) {
            const {
                id
            } = button;
            switch (id) {
                case 'stack':
                case 'none':
                    scheduler.rowHeight = 50;
                    break;
                case 'pack':
                    scheduler.rowHeight = 100;
                    break;
            }
            eventLayout.type = id;

            // Copy event layout config to an empty object to keep it clean
            scheduler.eventLayout = Object.assign({}, eventLayout);
        }
    }, {
        type  : 'combo',
        ref   : 'groupCombo',
        store : {
            data : [{
                id   : 'priority',
                text : 'Priority'
            }, {
                id   : 'confirmed',
                text : 'Confirmation'
            }]
        },
        label     : 'Group events by',
        editable  : false,
        clearable : true,
        value     : 'Priority',
        width     : '20em',
        onChange  : ({
            value
        }) => {
            eventLayout.groupBy = value;
            scheduler.eventLayout = Object.assign({}, eventLayout);
        }
    }]
});