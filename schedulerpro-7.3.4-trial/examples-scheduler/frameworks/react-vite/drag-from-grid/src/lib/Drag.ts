import {
    DateHelper, DomHelper, DragHelper, type DragHelperConfig, type DragHelperListenersTypes, Grid, Scheduler, ScrollManager, Toast, Tooltip
} from '@bryntum/schedulerpro';
import { Task } from './Task';
import { TaskStore } from './TaskStore';

type DragConfig = DragHelperConfig & {
    grid: Grid
    schedule: Scheduler
    outerElement: HTMLElement
};

export class Drag extends DragHelper {
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

    public scrollManager!: ScrollManager;
    public grid: Grid;
    public outerElement: HTMLElement;

    private tip: Tooltip | undefined;
    private _schedule!: Scheduler;

    // We need this construction for TypeScript
    // Also, we cannot use `me` as variable for `this`
    constructor(config: DragConfig) {
        super(config);
        this.grid         = config.grid;
        this.schedule     = config.schedule;
        this.outerElement = config.outerElement;
    }

    afterConstruct(): void {
        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = this.schedule.scrollManager as ScrollManager;
    }

    createProxy(element: HTMLElement): HTMLDivElement {
        const
            proxy        = document.createElement('div'),
            { schedule } = this,
            task         = this.grid.getRecordFromElement(element) as Task,
            durationInPx = schedule.timeAxisViewModel.getDistanceForDuration(task.getDurationMS());

        // Fake an event bar
        proxy.classList.add(
            'b-sch-event-wrap',
            'b-sch-event',
            'b-unassigned-class',
            `b-sch-${schedule.mode}`,
            'b-style-tonal'
        );
        proxy.innerHTML = `<div class="b-sch-event b-has-content b-sch-event-with-icon">
            <div class="b-sch-event-content">
                <i class="${task.get('iconCls')}"></i> ${task.get('name')}
            </div>
        </div>`;

        if (schedule.mode === 'horizontal') {
            proxy.style.height = `${schedule.rowHeight - 2 * (schedule.resourceMargin as number)}px`;
            proxy.style.width  = `${durationInPx}px`;
        }
        else {
            proxy.style.height = `${durationInPx}px`;
            proxy.style.width  = `${schedule.resourceColumnWidth}px`;
        }

        return proxy;
    }

    onDragStart: DragHelperListenersTypes['dragStart'] = ({ context }) => {
        const
            { schedule, tip, grid }           = this,
            { eventTooltip, eventDrag } = schedule.features;

        // save a reference to the task so we can access it later
        (context as any).task = grid.getRecordFromElement(context.grabbed);

        // Prevent tooltips from showing while dragging
        eventTooltip.disabled = true;

        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        if (eventDrag.showTooltip && !tip) {
            this.tip = new Tooltip({
                align      : 'b-t',
                forElement : context.element,
                cls        : 'b-popup b-sch-event-tooltip'
            });
        }
    };

    onDrag: DragHelperListenersTypes['drag'] = ({ context, event }) => {
        const
            { schedule, tip } = this,
            { task }          = context as any,
            coordinate        = DomHelper[`getTranslate${schedule.mode === 'horizontal' ? 'X' : 'Y'}`](context.element),
            startDate         = schedule.getDateFromCoordinate(coordinate, 'round', false, true),
            endDate           = startDate && DateHelper.add(startDate, task.duration, task.durationUnit),
            // Coordinates required when used in vertical mode, since it does not use actual columns
            resource          = context.target && schedule.resolveResourceRecord(context.target, [event.offsetX, event.offsetY]);

        // Don't allow drops anywhere, only allow drops if the drop is on the timeaxis and on top of a Resource
        context.valid = Boolean(startDate && resource) &&
            (schedule.allowOverlap || schedule.isDateRangeAvailable(startDate, endDate, null, resource));

        // Save reference to resource, so we can use it in onTaskDrop
        (context as any).resource = resource;

        if (tip && context.valid) {
            const
                dateFormat         = schedule.displayDateFormat,
                formattedStartDate = DateHelper.format(startDate, dateFormat),
                formattedEndDate   = DateHelper.format(endDate, dateFormat);

            tip.html = `
                <div class="b-sch-event-title">${task.name}</div>
                <div class="b-sch-tooltip-start-date">Starts: ${formattedStartDate}</div>
                <div class="b-sch-tooltip-end-date">Ends: ${formattedEndDate}</div>
            `;
            tip.showBy(context.element);
        }
        else if (tip) {
            tip.hide();
        }
    };

    // Drop callback after a mouse up, take action and transfer the unplanned task to the real SchedulerEventStore (if it's valid)
    onDrop: DragHelperListenersTypes['drop'] = ({ context }) => {
        const
            { schedule, tip, grid }    = this,
            { target, valid, element } = context,
            { task, resource }         = context as any;

        tip?.hide();

        schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (valid && target) {
            const
                coordinate        = DomHelper[`getTranslate${schedule.mode === 'horizontal' ? 'X' : 'Y'}`](element),
                date              = schedule.getDateFromCoordinate(coordinate, 'round', false, true),
                // Try resolving event record from target element, to determine if drop was on another event
                targetEventRecord = schedule.resolveEventRecord(target);

            if (date) {
                // Remove from grid first so that the data change
                // below does not fire events into the grid.
                (grid.store as TaskStore).remove(task);
                task.startDate = date;
                task.assign(resource);
                schedule.eventStore.add(task);
            }

            // Dropped on a scheduled event, display toast
            if (targetEventRecord) {
                Toast.show(`Dropped on ${targetEventRecord.name}`);
            }
        }

        if (resource) {
            resource.cls = '';
        }

        schedule.features.eventTooltip.disabled = false;
    };

    onAbort: DragHelperListenersTypes['abort'] = () => {
        this.tip?.hide();
    };

    set schedule(schedule: Scheduler) {
        this._schedule = schedule;

        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = schedule.scrollManager as ScrollManager;
    }

    get schedule(): Scheduler {
        return this._schedule;
    }

}
