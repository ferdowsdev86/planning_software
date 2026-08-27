var {
    Scheduler,
    SchedulerResourceModel,
    SchedulerEventModel,
    SchedulerDependencyModel,
    StringHelper
} = window.bryntum.schedulerpro;
class Gate extends SchedulerResourceModel {
    static fields = ['capacity'];
}
new Scheduler({
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    features   : {
        tree         : true,
        regionResize : true,
        dependencies : true
    },
    rowHeight : 45,
    barMargin : 5,
    columns   : [{
        type  : 'tree',
        text  : 'Name',
        width : 230,
        field : 'name'
    }, {
        type  : 'number',
        text  : 'Capacity',
        width : 100,
        field : 'capacity'
    }],
    startDate          : new Date(2017, 11, 2, 8),
    viewPreset         : 'hourAndDay',
    enableUndoRedoKeys : true,
    crudManager        : {
        autoLoad      : true,
        resourceStore : {
            modelClass : Gate
        },
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },
    // Scheduler always has a Project instance internally, we need to configure its internal StateTrackingManager
    // so that the UndoRedo widget gets customized titles in its transaction dropdown.
    project : {
        stm : {
            // NOTE, that this option does not enable the STM itself, this is done by the `undoredo` widget,
            // defined in the toolbar below
            // If you don't use `undoredo` widget in your app, you need to enable STM manually: `stm.enable()`,
            // otherwise, it won't be tracking changes in the data
            // It's usually best to enable STM after the initial data loading is completed.
            autoRecord : true,
            getTransactionTitle(transaction) {
                const lastAction = transaction.queue[transaction.queue.length - 1];
                let {
                    type,
                    model
                } = lastAction;
                if (lastAction.modelList && lastAction.modelList.length) {
                    model = lastAction.modelList[0];
                }
                let title = 'Transaction ' + this.position;
                if (type === 'UpdateAction' && model instanceof SchedulerEventModel) {
                    title = 'Edit flight ' + model.name;
                }
                else if (type === 'UpdateAction' && model instanceof SchedulerResourceModel) {
                    title = 'Edit gate ' + model.name;
                }
                else if (type === 'RemoveAction' && model instanceof SchedulerEventModel) {
                    title = 'Remove flight ' + model.name;
                }
                else if (type === 'RemoveAction' && model instanceof SchedulerResourceModel) {
                    title = 'Remove gate ' + model.name;
                }
                else if (type === 'AddAction' && model instanceof SchedulerEventModel) {
                    title = 'Add flight ' + model.name;
                }
                else if (type === 'AddAction' && model instanceof SchedulerDependencyModel) {
                    title = StringHelper.xss`Link ${model.fromEvent.name} -> ${model.toEvent.name}`;
                }
                return title;
            }
        }
    },
    eventRenderer({
        eventRecord,
        resourceRecord,
        renderData
    }) {
        renderData.iconCls = 'fa fa-plane';
        if (resourceRecord.isLeaf) {
            renderData.eventColor = 'blue';
            return StringHelper.encodeHtml(eventRecord.name);
        }
        else {
            renderData.eventColor = 'orange';
            return '';
        }
    },
    tbar : [{
        type  : 'undoredo',
        icon  : 'fa fa-undo',
        items : {
            transactionsCombo : {
                width : 250
            }
        }
    }]
});