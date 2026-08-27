import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import DragHelper from '../../../lib/Core/helper/DragHelper.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';
import DomHelper from '../../../lib/Core/helper/DomHelper.js';

// Handles dragging unscheduled task from the grid onto the schedule
export default class Drag extends DragHelper {
    static configurable = {
        callOnFunctions      : true,
        autoSizeClonedTarget : false,
        unifiedProxy         : true,

        // Prevent removing proxy on drop, we adopt it for usage in the Schedule
        removeProxyAfterDrop : false,

        // Don't drag the actual row element, clone it
        cloneTarget        : true,
        // Only allow drops on the schedule area
        dropTargetSelector : '.b-timeline-sub-grid',
        // Only allow drag of row elements inside on the unplanned grid
        targetSelector     : '.b-grid-row:not(.b-group-row)'
    };

    afterConstruct(config) {
        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(grabbedElement, initialXY) {
        const
            { context, schedule, grid }        = this,
            { timeAxisViewModel, isHorizontal } = schedule,
            draggedTask                         = grid.getRecordFromElement(grabbedElement),
            durationInPixels                    = timeAxisViewModel.getDistanceForDuration(draggedTask.durationMS),
            proxy                               = document.createElement('div'),
            preambleWidth                       = timeAxisViewModel.getDistanceForDuration(draggedTask.preamble.milliseconds),
            postambleWidth                      = timeAxisViewModel.getDistanceForDuration(draggedTask.postamble.milliseconds),
            sizeProp                            = isHorizontal ? 'width' : 'height',
            maxSizeProp                         = isHorizontal ? 'max-width' : 'max-height',
            crossSizeProp                       = isHorizontal ? 'height' : 'width',
            // In horizontal mode resource lanes are rows (cross size = row height); in vertical mode they
            // are columns (cross size = resource column width)
            crossSize                           = (isHorizontal ? schedule.rowHeight : schedule.resourceColumnWidth) - 2 * schedule.resourceMargin,
            // In horizontal mode the time axis runs along the width; in vertical mode along the height
            axisSize                            = isHorizontal ? schedule.timeAxisSubGrid.width : schedule.timeAxisSubGrid.height;

        proxy.classList.add(`b-sch-${schedule.mode}`, 'b-event-buffer');

        // Fake an event bar
        proxy.innerHTML = StringHelper.xss`
            <div class="b-sch-event-wrap b-colorize b-color-gray b-style-bordered b-unassigned-class b-sch-${schedule.mode} b-event-buffer ${axisSize < durationInPixels ? 'b-exceeds-axis-width' : '' }" role="presentation" style="${sizeProp}:${durationInPixels + preambleWidth + postambleWidth}px;${maxSizeProp}:${axisSize}px;${crossSizeProp}:${crossSize}px">
                <div class="b-sch-event-buffer b-sch-event-buffer-before" role="presentation" style="${sizeProp}: ${preambleWidth}px;"><span class="b-buffer-label" role="presentation">${draggedTask.preamble.toString()}</span></div>
                <div class="b-sch-event-buffer b-sch-event-buffer-after" role="presentation" style="${sizeProp}: ${postambleWidth}px;"><span class="b-buffer-label" role="presentation">${draggedTask.postamble.toString()}</span></div>
                <div class="b-sch-event b-has-content b-sch-event-with-icon">
                    <div class="b-sch-event-content">
                        <span class="event-name">${draggedTask.name}</span>
                        <span class="location"> <i class="fa fa-map-marker-alt"></i>${draggedTask.shortAddress || ''}</span>
                    </div>
                </div>
            </div>
        `;

        context.totalDuration = grid.selectedRecords.reduce((total, task) => total + task.duration, 0);

        return proxy;
    }

    onDragStart({ context }) {
        const
            me                 = this,
            { schedule, grid } = me,
            task               = grid.getRecordFromElement(context.grabbed);

        context.task = task;
        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        // Prevent tooltips from showing while dragging
        schedule.features.eventTooltip.disabled = true;
    }

    onDrag({ event, context }) {
        const
            { schedule }            = this,
            { task, totalDuration } = context,
            coordinate              = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
            newStartDate            = schedule.getDateFromCoordinate(coordinate, 'round'),
            endDate                 = newStartDate && DateHelper.add(newStartDate, totalDuration, task.durationUnit),
            // Coordinates required when used in vertical mode, since it does not use actual columns
            resourceRecord          = context.target && schedule.resolveResourceRecord(context.target, [event.offsetX, event.offsetY]),
            calendar                = resourceRecord?.effectiveCalendar;

        // Only allow drops on the timeaxis
        context.valid = Boolean(resourceRecord && newStartDate &&
            // Ensure we don't break allowOverlap config
            (schedule.allowOverlap || schedule.isDateRangeAvailable(newStartDate, endDate, null, resourceRecord) &&
                // Respect resource's working time, if any
                (!calendar || calendar.isWorkingTime(newStartDate, endDate, true))));

        // Save reference to the resourceRecord so we can use it in onDrop
        context.resourceRecord = resourceRecord;
        context.startDate      = newStartDate;
    }

    // Drop callback after a mouse up, take action and transfer the unplanned task to the real EventStore (if it's valid)
    async onDrop({ context }) {
        const
            { schedule } = this;

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (context.valid) {
            const
                { task, element, resourceRecord } = context,
                coordinate                        = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](element),
                bufferSizeProp                    = schedule.isHorizontal ? 'offsetWidth' : 'offsetHeight',
                dropDate                          = schedule.getDateFromCoordinate(coordinate + element.querySelector('.b-sch-event-buffer-before')[bufferSizeProp], 'round', false);

            schedule.suspendAnimations();
            // We hand over the data + existing element to the Scheduler so it do the scheduling
            // await is used so that we have a reliable end date in the case of multiple event drag
            await schedule.scheduleEvent({
                eventRecord : task,
                startDate   : dropDate,
                // Assign to the resourceRecord (resource) it was dropped on
                resourceRecord,
                element
            });
            schedule.resumeAnimations();
        }

        schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);
        schedule.features.eventTooltip.disabled = false;
    }
}
