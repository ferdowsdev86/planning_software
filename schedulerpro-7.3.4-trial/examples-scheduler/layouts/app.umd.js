var {
    Scheduler,
    StringHelper
} = window.bryntum.schedulerpro;

// Simple custom sorter that sorts late start before early start
function customSorter(a, b) {
    return b.startDate.getTime() - a.startDate.getTime();
}
const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    eventStyle : 'rounded',
    features   : {
        cellEdit : {
            // Start cell editing on click
            triggerEvent : 'cellclick'
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
    }, {
        text          : 'Layout',
        field         : 'eventLayout',
        width         : 120,
        instantUpdate : true,
        // Config for the editor.inputField
        editor        : {
            type        : 'combo',
            editable    : false,
            placeholder : 'Inherit',
            items       : [['', 'Inherit'], ['stack', 'Stack'], ['pack', 'Pack'], ['none', 'Overlap']]
        },
        renderer : ({
            value,
            column
        }) => {
            var _column$editor$store$;
            return {
                class    : 'layoutCellContent',
                children : [{
                    tag  : 'span',
                    html : ((_column$editor$store$ = column.editor.store.getById(value)) === null || _column$editor$store$ === undefined ? undefined : _column$editor$store$.text) ?? 'Inherit'
                }, {
                    tag   : 'i',
                    class : 'fa fa-pen'
                }]
            };
        }
    }],
    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/data.json'
    },
    barMargin   : 1,
    rowHeight   : 50,
    eventLayout : 'stack',
    startDate   : new Date(2017, 1, 7, 8),
    endDate     : new Date(2017, 1, 7, 18),
    viewPreset  : 'hourAndDay',
    // *Experimental API* Don't let events shrink below 10px in height when packing.
    // If they do, grow the row instead
    minPackSize : 10,
    eventRenderer({
        eventRecord,
        renderData
    }) {
    // Icon by type
        renderData.iconCls = eventRecord.eventType === 'Meeting' ? 'fa fa-calendar' : 'fa fa-calendar-alt';

        // Encode name to protect against xss
        return StringHelper.encodeHtml(eventRecord.name);
    },
    tbar : [{
        type        : 'buttonGroup',
        rendition   : 'padded',
        toggleGroup : true,
        defaults    : {
            width : '6em'
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
            scheduler.eventLayout = button.id;
        }
    }, {
        type     : 'slidetoggle',
        ref      : 'customButton',
        text     : 'Custom sorter',
        tooltip  : 'Click to use a custom event sorting function',
        onChange : ({
            checked
        }) => {
            scheduler.overlappingEventSorter = checked ? customSorter : null;
        }
    }]
});