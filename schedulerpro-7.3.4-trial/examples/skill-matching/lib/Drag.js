import DragHelper from '../../../lib/Core/helper/DragHelper.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';
import DomHelper from '../../../lib/Core/helper/DomHelper.js';

// Handles dragging unscheduled appointment from the grid onto the schedule
export default class Drag extends DragHelper {
    static configurable = {
        callOnFunctions      : true,
        autoSizeClonedTarget : false,
        unifiedProxy         : true,
        swapWhenDropOnEvent  : true,
        // Prevent removing proxy on drop, we adopt it for usage in the Schedule
        removeProxyAfterDrop : false,

        // Don't drag the actual row element, clone it
        cloneTarget        : true,
        // Only allow drops on the schedule area
        dropTargetSelector : '.b-timeline-sub-grid .b-grid-row:not(.b-group-row),.b-sch-event-wrap',
        // Only allow drag of row elements inside on the unplanned grid
        targetSelector     : '.b-grid-row:not(.b-group-row)'
    };

    afterConstruct() {
        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(grabbedElement, initialXY) {
        const
            { schedule, grid } = this,
            { isHorizontal }   = schedule,
            draggedAppointment = grid.getRecordFromElement(grabbedElement),
            proxy              = document.createElement('div'),
            sizeProp           = isHorizontal ? 'width' : 'height',
            crossSizeProp      = isHorizontal ? 'height' : 'width',
            // In horizontal mode resource lanes are rows (cross size = row height); in vertical mode they
            // are columns (cross size = resource column width)
            crossSize          = (isHorizontal ? schedule.rowHeight : schedule.resourceColumnWidth) - (2 * schedule.resourceMargin);

        proxy.style.cssText = '';
        proxy.style[sizeProp]      = schedule.tickSize - (2 * schedule.resourceMargin) + 'px';
        proxy.style[crossSizeProp] = crossSize + 'px';

        // Fake an event bar
        proxy.classList.add('b-sch-event-wrap', 'b-style-tonal', `b-sch-${schedule.mode}`, 'b-colorized');
        proxy.innerHTML = StringHelper.xss`
            <div class="b-sch-event b-has-content b-sch-event-with-icon">
                <div class="b-sch-event-content">
                    <i class="b-icon b-${draggedAppointment.iconCls}"></i>
                    <div>
                        <div>${draggedAppointment.name}</div>
                    </div>
                </div>
            </div>
        `;

        return proxy;
    }

    onDragStart({ context }) {
        const
            me                 = this,
            { schedule, grid } = me,
            { selectedRecord } = grid;

        // save a reference to the task being dragged so we can access them later
        context.task = selectedRecord;
        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        // Prevent tooltips from showing while dragging
        schedule.features.eventTooltip.disabled = true;
    }

    onDrag({ event, context }) {
        const
            { schedule } = this,
            { task }     = context,
            coordinate   = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
            newStartDate = schedule.getDateFromCoordinate(coordinate, 'round', false),
            // Coordinates required when used in vertical mode, since it does not use actual columns
            technician   = context.target && schedule.resolveResourceRecord(context.target, [event.offsetX, event.offsetY]);

        if (!technician) {
            return;
        }

        // Validate the drop position
        context.valid = newStartDate && technician.canPerformTask(task, newStartDate);

        // Save reference to the technician so we can use it in onTaskDrop
        context.technician = technician;
    }

    // Drop callback after a mouse up, take action and transfer the unplanned appointment to the real EventStore (if it's valid)
    async onDrop({ context }) {
        const
            me                 = this,
            { schedule, grid } = me;

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (context.valid) {
            const
                { task, element, technician } = context,
                sizeProp                      = schedule.isHorizontal ? 'offsetWidth' : 'offsetHeight',
                coordinate                    = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](element) + (element[sizeProp] / 2),
                dropDate                      = schedule.getDateFromCoordinate(coordinate, 'round', false),
                // We schedule the task on the first available time slot for the day
                firstAvailableDaySlot         = technician.getFirstAvailableTimeSlot(dropDate, task);

            if (firstAvailableDaySlot) {
                await schedule.scheduleEvent({
                    eventRecord    : task,
                    startDate      : firstAvailableDaySlot,
                    // Assign to the technician (resource) it was dropped on
                    resourceRecord : technician,
                    element
                });

                grid.store.remove(task);
            }
            else {
                context.valid = false;
            }
        }

        schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);
        schedule.features.eventTooltip.disabled = false;
    }
}
