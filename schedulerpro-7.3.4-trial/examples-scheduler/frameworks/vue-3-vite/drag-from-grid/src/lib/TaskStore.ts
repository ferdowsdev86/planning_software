import { DateHelper, SchedulerEventStore } from '@bryntum/schedulerpro';
import { Task } from './Task';

export class TaskStore extends SchedulerEventStore {
    static $name = 'TaskStore';

    static configurable = {
        modelClass : Task
    };

    public autoRescheduleTasks: Boolean = false;
    private isRescheduling: Boolean = false;

    // Override add to reschedule any overlapping events caused by the add
    add(records: Task | Task[], silent = false): Task[] {
        const me = this;

        if (me.autoRescheduleTasks) {
            // Flag to avoid rescheduling during rescheduling
            me.isRescheduling = true;
            me.beginBatch();
        }

        if (!Array.isArray(records)) {
            records = [records];
        }

        super.add(records, silent);

        if (me.autoRescheduleTasks) {
            me.endBatch();
            me.isRescheduling = false;
        }

        return records;
    }

    rescheduleOverlappingTasks(eventRecord: Task): void {
        if (eventRecord.resource) {
            const
                futureEvents: Task[]  = [],
                earlierEvents: Task[] = [];

            // Split tasks into future and earlier tasks
            eventRecord.resource.events.forEach(event => {
                if (event !== eventRecord) {
                    if (event.startDate >= eventRecord.startDate) {
                        futureEvents.push(event as Task);
                    }
                    else {
                        earlierEvents.push(event as Task);
                    }
                }
            });

            if (futureEvents.length || earlierEvents.length) {
                futureEvents.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
                earlierEvents.sort((a, b) => (a.startDate > b.startDate ? -1 : 1));

                futureEvents.forEach((ev, i) => {
                    const prev = futureEvents[i - 1] || eventRecord;

                    ev.startDate = DateHelper.max(
                        new Date(prev.endDate),
                        new Date(ev.startDate)
                    );
                });

                // Walk backwards and remove any overlap
                [eventRecord, ...earlierEvents].forEach((ev, i, all) => {
                    const prev = all[i - 1];

                    if (
                        new Date(ev.endDate).getTime() > Date.now() &&
                        ev !== eventRecord &&
                        prev
                    ) {
                        ev.setEndDate(
                            DateHelper.min(new Date(prev.startDate), new Date(ev.endDate)),
                            true
                        );
                    }
                });

                this.isRescheduling = false;
            }
        }
    }
}
