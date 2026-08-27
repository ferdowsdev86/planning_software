var {
    DateHelper,
    DragHelper,
    DomHelper,
    Toast,
    Tooltip,
    Combo,
    Scheduler,
    SchedulerEventModel,
    SchedulerEventStore,
    Grid,
    StringHelper,
    Splitter
} = window.bryntum.schedulerpro;
//region "lib/Drag.js"

class Drag extends DragHelper {
    static get configurable() {
        return {
            // A reference to the outside Scheduler instance
            schedule             : null,
            callOnFunctions      : true,
            // Don't drag the actual row element, clone it
            cloneTarget          : true,
            // We size the cloned element manually
            autoSizeClonedTarget : false,
            // Only allow drops on the schedule area
            dropTargetSelector   : '.b-timeline-sub-grid',
            // Only allow drag of row elements inside on the unplanned grid
            targetSelector       : '.b-grid-row:not(.b-group-row)'
        };
    }
    createProxy(element) {
        const proxy = document.createElement('div'),
            {
                schedule
            } = this,
            task = this.grid.getRecordFromElement(element),
            durationInPx = schedule.timeAxisViewModel.getDistanceForDuration(task.rawDurationMS);

        // Fake an event bar
        proxy.classList.add('b-sch-event-wrap', 'b-style-tonal', 'b-unassigned-class', `b-sch-${schedule.mode}`, 'b-colorize');
        proxy.innerHTML = `<div class="b-sch-event b-has-content b-sch-event-with-icon">
            <div class="b-sch-event-content">
                <i class="${task.iconCls}"></i> ${task.name}
            </div>
        </div>`;
        if (schedule.isHorizontal) {
            proxy.style.height = `${schedule.rowHeight - 2 * schedule.resourceMargin}px`;
            proxy.style.width = `${durationInPx}px`;
        }
        else {
            proxy.style.height = `${durationInPx}px`;
            proxy.style.width = `${schedule.resourceColumnWidth}px`;
        }
        return proxy;
    }
    onDragStart({
        context
    }) {
        const me = this,
            {
                schedule
            } = me,
            {
                eventTooltip,
                eventDrag
            } = schedule.features;

        // save a reference to the task so we can access it later
        context.task = me.grid.getRecordFromElement(context.grabbed);

        // Prevent tooltips from showing while dragging
        eventTooltip.disabled = true;
        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);
        if (eventDrag.showTooltip && !me.tip) {
            me.tip = new Tooltip({
                align      : 'b-t',
                forElement : context.element,
                cls        : 'b-popup b-sch-event-tooltip'
            });
        }
    }
    onDrag({
        event,
        context
    }) {
        const me = this,
            {
                schedule,
                tip
            } = me,
            {
                task
            } = context,
            coordinate = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
            startDate = schedule.getDateFromCoordinate(coordinate, 'round', false, true),
            endDate = startDate && DateHelper.add(startDate, task.duration, task.durationUnit),
            // Coordinates required when used in vertical mode, since it does not use actual columns
            resource = context.target && schedule.resolveResourceRecord(context.target, [event.offsetX, event.offsetY]);

        // Don't allow drops anywhere, only allow drops if the drop is on the timeaxis and on top of a Resource
        context.valid = Boolean(startDate && resource) && (schedule.allowOverlap || schedule.isDateRangeAvailable(startDate, endDate, null, resource));

        // Save reference to resource so we can use it in onTaskDrop
        context.resource = resource;
        context.startDate = startDate;
        if (tip && context.valid) {
            const dateFormat = schedule.displayDateFormat,
                formattedStartDate = DateHelper.format(startDate, dateFormat),
                formattedEndDate = DateHelper.format(endDate, dateFormat);
            tip.html = `
                <div class="b-sch-event-title">${task.name}</div>
                <div class="b-sch-tooltip-start-date">Starts: ${formattedStartDate}</div>
                <div class="b-sch-tooltip-end-date">Ends: ${formattedEndDate}</div>
            `;
            tip.showBy(context.element);
        }
        else {
            tip === null || tip === undefined || tip.hide();
        }
    }

    // Drop callback after a mouse up, take action and transfer the unplanned task to the real SchedulerEventStore (if it's valid)
    onDrop({
        context
    }) {
        var _me$tip;
        const me = this,
            {
                schedule
            } = me,
            {
                task,
                target,
                resource,
                valid,
                startDate
            } = context;
        (_me$tip = me.tip) === null || _me$tip === undefined || _me$tip.hide();
        schedule.disableScrollingCloseToEdges(me.schedule.timeAxisSubGrid);

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (valid && target && startDate) {
            const
                // Try resolving event record from target element, to determine if drop was on another event
                targetEventRecord = schedule.resolveEventRecord(target);

            // Remove from grid first so that the data change
            // below does not fire events into the grid.
            me.grid.store.remove(task);
            task.startDate = startDate;
            task.assign(resource);
            schedule.eventStore.add(task);

            // Dropped on a scheduled event, display toast
            if (targetEventRecord) {
                Toast.show(`Dropped on ${targetEventRecord.name}`);
            }
        }
        schedule.features.eventTooltip.disabled = false;
    }
    updateSchedule(schedule) {
    // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = schedule.scrollManager;
    }
    onAbort() {
        var _this$tip;
        (_this$tip = this.tip) === null || _this$tip === undefined || _this$tip.hide();
    }
}

//endregion

//region "lib/IconCombo.js"

// Custom combo containing icons to pick from
class IconCombo extends Combo {
    static type = 'iconcombo';
    static configurable = {
        items : [{
            value : 'fa fa-asterisk',
            text  : 'Asterisk'
        }, {
            value : 'fa fa-fw fa-beer',
            text  : 'Beer'
        }, {
            value : 'fa fa-fw fa-book',
            text  : 'Book'
        }, {
            value : 'fa fa-fw fa-bug',
            text  : 'Bug'
        }, {
            value : 'fa fa-building',
            text  : 'Building'
        }, {
            value : 'fa fa-coffee',
            text  : 'Coffee'
        }, {
            value : 'fa fa-fw fa-cog',
            text  : 'Cog'
        }, {
            value : 'fa fa-fw fa-dumbbell',
            text  : 'Dumbbell'
        }, {
            value : 'fa fa-laptop',
            text  : 'Laptop'
        }, {
            value : 'fa fa-fw fa-plane',
            text  : 'Plane'
        }, {
            value : 'fa fa-fw fa-phone',
            text  : 'Phone'
        }, {
            value : 'fa fa-fw fa-question',
            text  : 'Question'
        }, {
            value : 'fa fa-fw fa-life-ring',
            text  : 'Ring'
        }, {
            value : 'fa fa-sync',
            text  : 'Sync'
        }, {
            value : 'fa fa-user',
            text  : 'User'
        }, {
            value : 'fa fa-users',
            text  : 'Users'
        }, {
            value : 'fa fa-video',
            text  : 'Video'
        }],
        listItemTpl : item => `<i class="${item.value}" style="margin-right: .5em"></i>${item.text}`
    };
    syncInputFieldValue(...args) {
        this.icon.className = this.value;
        super.syncInputFieldValue(...args);
    }
    get innerElements() {
        return [{
            reference : 'icon',
            tag       : 'i',
            className : 'fa fa-cog',
            style     : {
                marginLeft  : '.8em',
                marginRight : '-.3em'
            }
        }, ...super.innerElements];
    }
}

// Register class to be able to create widget by type
IconCombo.initClass();

//endregion

//region "lib/Schedule.js"

class Schedule extends Scheduler {
    // Original class name getter. See Widget.$name docs for the details.
    static $name = 'Schedule';

    // Factoryable type name
    static type = 'schedule';
    static configurable = {
    // Custom property for this demo, set to true to reschedule any conflicting tasks automatically
        autoRescheduleTasks : false,
        subGridConfigs      : {
            locked : {
                width : 300
            },
            normal : {
                flex : 1
            }
        },
        features : {
            stripe     : true,
            timeRanges : true,
            eventMenu  : {
                items : {
                    // Custom item with inline handler
                    unassign : {
                        text   : 'Unassign',
                        icon   : 'fa fa-user-times',
                        weight : 200,
                        onItem : ({
                            eventRecord
                        }) => eventRecord.unassign()
                    }
                }
            },
            eventEdit : {
                items : {
                    nameField : {
                        required : true
                    },
                    // Custom field for picking icon
                    iconCls : {
                        type   : 'iconcombo',
                        // Name should match a record field, to read and write value from that field
                        name   : 'iconCls',
                        label  : 'Icon',
                        weight : 200
                    }
                }
            }
        },
        rowHeight  : 50,
        barMargin  : 4,
        eventColor : 'indigo',
        //allowOverlap : false,

        columns : [{
            type           : 'resourceInfo',
            text           : 'Name',
            flex           : 1,
            showEventCount : false,
            showRole       : true
        }, {
            text     : 'Tasks',
            editor   : false,
            width    : 100,
            renderer : data => `${data.record.events.length || ''}`,
            align    : 'center',
            sortable : (a, b) => a.events.length < b.events.length ? -1 : 1
        }],
        // Custom view preset with header configuration
        viewPreset : {
            base           : 'hourAndDay',
            columnLinesFor : 0,
            headers        : [{
                unit       : 'd',
                align      : 'center',
                dateFormat : 'ddd DD MMM'
            }, {
                unit       : 'h',
                align      : 'center',
                dateFormat : 'HH'
            }]
        },
        // Only used in vertical mode
        resourceColumns : {
            columnWidth : 120
        },
        // Do not remove event when unassigning, we want to add it to grid instead
        removeUnassignedEvent : false,
        resourceImages        : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        }
    };
    updateAutoRescheduleTasks(autoRescheduleTasks) {
        this.eventStore.autoRescheduleTasks = autoRescheduleTasks;
    }
}
Schedule.initClass();

//endregion

//region "lib/Task.js"

class Task extends SchedulerEventModel {
    static $name = 'Task';
    static get defaults() {
        return {
            // In this demo, default duration for tasks will be hours (instead of days)
            durationUnit : 'h',
            // Use a default name, for better look in the grid if unassigning a new event
            name         : 'New event',
            // Use a default icon also
            iconCls      : 'fa fa-asterisk'
        };
    }
}

//endregion

//region "lib/TaskStore.js"

class TaskStore extends SchedulerEventStore {
    static $name = 'TaskStore';
    static type = 'schedulingstore';
    static configurable = {
        modelClass : Task
    };

    // Override add to reschedule any overlapping events caused by the add
    add(records, silent = false) {
        const me = this;
        if (me.autoRescheduleTasks) {
            // Flag to avoid rescheduling during rescheduling
            me.isRescheduling = true;
            me.beginBatch();
        }
        if (!Array.isArray(records)) {
            records = [records];
        }
        const result = super.add(records, silent);
        if (me.autoRescheduleTasks) {
            me.endBatch();
            me.isRescheduling = false;
        }
        return result;
    }

    // Auto called when triggering the update event.
    // Reschedule if the update caused the event to overlap any others.
    onUpdate({
        record
    }) {
        if (this.autoRescheduleTasks && !this.isRescheduling) {
            this.rescheduleOverlappingTasks(record);
        }
    }
    rescheduleOverlappingTasks(eventRecord) {
        if (eventRecord.resource) {
            const futureEvents = [],
                earlierEvents = [];

            // Split tasks into future and earlier tasks
            eventRecord.resource.events.forEach(event => {
                if (event !== eventRecord) {
                    if (event.startDate >= eventRecord.startDate) {
                        futureEvents.push(event);
                    }
                    else {
                        earlierEvents.push(event);
                    }
                }
            });
            if (futureEvents.length || earlierEvents.length) {
                futureEvents.sort((a, b) => a.startDate > b.startDate ? 1 : -1);
                earlierEvents.sort((a, b) => a.startDate > b.startDate ? -1 : 1);
                futureEvents.forEach((ev, i) => {
                    const prev = futureEvents[i - 1] || eventRecord;
                    ev.startDate = DateHelper.max(prev.endDate, ev.startDate);
                });

                // Walk backwards and remove any overlap
                [eventRecord, ...earlierEvents].forEach((ev, i, all) => {
                    const prev = all[i - 1];
                    if (ev.endDate > Date.now() && ev !== eventRecord && prev) {
                        ev.setEndDate(DateHelper.min(prev.startDate, ev.endDate), true);
                    }
                });
                this.isRescheduling = false;
            }
        }
    }
}

// Register type with its Factory
TaskStore.initClass();

//endregion

//region "lib/UnplannedGrid.js"

class UnplannedGrid extends Grid {
    /**
   * Original class name getter. See Widget.$name docs for the details.
   * @returns {string}
   */
    static $name = 'UnplannedGrid';

    // Factoryable type name
    static type = 'unplannedgrid';
    static get configurable() {
        return {
            features : {
                stripe : true,
                sort   : 'name'
            },
            columns : [{
                text       : 'Tasks',
                flex       : 1,
                field      : 'name',
                htmlEncode : false,
                minWidth   : 200,
                renderer   : data => StringHelper.xss`<i class="${data.record.iconCls}"></i>${data.record.name}`
            }, {
                type  : 'duration',
                text  : 'Duration',
                width : 90,
                align : 'right'
            }],
            rowHeight : 50
        };
    }
}

// Register this widget type with its Factory
UnplannedGrid.initClass();

//endregion

let schedule = new Schedule({
    ref         : 'schedule',
    insertFirst : 'main',
    // Enables smoother wheel and pinch zooming
    smoothZoom  : true,
    startDate   : new Date(2025, 11, 1, 8),
    endDate     : new Date(2025, 11, 1, 18),
    flex        : 4,
    crudManager : {
        autoLoad   : true,
        eventStore : {
            type : 'schedulingstore'
        },
        loadUrl : 'data/data.json'
    },
    tbar : ['Schedule view', '->', {
        type : 'viewpresetcombo'
    }, {
        type    : 'slidetoggle',
        text    : 'Automatic rescheduling',
        tooltip : 'Toggles whether to automatically reschedule overlapping tasks',
        cls     : 'reschedule-button',
        onChange({
            checked
        }) {
            schedule.autoRescheduleTasks = checked;
        }
    }, {
        type        : 'buttonGroup',
        rendition   : 'padded',
        toggleGroup : true,
        items       : [{
            icon            : 'fa fa-fw fa-arrows-alt-v',
            pressed         : 'up.isVertical',
            tooltip         : 'Vertical mode',
            schedulerConfig : {
                mode           : 'vertical',
                subGridConfigs : {
                    locked : {
                        width    : 100,
                        minWidth : 100,
                        flex     : null
                    }
                }
            }
        }, {
            icon            : 'fa fa-fw fa-arrows-alt-h',
            pressed         : 'up.isHorizontal',
            tooltip         : 'Horizontal mode',
            schedulerConfig : {
                mode           : 'horizontal',
                subGridConfigs : {}
            }
        }],
        onAction({
            source: button
        }) {
            const newConfig = {
                ...schedule.initialConfig,
                ...button.schedulerConfig
            };

            // Recreate the scheduler to switch orientation
            schedule.destroy();
            schedule = new Schedule(newConfig);

            // Provide drag helper a reference to the new instance
            drag.schedule = schedule;
        }
    }]
});
new Splitter({
    appendTo    : 'main',
    showButtons : 'end'
});
const unplannedGrid = new UnplannedGrid({
    ref         : 'unplanned',
    appendTo    : 'main',
    title       : 'Unplanned Tasks',
    collapsible : true,
    flex        : '0 0 300px',
    ui          : 'toolbar',
    // Schedulers stores are contained by a project, pass it to the grid to allow it to access them
    project     : schedule.project,
    store       : {
        modelClass : Task,
        readUrl    : 'data/unplanned.json',
        autoLoad   : true
    }
});
const drag = new Drag({
    grid         : unplannedGrid,
    schedule,
    constrain    : false,
    outerElement : unplannedGrid.element
});
schedule.assignmentStore.on({
    // When a task is unassigned move it back to the unplanned tasks grid
    remove({
        records
    }) {
        records.forEach(({
            event
        }) => {
            schedule.eventStore.remove(event);
            unplannedGrid.store.add(event);
        });
    },
    thisObj : undefined
});