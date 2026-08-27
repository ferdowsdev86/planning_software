import shared from '../_shared/shared.module.js';
import { DateHelper, DragHelper, StringHelper, EventModel, ResourceModel, GridRowModel, Popup, Grid, DependencyModel, ProjectModel, SchedulerPro, Splitter } from '../../build/schedulerpro.module.js';
//region "lib/Drag.js"

// Handles dragging unscheduled orders from the grid onto the schedule
class Drag extends DragHelper {
    static get configurable() {
        return {
            // Don't drag the actual row element, clone it
            cloneTarget          : true,
            autoSizeClonedTarget : false,
            // Only allow drag of unscheduled orders
            targetSelector       : '.b-grid-row:not(.scheduled)',
            positioning          : 'inset',
            schedule             : null,
            grid                 : null,
            listeners            : {
                dragstart : 'onOrderDragStart',
                drag      : 'onOrderDrag',
                drop      : 'onOrderDrop',
                abort     : 'onOrderDrop'
            }
        };
    }

    createProxy(element) {
        const
            order             = this.grid.getRecordFromElement(element),
            firstTaskDuration = order.firstTask.duration,
            proxy             = element.cloneNode();

        // Mutate dragged element (grid row) into an event bar
        proxy.classList.remove('b-grid-row');
        proxy.classList.add('b-sch-event-wrap', 'b-style-border', 'b-unassigned-class');
        proxy.innerHTML = StringHelper.xss`
            <div class="b-sch-event b-has-content b-sch-event-with-icon">
                <div class="b-sch-event-content">
                    <div>${order.name}</div>
                    <span class="validity-overlap"><i></i>No overlap</span>
                    <span class="validity-machine"><i></i>Start machine: ${order.orderStartMachine.name}</span>
                </div>
            </div>
        `;

        // Size the proxy to match first task size
        const sizeProp = this.schedule.isHorizontal ? 'width' : 'height';
        proxy.style[sizeProp] = (firstTaskDuration * this.schedule.tickSize) + 'px';

        return proxy;
    }

    onOrderDragStart({ context }) {
        const
            me           = this,
            { schedule } = me,
            proxy        = context.element;

        // save a reference to the Order being dragged so we can access it later
        context.order = me.grid.getRecordFromElement(context.grabbed);

        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        // Prevent tooltips from showing while dragging
        schedule.features.eventTooltip.disabled = true;
        schedule.element.classList.add('b-mask-incompatible-rows');

        context.validityOverlapIcon  = proxy.querySelector('.validity-overlap i');
        context.validityResourceIcon = proxy.querySelector('.validity-machine i');

        // Only allow drops on the machine specific to the start task of the order, blur out others (in CSS
        me.dropTargetSelector             = `.b-timeline-sub-grid .b-grid-row[data-id="${context.order.orderStartMachine.id}"]`;
        context.order.orderStartMachine.cls = 'compatible';
    }

    onOrderDrag({ context }) {
        const
            { schedule } = this,
            // This example positions the drag proxy via `positioning : 'inset'` (not a CSS transform), so the
            // coordinate is read from the context position rather than `DomHelper.getTranslateX/Y`
            coordinate   = schedule.isHorizontal ? context.newX : context.newY,
            date         = schedule.getDateFromCoordinate(coordinate, 'round', false),
            // Only allow drops of an order onto the first machine which creates the chain of production tasks
            available    = date && schedule.eventStore.isDateRangeAvailable(date, DateHelper.add(date, context.order.firstTask.duration, 'h'), null, context.order.orderStartMachine);

        context.validityResourceIcon.className = `fa fa-fw fa-${context.valid ? 'check' : 'times'}`;
        context.validityOverlapIcon.className  = `fa fa-fw fa-${available ? 'check' : 'times'}`;
        context.valid                          = available;
        context.startDate                      = date;
    }

    // Drop callback after a mouse up, take action and transfer the unplanned Order to the real EventStore (if it's valid)
    async onOrderDrop({ context }) {
        const
            { schedule } = this;

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (context.valid) {
            schedule.project.scheduleOrder(context.order, context.startDate);
        }

        schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);
        schedule.features.eventTooltip.disabled = false;
        schedule.element.classList.remove('b-mask-incompatible-rows');
        context.order.orderStartMachine.cls = '';
    }
}

//endregion

//region "lib/Task.js"

class Task extends EventModel {
    static get fields() {
        return [
            { name : 'durationUnit', defaultValue : 'h' },
            'orderId'
        ];
    }

    get order() {
        return this.project?.getCrudStore('orders').getById(this.orderId);
    }

    get orderSize() {
        return this.order?.size;
    }

    get eventColor() {
        return this.order?.eventColor;
    }
}

//endregion

//region "lib/Machine.js"

// Custom Machine model, based on ResourceModel with additional fields
class Machine extends ResourceModel {
    static fields = [
        'capacity',
        'running',
        'statusMessage'
    ];
}

//endregion

//region "lib/Order.js"

let orderCount = 1010;

// Custom Task model, based on EventModel with additional fields
class Order extends GridRowModel {
    static fields = [
        'type',
        'name',
        'size',
        'customer',
        'firstTaskId',
        'lastTaskId'
    ];

    get project() {
        return this.stores[0].crudManager;
    }

    get template() {
        return this.project.getCrudStore('templates').getById(this.type);
    }

    get templateName() {
        return this.template?.name;
    }

    get orderStartMachine() {
        return this.project.resourceStore.getById(this.template.firstChild.resourceId);
    }

    get isScheduled() {
        return Boolean(this.firstTask?.startDate);
    }

    get startDate() {
        return this.firstTask?.startDate;
    }

    get finishDate() {
        return this.lastTask?.endDate;
    }

    get firstTask() {
        if (this.firstTaskId) {
            return this.project.eventStore.getById(this.firstTaskId);
        }
        else {
            // Not scheduled, read from template
            return this.template?.firstChild;
        }
    }

    get lastTask() {
        if (this.lastTaskId) {
            return this.project.eventStore.getById(this.lastTaskId);
        }
        else {
            // Not scheduled, read from template
            return this.template?.lastChild;
        }
    }

    static generateNewOrderId() {
        return orderCount++;
    }
}

//endregion

//region "lib/OrderForm.js"

class OrderForm extends Popup {

    static $name = 'OrderForm';

    static configurable = {
        title         : 'New order',
        rootElement   : document.body,
        width         : '32em',
        labelPosition : 'align-before',
        items         : {
            type : {
                type         : 'combo',
                valueField   : 'id',
                displayField : 'name',
                label        : 'Type',
                name         : 'type',
                listItemTpl  : template => StringHelper.xss`${template.name} (${template.children.length} tasks)`,
                editable     : false,
                required     : true,
                pickerWidth  : '20em'
            },
            customer : {
                type        : 'text',
                label       : 'Customer',
                name        : 'customer',
                placeholder : 'Acme Corporation',
                required    : true
            },
            quantity : {
                type  : 'number',
                label : 'Order quantity',
                step  : 10,
                min   : 10,
                value : 10,
                name  : 'size'
            }
        }
    };

    construct(...args) {
        super.construct(...args);

        const
            orderTypeCombo = this.widgetMap.type,
            // Picker shows only root templates; leaves are tasks within an order, not order types
            rootTemplates  = this.templateStore.chain(record => !record.isLeaf);

        this.rootTemplates   = rootTemplates;
        orderTypeCombo.store = rootTemplates;
        orderTypeCombo.value = rootTemplates.first;
    }

    doDestroy() {
        this.rootTemplates?.destroy();
        super.doDestroy();
    }
}

//endregion

//region "lib/OrderGrid.js"

// Custom grid that holds the orders for the production facility
class OrderGrid extends Grid {

    static $name = 'OrderGrid';

    static type = 'ordergrid';

    static configurable = {
        rowHeight     : 70,
        readOnly      : true,
        selectionMode : {
            row  : true,
            cell : false
        },
        store : {
            modelClass : Order
        },

        project : null,

        features : {
            stripe      : true,
            group       : false,
            cellTooltip : {
                hoverDelay      : 300,
                textContent     : true,
                tooltipRenderer : ({ record : order }) => order.isScheduled ? StringHelper.xss`<h4>${order.name}</h4>This order is scheduled to finish by <b>${DateHelper.format(order.finishDate, 'MMM d, h A')}</b>` : `<h4>Type: ${order.templateName}</h4>Try dragging this order onto the schedule`
            }
        },

        tbar : [
            {
                text       : 'Add order',
                icon       : 'fa fa-plus',
                toggleable : true,
                onAction   : 'up.onAddClick'
            },
            '->',
            {
                text       : 'Hide scheduled',
                toggleable : true,
                onToggle   : 'up.onScheduledOrdersButtonToggle'
            }
        ],

        columns : [{
            type       : 'template',
            text       : 'Order List',
            flex       : 1,
            minWidth   : 180,
            field      : 'name',
            htmlEncode : false,
            cellCls    : 'order-cell',
            template   : ({ record : order }) => StringHelper.xss`<div>${'#' + order.id} ${order.name}</div>
                    <div class="customer">${order.customer}, size: ${order.size}</div>`
        }, {
            text       : 'Start',
            type       : 'date',
            htmlEncode : false,
            format     : 'MMM D, h A',
            width      : 110,
            field      : 'firstTask.startDate',
            renderer({ value, record : order, row }) {
                row.toggleCls('scheduled', order.isScheduled);

                return DateHelper.format(value, this.format);
            }
        }, {
            text   : 'Finish',
            type   : 'date',
            width  : 110,
            format : 'MMM D, h A',
            editor : false,
            field  : 'lastTask.endDate'
        }],

        disableGridRowModelWarning : true
    };

    updateProject(project) {
        // Sync dates in this grid when tasks are updated
        project.on({
            refresh : 'updateOrderDates',
            thisObj : this
        });
    }

    // region Event handlers
    onScheduledOrdersButtonToggle({ pressed }) {
        if (pressed) {
            this.store.filter({
                property : 'isScheduled',
                operator : '=',
                value    : false
            });
        }
        else {
            this.store.clearFilters();
        }
    }

    onAddClick({ source : button }) {
        const
            templateStore = this.project.templates,
            form          = new OrderForm({
                templateStore,
                bbar : [
                    {
                        text : 'Cancel',
                        onClick() {
                            form.destroy();
                        }
                    },
                    {
                        text    : 'Create',
                        onClick : () => {
                            const data = form.values;

                            if (form.isValid) {
                                const added = this.store.add({
                                    id   : Order.generateNewOrderId(),
                                    name : templateStore.getById(data.type).name,
                                    ...data
                                });

                                this.scrollRowIntoView(added[0], { highlight : true });

                                form.destroy();
                            }
                        }
                    }
                ]
            });

        form.showBy({
            target : button,
            anchor : true
        });
    }

    // endregion

    updateOrderDates() {
        this.refreshColumn(this.columns.getAt(1));
        this.refreshColumn(this.columns.getAt(2));
    }
}

//endregion

//region "lib/ProductionProject.js"

// Custom Project model, based on ProjectModel with an extra API method to schedule an order
class ProductionProject extends ProjectModel {
    static configurable = {
        eventStore : {
            modelClass : Task
        },
        resourceStore : {
            modelClass : Machine
        },

        crudStores : [
            {
                id         : 'templates',
                tree       : true,
                modelClass : Task
            },
            {
                id         : 'orders',
                modelClass : Order
            }
        ]
    };

    get templates() {
        return this.getCrudStore('templates');
    }

    async scheduleOrder(order, startDate) {
        // First, copy template tasks into the Order model
        const
            template    = this.getCrudStore('templates').getById(order.type),
            orderTasks  = template.children.map(task => task.copy({
                orderId : order.id
            })),
            firstOrderTask = orderTasks[0];

        order.appendChild(orderTasks);

        order.firstTaskId = firstOrderTask.id;
        order.lastTaskId = order.lastChild.id;

        firstOrderTask.startDate = startDate;

        this.eventStore.add(order.children);

        /* Tasks are automatically assigned to the resource specified in the template:
        *
        *     {
        *         "name"       : "Weld",
        *         "resourceId" : 1,
        *         "duration"   : 3
        *     }
        *
        * Remains to create dependency links between them
        */
        order.children.forEach((orderTask, i) => {
            if (i < order.children.length - 1) {
                this.dependencyStore.add({
                    fromEvent : orderTask,
                    toEvent   : order.children[i + 1],
                    type      : DependencyModel.Type.EndToStart,
                    fromSide  : 'bottom',
                    toSide    : 'left'
                });
            }
        });

        // Commit changes immediately
        await this.project.commitAsync();
    }
}

//endregion

//region "lib/Schedule.js"



// Customized scheduler displaying sessions per room
class Schedule extends SchedulerPro {

    static $name = 'Schedule';

    static type = 'schedule';

    static configurable = {
        tickSize                  : 30,
        allowOverlap              : false,
        eventColor                : 'blue',
        snap                      : true,
        rowHeight                 : 80,
        barMargin                 : 14,
        highlightPredecessors     : true,
        highlightSuccessors       : true,
        autoCreate                : false,
        milestoneTextPosition     : 'inside',
        startHour                 : 5,
        endHour                   : 23,
        projectModelClass         : ProductionProject,
        // Enables smoother wheel and pinch zooming. Not enabled in this demo since the preset setup does not allow for
        // smooth zooming
        smoothZoom                : false,
        zoomOnMouseWheel          : false,
        zoomOnTimeAxisDoubleClick : false,

        features : {
            eventBuffer     : true,
            eventDragCreate : false,
            eventDrag       : {
                snapToResource : true
            },
            labels : {
                disabled : true,
                // using field as label (will first look in event and then in resource)
                right    : {
                    renderer : ({ eventRecord }) => StringHelper.xss`${eventRecord.name} (order #${eventRecord.orderId})`
                }
            },
            eventMenu : {
                items : {
                    deleteEvent : {
                        text : 'Delete task'
                    },
                    unassignEvent : false
                }
            },
            taskEdit : {
                editorConfig : {
                    title : 'Task'
                },
                items : {
                    generalTab : {
                        title : 'Details',
                        items : {
                            preambleField : {
                                label : 'Setup time'
                            },
                            postambleField : {
                                label : 'Cleanup'
                            },
                            effortField : {
                                cls : 'b-half-width'
                            },
                            endDateField     : false,
                            percentDoneField : false
                        }
                    }
                }
            }
        },
        tbar : [
            {
                icon      : 'fa fa-caret-left',
                rendition : 'text',
                onAction  : 'up.onPreviousDayClick'
            },
            {
                type     : 'button',
                text     : 'Today',
                onAction : 'up.onTodayClick'
            },
            {
                icon      : 'fa fa-caret-right',
                rendition : 'text',
                onAction  : 'up.onNextDayClick'
            },
            {
                type : 'widget',
                ref  : 'dateLabel',
                flex : 1
            },
            {
                type     : 'slidetoggle',
                text     : 'Show setup time',
                checked  : true,
                onChange : 'up.onToggleShowSetup'
            },
            {
                type    : 'viewpresetcombo',
                width   : '7.5em',
                presets : ['customHourAndDay', 'customDayAndWeek', 'customDayAndWeek_shiftWeek']
            },
            {
                type      : 'button',
                icon      : 'b-icon b-icon-menu',
                rendition : 'text',
                onAction  : 'up.onMenuButtonClick'
            }
        ],

        columns : [
            {
                type           : 'resourceInfo',
                text           : 'Resource',
                field          : 'name',
                width          : 220,
                showEventCount : false,
                showMeta       : record => `<span class="b-capacity">Capacity ${record.capacity}</span>
                                                <span class="b-status ${record.running ? 'b-running' : 'fa fa-exclamation-triangle'}">${record.running ? 'Running' : record.statusMessage || 'Unknown error'}</span>`
            },
            {
                type   : 'percent',
                text   : 'Used capacity',
                field  : 'capacity',
                width  : 140,
                editor : false,
                renderer({ record : resource, grid : scheduler }) {
                    // Calculate allocation
                    const
                        usedCapacity = resource.events.filter(task => scheduler.isInTimeAxis(task)).reduce((total, task) => total += task.orderSize, 0),
                        allocation   = Math.round(usedCapacity / (resource.capacity * DateHelper.getDurationInUnit(scheduler.startDate, scheduler.endDate, 'days')) * 100);

                    return this.defaultRenderer({ value : allocation });
                }
            }
        ],

        // Custom view presets with header configuration
        presets : [
            {
                id          : 'customHourAndDay',
                name        : '1 day',
                base        : 'hourAndDay',
                start       : 5,
                defaultSpan : 18,
                tickWidth   : 45,
                headers     : [
                    {
                        unit       : 'h',
                        dateFormat : 'HH'
                    }
                ]
            }, {
                id              : 'customDayAndWeek',
                name            : '3 days',
                base            : 'dayAndWeek',
                defaultSpan     : 3,
                mainHeaderLevel : 0,
                headers         : [
                    {
                        unit       : 'd',
                        dateFormat : 'MMM Do'
                    }
                ]
            },
            {
                id              : 'customDayAndWeek_shiftWeek',
                name            : '1 week',
                base            : 'dayAndWeek',
                shiftIncrement  : 7,
                shiftUnit       : 'day',
                mainHeaderLevel : 0,
                defaultSpan     : 7,
                headers         : [
                    {
                        unit       : 'd',
                        dateFormat : 'MMM Do'
                    }
                ]
            }
        ],

        // Default viewPreset
        viewPreset : 'customHourAndDay'

    };

    construct(...args) {
        super.construct(...args);

        this.onTimeAxisChange();

        this.on({
            presetchange : this.onPresetChange
        });
    }

    eventRenderer({ eventRecord, renderData }) {
        eventRecord.orderId && renderData.cls.add(`order${eventRecord.orderId}`);

        if (eventRecord.isMilestone) {
            return eventRecord.orderSize;
        }
        // Event contents
        return StringHelper.xss`<div class="eventName">${eventRecord.name}</div><div class="orderinfo">Order #${eventRecord.orderId}, size: ${eventRecord.orderSize}</div>`;
    }

    onTimeAxisChange() {
        this.widgetMap.dateLabel.html = DateHelper.format(this.startDate, 'MMM D YYYY');
    }

    onNextDayClick() {
        this.shiftNext();
    }

    onTodayClick() {
        const startDate = DateHelper.clearTime(new Date());

        this.setTimeSpan(DateHelper.add(startDate, this.startHour, 'h'), DateHelper.add(startDate, this.endHour, 'h'));
    }

    onPreviousDayClick() {
        this.shiftPrevious();
    }

    onPresetChange({ to }) {
        this.features.labels.disabled = to?.id === 'customHourAndDay';
    }

    onMenuButtonClick() {
        this.trigger('toggleOrderList');
    }

    onToggleShowSetup({ checked }) {
        this.features.eventBuffer.disabled = !checked;
    }
}

Schedule.initClass();

//endregion



// Displays tasks for various orders
const schedule = new Schedule({
    ref       : 'schedule',
    appendTo  : 'main',
    startDate : new Date(2021, 3, 6, 5),
    endDate   : new Date(2021, 3, 6, 23),
    flex      : 3,
    project   : {
        autoLoad : true,
        loadUrl  : 'data/data.json'
    },

    onToggleOrderList() {
        orderGrid.hidden = !orderGrid.hidden;
    },

    listeners : {
        eventSelectionChange : ({ selected }) => {
            if (selected[0]?.order) {
                orderGrid.selectedRecord = selected[0].order;
            }
        }
    }
});

const splitter = new Splitter({
    appendTo    : 'main',
    showButtons : 'end'
});

// A grid of orders, both scheduled and unscheduled (the unscheduled orders can be dragged onto the schedule)
const orderGrid = new OrderGrid({
    appendTo    : 'main',
    flex        : 1,
    minWidth    : 320,
    collapsible : true,
    header      : false,
    project     : schedule.project,
    store       : schedule.project.getCrudStore('orders'),
    listeners   : {
        selectionChange : ({ selected }) => {
            if (selected[0]?.firstTask) {
                schedule.selectEvent(selected[0].firstTask);
            }
            else {
                schedule.clearEventSelection();
            }
        }
    }
});

// Handles dragging of unscheduled orders from Orders grid to the Schedule
const drag = new Drag({
    grid         : orderGrid,
    schedule,
    constrain    : false,
    outerElement : orderGrid.element
});
