import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import DomHelper from '../../../lib/Core/helper/DomHelper.js';
import DragHelper from '../../../lib/Core/helper/DragHelper.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';

// Handles dragging unscheduled session from the grid onto the schedule
export default class Drag extends DragHelper {
    static get configurable() {
        return {
            callOnFunctions      : true,
            // Don't drag the actual row element, clone it
            cloneTarget          : true,
            autoSizeClonedTarget : false,
            // Only allow drops on the schedule area
            dropTargetSelector   : '.b-timeline-sub-grid',
            // Only allow drag of row elements inside on the unplanned grid
            targetSelector       : '.b-grid-row:not(.b-group-row)'
        };
    }

    afterConstruct(config) {
        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(element) {
        const
            { schedule }                  = this,
            proxy                         = document.createElement('div'),
            session                       = this.grid.getRecordFromElement(element),
            { rowHeight, resourceMargin } = schedule,
            newSize                       = schedule.timeAxisViewModel.getDistanceForDuration(session.durationMS);

        // Make the drag proxy element look like an event bar
        proxy.classList.add('b-sch-event-wrap', 'b-style-tonal', 'b-unassigned-class', 'b-colorize');
        proxy.innerHTML = StringHelper.xss`
            <div class="b-sch-event b-has-content b-sch-event-with-icon">
                <div class="b-sch-event-content">
                    <i></i>
                    <span class="b-event-text-wrap">
                        <div>${session.name}</div>
                        <span>Required capacity: ${session.participants}</span>
                    </span>
                </div>
            </div>
        `;

        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        if (schedule.isHorizontal) {
            proxy.style.width  = `${newSize}px`;
            proxy.style.height = `${rowHeight - 2 * resourceMargin}px`;
        }
        else {
            proxy.style.height = `${newSize}px`;
            proxy.style.width  = `${schedule.resourceColumnWidth}px`;
        }
        return proxy;
    }

    onDragStart({ context }) {
        const
            { schedule } = this,
            session      = this.grid.getRecordFromElement(context.grabbed);

        // save a reference to the session being dragged so we can access it later
        context.session = session;

        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        // Prevent tooltips from showing while dragging
        schedule.features.eventTooltip.disabled = true;
    }

    onDrag({ event, context }) {
        const
            { schedule }        = this,
            { session, target } = context,
            coordinate          = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
            startDate           = schedule.getDateFromCoordinate(coordinate, 'round', false),
            endDate             = startDate && DateHelper.add(startDate, session.duration, session.durationUnit),
            validationIndicator = context.element.querySelector('i'),
            // Coordinates required when used in vertical mode, since it does not use actual columns
            room                = context.room = schedule.resolveResourceRecord(target, [event.offsetX, event.offsetY]);

        // Don't allow drops everywhere, only allow drops if the drop is on the timeaxis and on top of a room
        if (startDate && room && room.capacity >= session.participants) {
            context.valid &= schedule.allowOverlap || schedule.isDateRangeAvailable(startDate, endDate, null, room);
            validationIndicator.className = 'fa fa-fw fa-check';
        }
        else {
            context.valid                 = false;
            validationIndicator.className = 'fa fa-fw fa-times';
        }

        context.startDate = startDate;
    }

    // Drop callback after a mouse up, take action and transfer the unplanned session to the real EventStore (if it's valid)
    async onDrop({ context }) {
        const
            me           = this,
            { schedule } = me,
            { session }  = context;

        schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (context.valid) {
            const targetSession = schedule.resolveEventRecord(context.target);

            // Dropped on a scheduled event, create a dependency between them
            if (targetSession) {
                schedule.dependencyStore.add({
                    fromEvent : targetSession,
                    toEvent   : session,
                    lag       : 30,
                    lagUnit   : 'minutes'
                });

                // Color them to signal they are linked
                targetSession.eventColor = 'orange';
                session.eventColor = 'orange';
            }

            // We hand over the data + existing element to the Scheduler so it do the scheduling
            await schedule.scheduleEvent({
                eventRecord    : session,
                startDate      : context.startDate,
                // Assign to the room (resource) it was dropped on
                resourceRecord : context.room
            });
        }

        schedule.features.eventTooltip.disabled = false;
    }
}
