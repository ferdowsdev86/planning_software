var {
    DateHelper,
    DragHelper,
    DomHelper,
    Toast,
    Tooltip,
    Scheduler,
    SchedulerEventModel,
    Grid,
    StringHelper,
    Splitter
} = window.bryntum.schedulerpro;
//region "lib/Drag.js"

class Drag extends DragHelper {
    static configurable = {
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
    afterConstruct() {
    // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = this.schedule.scrollManager;
    }
    createProxy(element) {
        const proxy = document.createElement('div'),
            {
                schedule
            } = this,
            task = this.grid.getRecordFromElement(element),
            durationInPx = schedule.timeAxisViewModel.getDistanceForDuration(task.rawDurationMS);

        // Fake an event bar
        proxy.classList.add('b-sch-event-wrap', 'b-style-indented', 'b-unassigned-class', 'b-colorize', `b-sch-${schedule.mode}`);
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
                schedule
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
        if (me.tip && context.valid) {
            const dateFormat = schedule.displayDateFormat,
                formattedStartDate = DateHelper.format(startDate, dateFormat),
                formattedEndDate = DateHelper.format(endDate, dateFormat);
            me.tip.html = `
                <div class="b-sch-event-title">${task.name}</div>
                <div class="b-sch-tooltip-start-date">Starts: ${formattedStartDate}</div>
                <div class="b-sch-tooltip-end-date">Ends: ${formattedEndDate}</div>
            `;
            me.tip.showBy(context.element);
        }
        else {
            var _me$tip;
            (_me$tip = me.tip) === null || _me$tip === undefined || _me$tip.hide();
        }
    }

    // Drop callback after a mouse up, take action and transfer the unplanned task to the real SchedulerEventStore (if it's valid)
    onDrop({
        context,
        event
    }) {
        var _me$tip2;
        const me = this,
            {
                schedule
            } = me,
            {
                task,
                target,
                resource,
                valid,
                element,
                startDate
            } = context;
        (_me$tip2 = me.tip) === null || _me$tip2 === undefined || _me$tip2.hide();
        schedule.disableScrollingCloseToEdges(me.schedule.timeAxisSubGrid);

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (valid && target && startDate) {
            const coordinate = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](element),
                // Try resolving event record from target element, to determine if drop was on another event
                targetEventRecord = schedule.resolveEventRecord(target),
                resources = resource.isLeaf ? [resource] : resource.children;
            task.startDate = startDate;
            schedule.eventStore.assignEventToResource(task, resources);

            // Dropped on a scheduled event, display toast
            if (targetEventRecord) {
                Toast.show(`Dropped on ${targetEventRecord.name}`);
            }
        }
        schedule.features.eventTooltip.disabled = false;
    }
    set schedule(schedule) {
        this._schedule = schedule;

        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = schedule.scrollManager;
    }
    get schedule() {
        return this._schedule;
    }
    onAbort() {
        var _this$tip;
        (_this$tip = this.tip) === null || _this$tip === undefined || _this$tip.hide();
    }
}

//endregion

//region "lib/Schedule.js"

class Schedule extends Scheduler {
    /**
   * Original class name getter. See Widget.$name docs for the details.
   * @returns {string}
   */
    static $name = 'Schedule';

    // Factoryable type name
    static type = 'schedule';
    static configurable = {
        subGridConfigs : {
            locked : {
                width : 300
            },
            normal : {
                flex : 1
            }
        },
        features : {
            tree : true
        },
        resourceImages : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        },
        rowHeight  : 50,
        barMargin  : 4,
        eventStyle : 'indented',
        eventColor : 'indigo',
        tickSize   : 120,
        //allowOverlap : false,

        columns : [{
            type  : 'resourceinfo',
            tree  : true,
            field : 'name',
            text  : 'Name',
            flex  : 1
        }, {
            text     : 'Tasks',
            editor   : false,
            width    : 75,
            renderer : ({
                record
            }) => record.events.length || '',
            align    : 'center',
            sortable : (a, b) => a.events.length < b.events.length ? -1 : 1
        }],
        // View preset which configures the time axis header
        viewPreset : 'dayAndWeek'
    };
    onEventDrop({
        eventRecords,
        targetResourceRecord
    }) {
    // When dropping on a parent row, assign to all team members
        if (targetResourceRecord.isParent) {
            this.eventStore.assignEventToResource(eventRecords[0], targetResourceRecord.children, true);
        }
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

//region "lib/UnplannedGrid.js"

class UnplannedGrid extends Grid {
    /**
   * Original class name getter. See Widget.$name docs for the details.
   * @returns {string}
   */
    static $name = 'UnplannedGrid';

    // Factoryable type name
    static type = 'unplannedgrid';
    static configurable = {
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
            width : 90
        }],
        rowHeight : 50
    };
}

// Register this widget type with its Factory
UnplannedGrid.initClass();

//endregion

const schedule = new Schedule({
    ref         : 'schedule',
    insertFirst : 'main',
    // Enables smoother wheel and pinch zooming
    smoothZoom  : true,
    startDate   : new Date(2023, 4, 8),
    endDate     : new Date(2023, 4, 22),
    flex        : 4,
    crudManager : {
        autoLoad   : true,
        eventStore : {
            // Do not remove event when unassigning, we want to add it to grid instead
            removeUnassignedEvent : false
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true,
        loadUrl          : 'data/data.json'
    },
    tbar : ['Schedule view', '->', {
        type : 'button',
        text : 'Unassign all events',
        onClick() {
            schedule.assignmentStore.removeAll();
        }
    }]
});
new Splitter({
    appendTo    : 'main',
    showButtons : 'end'
});
const unplannedGrid = new UnplannedGrid({
    ref                        : 'unplanned',
    appendTo                   : 'main',
    title                      : 'Unplanned Tasks',
    collapsible                : true,
    flex                       : '0 0 300px',
    ui                         : 'toolbar',
    store                      : schedule.eventStore.chain(event => event.resources.length === 0),
    // We are holding ResourceModels
    disableGridRowModelWarning : true
});
const drag = new Drag({
    grid         : unplannedGrid,
    schedule,
    constrain    : false,
    outerElement : unplannedGrid.element
});