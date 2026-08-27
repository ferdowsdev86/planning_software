import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import SchedulerPro from '../../../lib/SchedulerPro/view/SchedulerPro.js';
import '../../../lib/SchedulerPro/feature/NestedEvents.js';

// Customized SchedulerPro subclass
export default class NestedSchedule extends SchedulerPro {
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
