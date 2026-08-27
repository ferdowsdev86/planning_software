import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import DragHelper from '../../../lib/Core/helper/DragHelper.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';

// Handles dragging unscheduled orders from the grid onto the schedule
export default class Drag extends DragHelper {
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
