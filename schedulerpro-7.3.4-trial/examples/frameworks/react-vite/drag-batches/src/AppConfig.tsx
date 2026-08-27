import {
    ButtonListenersTypes, DateColumn, DateHelper, DomClassList, Model, PercentColumn, SchedulerPro, Store, StringHelper, ViewPreset, Widget
} from '@bryntum/schedulerpro';
import { BryntumGridBaseProps, BryntumSchedulerProProjectModelProps, BryntumSchedulerProProps } from '@bryntum/schedulerpro-react';
import { Machine } from './lib/Machine.js';
import { Order } from './lib/Order.js';
import { Task } from './lib/Task.js';

class ComboPreset extends Model {
    declare value: number;
    declare preset: ViewPreset;
}

const getSchedulerPro = (widget: Widget): SchedulerPro => (widget.up(SchedulerPro.type) as SchedulerPro);

export const projectProps: BryntumSchedulerProProjectModelProps = {
    autoLoad   : true,
    loadUrl    : 'data/data.json',
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

// scheduler configuration
export const schedulerProProps = (
    onToggleOrderList: Function
): BryntumSchedulerProProps => {
    return ({
        // Enables smoother wheel and pinch zooming
        smoothZoom            : true,
        startDate             : new Date(2025, 3, 6, 5),
        endDate               : new Date(2025, 3, 6, 23),
        flex                  : 3,
        tickSize              : 30,
        allowOverlap          : false,
        eventColor            : 'blue',
        snap                  : true,
        rowHeight             : 80,
        barMargin             : 14,
        highlightPredecessors : true,
        highlightSuccessors   : true,
        autoCreate            : false,
        milestoneTextPosition : 'inside',

        eventBufferFeature : true,

        eventDragCreateFeature : false,

        eventDragFeature : {
            snapToResource : true
        },

        labelsFeature : {
            disabled : true,
            // using field as label (will first look in event and then in resource)
            right    : {
                renderer : ({ eventRecord }: { eventRecord: Task }) => StringHelper.xss`${eventRecord.name} (order #${eventRecord.orderId})`
            }
        },

        eventMenuFeature : {
            items : {
                deleteEvent : {
                    text : 'Delete task'
                },
                unassignEvent : false
            }
        },

        taskEditFeature : {
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
                        durationField : {
                            flex : '1 0 100%'
                        },
                        endDateField     : false,
                        percentDoneField : false
                    }
                }
            }
        },

        // Scheduler top toolbar
        tbar : [
            {
                type      : 'button',
                rendition : 'text',
                icon      : 'fa fa-caret-left',
                onAction  : ({ source }) => getSchedulerPro(source).shiftPrevious()
            },
            {
                type     : 'button',
                text     : 'Today',
                onAction : async({ source }) => {
                    const
                        startDate     = DateHelper.clearTime(new Date()),
                        scheduler     = getSchedulerPro(source),
                        { extraData } = scheduler as any;
                    await scheduler.setTimeSpan(
                        DateHelper.add(startDate, extraData.startHour, 'h'),
                        DateHelper.add(startDate, extraData.endHour, 'h')
                    );
                }
            },
            {
                type      : 'button',
                rendition : 'text',
                icon      : 'fa fa-caret-right',
                onAction  : ({ source }) => getSchedulerPro(source).shiftNext()
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
                onChange : ({ source, checked }) => {
                    getSchedulerPro(source).features.eventBuffer.disabled = !checked;
                }
            },
            {
                type         : 'combo',
                ref          : 'preset',
                editable     : false,
                value        : 1,
                valueField   : 'value',
                displayField : 'name',
                width        : '7em',
                items        : [
                    {
                        name   : '1 day',
                        value  : 1,
                        preset : {
                            base      : 'hourAndDay',
                            tickWidth : 45,
                            headers   : [
                                {
                                    unit       : 'h',
                                    align      : 'center',
                                    dateFormat : 'HH'
                                }
                            ]
                        }
                    },
                    {
                        name   : '3 days',
                        value  : 3,
                        preset : {
                            base    : 'dayAndWeek',
                            headers : [
                                {
                                    unit       : 'd',
                                    align      : 'center',
                                    dateFormat : 'MMM Do'
                                }
                            ]
                        }
                    },
                    {
                        name   : '1 week',
                        value  : 7,
                        preset : {
                            base    : 'dayAndWeek',
                            headers : [
                                {
                                    unit       : 'd',
                                    align      : 'center',
                                    dateFormat : 'MMM Do'
                                }
                            ]
                        }
                    }
                ],
                onSelect : ({ source, record }) => {
                    const
                        scheduler     = getSchedulerPro(source),
                        { extraData } = scheduler as any,
                        preset        = record as ComboPreset,
                        { value }     = preset,
                        startDate     = DateHelper.add(DateHelper.clearTime(scheduler.startDate), extraData.startHour, 'h'),
                        endDate       = DateHelper.add(startDate, value - 1, 'd');

                    endDate.setHours(extraData.endHour);

                    scheduler.features.labels.disabled = value <= 1;
                    scheduler.viewPreset               = preset.preset;
                    scheduler.setTimeSpan(startDate, endDate);
                    // reset scroll
                    scheduler.scrollLeft = 0;
                }
            },
            {
                type      : 'button',
                rendition : 'text',
                icon      : 'b-icon b-icon-menu',
                onAction  : () => onToggleOrderList()
            }

        ],

        columns : [
            {
                type           : 'resourceInfo',
                text           : 'Resource',
                field          : 'name',
                width          : 200,
                showEventCount : false,
                showMeta       : record => {
                    const
                        machine = record as Machine,
                        cls     = machine.running ? 'b-running' : 'fa fa-exclamation-triangle',
                        message = machine.running ? 'Running' : machine.statusMessage || 'Unknown error';
                    return `<span class="b-capacity">Capacity ${machine.capacity}</span>` +
                        `<span class="b-status ${cls}">${message}</span>`;
                }
            },
            {
                type   : 'percent',
                text   : 'Used capacity',
                field  : 'capacity',
                width  : 130,
                editor : false,
                renderer({ record, grid, column }) {
                    // Calculate allocation
                    const
                        machine      = record as Machine,
                        scheduler    = grid as SchedulerPro,
                        usedCapacity = machine.events.filter(task => scheduler.isInTimeAxis(task)).reduce((total, task) => total += (task as Task).orderSize, 0),
                        allocation   = Math.round(usedCapacity / (machine.capacity * DateHelper.getDurationInUnit(scheduler.startDate, scheduler.endDate, 'days')) * 100);

                    return (column as PercentColumn).defaultRenderer({ value : allocation });
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
        viewPreset : 'customHourAndDay',

        eventRenderer({ eventRecord, renderData }): string {
            const task = eventRecord as Task;
            (renderData.cls as DomClassList).add(`order${task.orderId}`);

            if (eventRecord.isMilestone) {
                return String(task.orderSize);
            }
            // Event contents
            return StringHelper.xss`<div class="eventName">${eventRecord.name}</div><div class="orderinfo">Order #${task.orderId}, size: ${task.orderSize}</div>`;
        },

        // React wrapper accepts unknown properties via extraData
        extraData : {
            startHour : 5,
            endHour   : 23
        }
    });
};

// Orders grid configuration
export const gridProps = (
    onAddClick: ButtonListenersTypes['click']
): BryntumGridBaseProps => ({
    flex      : 1,
    minWidth  : 280,
    cls       : 'b-order-grid', // only for testing
    extraData : {
        updateOrderDates() {
            this.refreshColumn(this.columns.getAt(1));
            this.refreshColumn(this.columns.getAt(2));
        }
    },
    rowHeight : 60,
    readOnly  : true,

    stripeFeature : true,

    cellTooltipFeature : {
        hoverDelay      : 300,
        textContent     : true,
        tooltipRenderer : ({ record }) => {
            const order = record as Order;
            return order.isScheduled
                ? StringHelper.xss`<h4>Type: ${order.templateName}</h4>This order is scheduled to finish by <b>${DateHelper.format(order.finishDate, 'MMM d HH:mm')}</b>`
                : StringHelper.xss`<h4>Type: ${order.templateName}</h4>Try dragging this order onto the schedule`
            ;
        }
    },

    // Grid top toolbar
    tbar : [
        {
            type       : 'button',
            text       : 'Add order',
            icon       : 'fa fa-plus',
            toggleable : true,
            onAction   : onAddClick
        },
        '->',
        {
            type       : 'button',
            text       : 'Hide scheduled',
            toggleable : true,
            onToggle   : async({ source, pressed }) => {
                const store = source.up('grid').store as Store;
                if (pressed) {
                    await store.filter({
                        property : 'isScheduled',
                        operator : '=',
                        value    : false
                    });
                }
                else {
                    await store.clearFilters();
                }
            }
        }
    ],

    columns : [{
        type       : 'template',
        text       : 'Order List',
        flex       : 1,
        minWidth   : 200,
        field      : 'name',
        htmlEncode : false,
        cellCls    : 'order-cell',
        template   : ({ record }) => {
            const order = record as Order;
            return StringHelper.xss`<div>${'#' + order.id} ${order.name}</div>
                <div class="customer">Customer: ${order.customer}, size: ${order.size}</div>`;
        }
    }, {
        text   : 'Start',
        type   : 'date',
        align  : 'right',
        format : 'MMM D HH:mm',
        field  : 'firstTask.startDate',
        renderer({ value, record, row, column }) {
            if (!value) {
                return '';
            }
            const order = record as Order;
            if (order.isScheduled) {
                row.addCls('scheduled');
            }
            return DateHelper.format(value as Date, (column as DateColumn).format!);
        }
    }, {
        text   : 'Finish',
        type   : 'date',
        align  : 'right',
        format : 'MMM D HH:mm',
        editor : false,
        field  : 'lastTask.endDate'
    }],

    disableGridRowModelWarning : true
});
