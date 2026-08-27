import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import DragHelper from '../../../lib/Core/helper/DragHelper.js';
import DomHelper from '../../../lib/Core/helper/DomHelper.js';
import Toast from '../../../lib/Core/widget/Toast.js';
import Tooltip from '../../../lib/Core/widget/Tooltip.js';

export default class Drag extends DragHelper {
    static configurable = {
        callOnFunctions      : true,
        // Don't drag the actual row element, clone it
        cloneTarget          : true,
        // We size the cloned element manually
        autoSizeClonedTarget : false,
        // Only allow drops on the schedule area
        dropTargetSelector   : '#main',
        // Only allow drag of row elements inside on the unplanned grid
        targetSelector       : '.b-sch-event-wrap'
    };

    afterConstruct() {
        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(element) {
        const
            proxy        = element.cloneNode(true),
            { schedule } = this,
            task         = this.grid.getRecordFromElement(element),
            durationInPx = schedule.timeAxisViewModel.getDistanceForDuration(task.rawDurationMS);

        // Fake an event bar
        proxy.classList.add('b-color-green', 'b-unassigned-class', `b-sch-${schedule.mode}`);

        if (schedule.isHorizontal) {
            proxy.style.height = `${schedule.rowHeight - (2 * schedule.resourceMargin)}px`;
            proxy.style.width  = `${durationInPx}px`;
        }
        else {
            proxy.style.height = `${durationInPx}px`;
            proxy.style.width  = `${schedule.resourceColumnWidth}px`;
        }

        return proxy;
    }

    onDragStart({ context }) {
        const
            me                          = this,
            { schedule }                = me,
            { eventTooltip, eventDrag } = schedule.features;

        // save a reference to the task so we can access it later
        context.task = me.grid.getRecordFromElement(context.grabbed);

        // Prevent tooltips from showing while dragging
        eventTooltip.disabled = true;

        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        if (eventDrag.showTooltip && !me.tip) {
            me.tip = new Tooltip({
                align       : 'b-t',
                rootElement : document.body,
                forElement  : context.element,
                cls         : 'b-popup b-sch-event-tooltip'
            });
        }
    }

    onDrag({ event, context }) {
        const
            me                                = this,
            { schedule }                      = me,
            { task, target, enteredSchedule } = context,
            isOverSchedule                    = target?.closest('.b-time-axis-sub-grid');

        let valid = !enteredSchedule;

        if (isOverSchedule) {
            const
                coordinate = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
                startDate  = schedule.getDateFromCoordinate(coordinate, 'round', false, true),
                endDate    = startDate && DateHelper.add(startDate, task.duration, task.durationUnit),
                // Coordinates required when used in vertical mode, since it does not use actual columns
                resource   = target && schedule.resolveResourceRecord(target, [event.offsetX, event.offsetY]);

            context.enteredSchedule = true;

            // Don't allow drops anywhere, only allow drops if the drop is on the timeaxis and on top of a Resource
            valid = (Boolean(startDate && resource) &&
                (schedule.allowOverlap || schedule.isDateRangeAvailable(startDate, endDate, null, resource)));

            // Save reference to resource so we can use it in onTaskDrop
            context.resource  = resource;
            context.startDate = startDate;

            if (me.tip) {
                const
                    dateFormat         = schedule.displayDateFormat,
                    formattedStartDate = DateHelper.format(startDate, dateFormat),
                    formattedEndDate   = DateHelper.format(endDate, dateFormat);

                me.tip.html = `
                <div class="b-sch-event-title">${task.name}</div>
                <div class="b-sch-tooltip-start-date">Starts: ${formattedStartDate}</div>
                <div class="b-sch-tooltip-end-date">Ends: ${formattedEndDate}</div>
            `;
                me.tip.showBy(context.element);
            }
        }
        else {
            me.tip?.hide();
        }
        context.valid = valid;
    }

    // Drop callback after a mouse up, take action and transfer the unplanned task to the real SchedulerEventStore (if it's valid)
    onDrop({ context, event }) {
        const
            me                                                    = this,
            { schedule }                                          = me,
            { task, target, resource, valid, element, startDate } = context;

        me.tip?.hide();

        schedule.disableScrollingCloseToEdges(me.schedule.timeAxisSubGrid);

        context.valid = valid && target && startDate;

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (context.valid) {
            const
                coordinate        = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](element),
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

        if (resource) {
            resource.cls = '';
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
        this.tip?.hide();
    }
}
