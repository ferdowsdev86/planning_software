var {
    StringHelper,
    SchedulerResourceModel,
    Scheduler
} = window.bryntum.schedulerpro;
class Gate extends SchedulerResourceModel {
    static get fields() {
        return [{
            name : 'capacity',
            type : 'number'
        }, {
            name : 'waiting',
            type : 'number'
        }, {
            name : 'domestic',
            type : 'boolean'
        }];
    }
}
const
    // Group by capacity, in steps of 50
    sizeGrouper = ({
        capacity
    }) => `Capacity ${Math.floor(capacity / 50) * 50} - ${(Math.floor(capacity / 50) + 1) * 50 - 1}`,
    // Group by waiting time, None, Less than an hour or More than an hour
    waitingTimeGrouper = ({
        waiting
    }) => waiting === 0 ? 'None' : waiting < 60 ? 'Less than an hour' : 'More than an hour',
    // Group by domestic or international
    domesticGrouper = ({
        domestic
    }) => domestic ? 'Domestic' : 'International';
const scheduler = new Scheduler({
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    eventColor : null,
    eventStyle : 'filled',
    features   : {
        tree      : true,
        // Enable the TreeGroup feature, which can transform the tree's structure
        treeGroup : {
            // Initially transformed with a single parent level based on capacity
            levels : [sizeGrouper]
        }
    },
    rowHeight : 45,
    barMargin : 5,
    columns   : [{
        type  : 'tree',
        text  : 'Name',
        width : 220,
        field : 'name'
    }, {
        type  : 'number',
        text  : 'Capacity',
        width : 110,
        field : 'capacity',
        align : 'right'
    }, {
        type  : 'number',
        text  : 'Waiting time',
        width : 110,
        field : 'waiting',
        align : 'right'
    }, {
        text   : 'Domestic',
        width  : 110,
        field  : 'domestic',
        align  : 'center',
        editor : null,
        renderer({
            value
        }) {
            if (value) {
                return {
                    tag       : 'i',
                    className : 'fa fa-times'
                };
            }
            return '';
        }
    }],
    startDate   : new Date(2022, 8, 12, 8),
    viewPreset  : 'hourAndDay',
    crudManager : {
        autoLoad      : true,
        resourceStore : {
            modelClass : Gate
        },
        loadUrl : 'data/data.json'
    },
    // Custom eventRenderer, used to colorize the flights depending on the waiting time at the gate
    eventRenderer({
        eventRecord,
        resourceRecord,
        renderData
    }) {
        renderData.wrapperCls.add(resourceRecord.waiting > 60 ? 'purple' : resourceRecord.waiting > 30 ? 'apricot' : resourceRecord.waiting > 5 ? 'cyan' : 'green');
        return StringHelper.encodeHtml(eventRecord.name);
    },
    tbar : [{
        type        : 'buttongroup',
        ref         : 'buttons',
        rendition   : 'padded',
        toggleGroup : true,
        items       : [{
            text    : 'Capacity',
            pressed : true,
            async onToggle({
                pressed
            }) {
                if (pressed) {
                    // The buttons are disabled during grouping, since it is an async operation
                    buttons.disable();
                    await scheduler.group([sizeGrouper]);
                    buttons.enable();
                }
            }
        }, {
            text : 'Waiting time',
            async onToggle({
                pressed
            }) {
                if (pressed) {
                    buttons.disable();
                    await scheduler.group([waitingTimeGrouper]);
                    buttons.enable();
                }
            }
        }, {
            text : 'Domestic + capacity',
            async onToggle({
                pressed
            }) {
                if (pressed) {
                    buttons.disable();
                    await scheduler.group([domesticGrouper, sizeGrouper]);
                    buttons.enable();
                }
            }
        }, {
            text : 'None',
            async onToggle({
                pressed
            }) {
                if (pressed) {
                    buttons.disable();
                    await scheduler.clearGroups();
                    buttons.enable();
                }
            }
        }]
    }]
});
const {
    buttons
} = scheduler.widgetMap;