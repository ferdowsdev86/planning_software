import { DateHelper, DependencyModel, DragHelper, DragHelperConfig, Grid, SchedulerPro, StringHelper } from '@bryntum/schedulerpro';
import { Order } from './Order';
import { Task } from './Task';

interface DragContext {
    element: HTMLElement
    grabbed: HTMLElement
    order: Order
    validityOverlapIcon: HTMLElement
    validityResourceIcon: HTMLElement
    newX: number
    newY: number
    valid: boolean
    startDate: Date | null
}

type DragConfig = DragHelperConfig & {
    grid: Grid
    schedule: SchedulerPro
    constrain: boolean
    outerElement: HTMLElement
};

export class Drag extends DragHelper {

    public grid: Grid;
    public schedule: SchedulerPro;

    private dropTargetSelector?: string;

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
                drop      : 'onOrderDrop'
            }
        };
    }

    constructor(config: DragConfig) {
        super(config);
        this.grid     = config.grid;
        this.schedule = config.schedule;
    }

    override createProxy = (element: HTMLElement) => {

        const
            order             = this.grid.getRecordFromElement(element) as Order,
            firstTaskDuration = order.firstTask.duration,
            proxy             = element.cloneNode() as HTMLElement;

        proxy.style.top = '';
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

        // Size the proxy to match first task width
        const sizeProp = this.schedule.mode === 'horizontal' ? 'width' : 'height';
        proxy.style[sizeProp] = (firstTaskDuration * this.schedule.tickSize) + 'px';

        return proxy;
    };

    onOrderDragStart = ({ context }: { context: DragContext }) => {
        if (this.grid.isDestroyed) {
            return;
        }

        const
            me           = this,
            { schedule } = me,
            proxy        = context.element;

        // save a reference to the Order being dragged so we can access it later
        context.order = me.grid.getRecordFromElement(context.grabbed) as Order;

        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        // Prevent tooltips from showing while dragging
        schedule.features.eventTooltip.disabled = true;
        schedule.element.classList.add('b-mask-incompatible-rows');

        context.validityOverlapIcon  = proxy.querySelector('.validity-overlap i') as HTMLElement;
        context.validityResourceIcon = proxy.querySelector('.validity-machine i') as HTMLElement;

        // Only allow drops on the machine specific to the start task of the order, blur out others (in CSS
        me.dropTargetSelector               = `.b-timeline-sub-grid .b-grid-row[data-id="${context.order.orderStartMachine.id}"]`;
        context.order.orderStartMachine.cls = 'compatible';
    };

    onOrderDrag({ context }: { context: DragContext }) {
        const
            { schedule } = this,
            // This example positions the drag proxy via `positioning : 'inset'` (not a CSS transform), so the
            // coordinate is read from the context position rather than `DomHelper.getTranslateX/Y`
            coordinate   = schedule.mode === 'horizontal' ? context.newX : context.newY,
            date         = schedule.getDateFromCoordinate(coordinate, 'round', false),
            // Only allow drops of an order onto the first machine which creates the chain of production tasks
            available    = date && schedule.eventStore.isDateRangeAvailable(date, DateHelper.add(date, context.order.firstTask.duration, 'h'), null, context.order.orderStartMachine);

        context.validityResourceIcon.className = `fa fa-fw fa-${context.valid ? 'check' : 'times'}`;
        context.validityOverlapIcon.className  = `fa fa-fw fa-${available ? 'check' : 'times'}`;
        context.startDate                      = date;
    }

    // Drop callback after a mouse up, take action and transfer the unplanned Order to the real EventStore (if it's valid)
    async onOrderDrop({ context }: { context: DragContext }) {
        const
            me           = this,
            { schedule } = me;

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (context.valid && context.startDate) {
            await me.scheduleOrder(context.order, context.startDate);
        }

        schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);
        schedule.features.eventTooltip.disabled = false;
        schedule.element.classList.remove('b-mask-incompatible-rows');
        context.order.orderStartMachine.cls = '';
    }

    async scheduleOrder(order: Order, startDate: Date) {
        // First, copy template tasks into the Order model
        const
            { project }    = this.schedule,
            template       = project.getCrudStore('templates').getById(order.type),
            orderTasks     = (template.children as Order[]).map(task => task.copy({ orderId : order.id })),
            firstOrderTask = orderTasks[0] as Task;

        order.appendChild(orderTasks);

        order.firstTaskId = firstOrderTask.id;
        order.lastTaskId  = order.lastChild.id;

        firstOrderTask.startDate = startDate;

        project.eventStore.add(order.tasks);

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
        order.tasks.forEach((orderTask, i) => {
            if (i < order.tasks.length - 1) {
                project.dependencyStore.add({
                    fromEvent : orderTask,
                    toEvent   : order.tasks[i + 1],
                    type      : DependencyModel.Type.EndToStart,
                    fromSide  : 'bottom',
                    toSide    : 'left'
                });
            }
        });

        // Commit changes immediately
        await project.commitAsync();
    }
}
