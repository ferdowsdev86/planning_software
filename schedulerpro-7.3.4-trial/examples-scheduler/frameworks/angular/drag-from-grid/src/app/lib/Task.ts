import { SchedulerEventModel } from '@bryntum/schedulerpro';

export class Task extends SchedulerEventModel {
    static override $name = 'Task';

    static override get defaults() {
        return  {
        // In this demo, default duration for tasks will be hours (instead of days)
            durationUnit : 'h',

            // Use a default name, for better look in the grid if unassigning a new event
            name : 'New event',

            // Use a default icon also
            iconCls : 'fa fa-asterisk'
        };
    }

    getDurationMS = (): number => {
        return this.durationMS;
    };
}
