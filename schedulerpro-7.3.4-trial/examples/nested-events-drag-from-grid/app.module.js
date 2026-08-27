import shared from '../_shared/shared.module.js';
import { DateHelper, DragHelper, DomHelper, SchedulerPro, Grid, Container, ProjectModel, Toast } from '../../build/schedulerpro.module.js';
//region "lib/Drag.js"

// Handles dragging unscheduled jobs from the grid onto parent evnets in the schedule
class Drag extends DragHelper {
    static get configurable() {
        return {
            callOnFunctions      : true,
            // Don't drag the actual row element, clone it
            cloneTarget          : true,
            // We want to set the proxy size ourselves, to mimic a scheduler event
            autoSizeClonedTarget : false,
            // Only allow drops on parent events
            dropTargetSelector   : '.b-nested-events-parent',
            // Only allow drag of row elements inside on the unplanned grid
            targetSelector       : '.b-unplanned .b-grid-row',
            // We are going to make the scheduler adopt the proxy on drop for a nice transition, prevent removing it
            removeProxyAfterDrop : false
        };
    }

    afterConstruct() {
        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(element) {
        const
            { schedule }     = this,
            { isHorizontal } = schedule,
            job              = this.grid.getRecordFromElement(element),
            { eventHeight }  = schedule.features.nestedEvents,
            newSize          = schedule.timeAxisViewModel.getDistanceForDuration(job.durationMS),
            sizeProp         = isHorizontal ? 'width' : 'height',
            crossSizeProp    = isHorizontal ? 'height' : 'width';

        // Make a drag proxy element that looks like an event bar
        return DomHelper.createElement({
            className : 'b-sch-event-wrap b-nested-event b-unassigned',
            style     : {
                [sizeProp]      : newSize,
                [crossSizeProp] : eventHeight
            },
            children : [
                {
                    className : 'b-sch-event',
                    children  : [
                        {
                            className : 'b-sch-event-content',
                            text      : job.name
                        }
                    ]
                }
            ]
        });
    }

    onDragStart({ context }) {
        const { schedule } = this;

        // Save a reference to the job being dragged for later access
        const job = context.job = this.grid.getRecordFromElement(context.grabbed);

        // Make scheduler scroll if we drag close to its edges
        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        // Prevent tooltips from showing while dragging
        schedule.features.eventTooltip.disabled = true;

        // Highlight possible drop parents
        const candidates = schedule.eventStore.query(event => event.isParent && schedule.canFitJob(job, event, event.startDate, DateHelper.add(event.startDate, job.duration, 'm')));
        schedule.highlightEvents({ events : candidates, unhighlightOnClick : false, scroll : false });
    }

    onDrag({ context }) {
        const
            { schedule }    = this,
            { job, target } = context,
            targetParent    = target && schedule.resolveEventRecord(target.closest('.b-nested-events-parent')),
            coordinate      = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
            startDate       = schedule.getDateFromCoordinate(coordinate, 'round', false),
            endDate         = startDate && DateHelper.add(startDate, job.duration, job.durationUnit),
            // Validate that a job can be dropped at the current location (and possibly also adjust its date to fit)
            fitsAtDate      = schedule.canFitJob(job, targetParent, startDate, endDate);

        if (fitsAtDate) {
            context.newStartDate = fitsAtDate;
        }
        else {
            context.valid = false;
        }
    }

    // Drop callback after a mouse up, nest the dropped event inside the target parent
    async onDrop({ context }) {
        const
            { schedule }                   = this,
            { job, element, newStartDate } = context;

        schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        schedule.features.eventTooltip.disabled = false;

        schedule.unhighlightEvents();

        // If drop was done in a valid location, set the startDate and nest the event
        if (context.valid) {
            const targetParent = schedule.resolveEventRecord(context.target.closest('.b-nested-events-parent'));

            // Dropped on a scheduled event, create a dependency between them
            if (targetParent) {
                element.classList.remove('b-drag-proxy');

                // We hand over the data + existing element to the Scheduler and let it do the scheduling
                await schedule.scheduleEvent({
                    eventRecord       : job,
                    parentEventRecord : targetParent,
                    startDate         : newStartDate,
                    element
                });
            }
        }
    }
}

//endregion

//region "lib/NestedSchedule.js"

// Customized SchedulerPro subclass
class NestedSchedule extends SchedulerPro {
    // Widget factory type, can be used to create an instance decoratively
    static type = 'nestedschedule';

    // Customized config values
    static configurable = {
        // Custom view preset, only using a single header row with full day names in it
        viewPreset : {
            base    : 'dayAndWeek',
            headers : [
                {
                    unit       : 'day',
                    dateFormat : 'dddd'
                }
            ],
            timeResolution : {
                unit      : 'day',
                increment : 1
            },
            tickWidth : 150
        },
        // Use the same date format for tooltips etc
        displayDateFormat : 'dddd',
        // Need a large row height to fit stacked nested events
        rowHeight         : 192,
        // Some more space at resource top/bottom
        resourceMargin    : 20,
        // Don't use any event style or color, makes it easier to customize the appearance
        eventStyle        : null,
        eventColor        : null,
        // Hide row & column borders
        rowLines          : false,
        columnLines       : false,
        // Features used by the demo
        features          : {
            // Turn nested events on, not much of a demo without :)
            nestedEvents : {
                // Stack nested events initially (can be changed from the toolbar)
                eventLayout          : 'stack',
                // Grow nested events a bit, compared to the default which is 30
                eventHeight          : 40,
                // Reserve more space above the nested events container
                headerHeight         : 30,
                // Space between nested events
                barMargin            : 1,
                // Prevent dropping nested events outside of any parent
                allowDeNestingOnDrop : false
            },
            // Dependencies cannot be used in combination with nested events
            dependencies : false,
            // Turn of the schedule menu, we don't want it in the demo
            scheduleMenu : false,
            // Cleaner look with fewer lines
            columnLines  : false,
            // Custom validation for dragging nested events in this demo, make sure a job can fit into a parent
            eventDrag    : {
                validatorFn({ eventRecords, targetEventRecord, startDate, endDate }) {
                    if (!eventRecords[0].isParent) {
                        const
                            [job]      = eventRecords,
                            // Make dropping on empty part of a parent or on an existing child both lead to same result
                            parent     = targetEventRecord?.isParent ? targetEventRecord : targetEventRecord?.parent,
                            // Check that the job fits and possibly adjust it a bit to fit withing parent bounds
                            fitsAtDate = this.client.canFitJob(job, parent, startDate, endDate);

                        if (!fitsAtDate) {
                            return false;
                        }

                        // Store the available date temporarily, to not have to resolve it again on drop
                        job.newStartDate = fitsAtDate;
                    }
                }
            }
        },
        // Using a single column with a custom renderer
        columns : [
            {
                text  : 'Station',
                field : 'name',
                width : 150
            }
        ],
        removeUnassignedEvent : false
    };

    // Function that checks if a job can fit in a parent, and makes sure it stays in its bounds
    canFitJob(job, parent, startDate, endDate) {
        // Can only fit in parents and make sure their duration are longer than the jobs
        if (!parent || parent.duration < job.duration || !startDate || !endDate) {
            return false;
        }

        // Trying to fit so that it will extend out of the parent, move it earlier to (possibly) fit
        if (endDate > parent.endDate) {
            startDate = DateHelper.add(parent.endDate, -job.duration, job.durationUnit);
        }
        else if (startDate < parent.startDate) {
            startDate = parent.startDate;
        }

        // Check all days that the parent span so that we don't stack too many events
        for (let i = 0; i < parent.duration; i++) {
            const
                start = DateHelper.add(parent.startDate, i, 'day'),
                end   = DateHelper.add(start, 1, 'day');
            // If dragged event intersects this day, count how many children do it too
            if (DateHelper.intersectSpans(startDate, endDate, start, end)) {
                let stackCount = 0;
                for (const child of parent.children) {
                    if (DateHelper.intersectSpans(child.startDate, child.endDate, start, end)) {
                        stackCount++;
                    }
                }
                // Don't allow more than 3 events to stack at any day
                if (stackCount > 2) {
                    return false;
                }
            }
        }

        return startDate;
    }

    // Reposition the dropped job if canFitJob() determined it was needed
    onEventDrop({ context }) {
        const
            { eventRecords } = context,
            [job]            = eventRecords;

        // Don't interfere with moving parent events, only care about nested
        if (!job.isParent) {
            job.startDate = job.newStartDate;
            job.newStartDate = null;
        }
    }
}

// Register with widget factory, to allow creation by type
NestedSchedule.initClass();

//endregion

//region "lib/Unplanned.js"

// Customized Grid subclass
class Unplanned extends Grid {
    // Widget factory type, can be used to create an instance decoratively
    static type = 'unplanned';

    static configurable = {
        // Accept a project from the outside
        project : null,

        columns : [
            { text : 'Unscheduled jobs', field : 'name', flex : 1 },
            { type : 'duration', field : 'fullDuration', width : 90 }
        ],

        // Records are going to be event records
        disableGridRowModelWarning : true
    };

    updateProject(project) {
        // Update our store when assignments change in the schedule
        this.project.assignmentStore.on({
            change() {
                this.store.fillFromMaster();
            },
            thisObj : this
        });

        // Our store chains projects event store, only including unassigned nestable events
        this.store = project.eventStore.chain(r => !r.isParent && !r.assigned?.size, null, {
            excludeCollapsedRecords : false,
            sorters                 : [{ field : 'name' }]
        });
    }
}

// Register with widget factory, to allow creation by type
Unplanned.initClass();

//endregion

// Project holding all demo data, automatically loaded when demo is opened
const project = new ProjectModel({
    autoLoad   : true,
    loadUrl    : './data/data.json',
    eventStore : {
        // Don't remove unassigned events, we want to display them in the unplanned jobs grid
        removeUnassignedEvent : false
    }
});

// A container containing a custom Scheduler Pro instance and a custom Grid instance.
// The container itself has no UI, it just lays its items out.
const container = new Container({
    appendTo : 'container',
    layout   : 'hbox',
    flex     : 1,
    cls      : 'demo-app', // Apply shared demo styling to put it in a nice box
    items    : {
        // The custom SchedulerPro instance
        schedule : {
            type       : 'nestedschedule',
            // Enables smoother wheel and pinch zooming
            smoothZoom : true,

            // Link to the data
            project,

            // Date range to view
            startDate : new Date(2022, 0, 2),
            endDate   : new Date(2022, 0, 9),

            flex : 5
        },
        // A splitter to allow resizing the schedule / grid
        splitter : { type : 'splitter' },
        // The custom Grid instance
        grid     : {
            type : 'unplanned',

            // Link to the data
            project,

            flex     : 1,
            minWidth : 260
        }
    },
    listeners : {
        destroy() {
            drag?.destroy();
        }
    }
});

// We want empty parents to still be parents, it looks nicer in the demo
project.eventStore.modelClass.convertEmptyParentToLeaf = false;

// Handles dragging
const drag = new Drag({
    grid     : container.widgetMap.grid,
    schedule : container.widgetMap.schedule
});


Toast.show({
    html : `<p>This demo uses the <a href='https://bryntum.com/products/grid/'>Bryntum Grid</a> component which is licensed separately.</p>
    `,
    timeout : 10000
});
