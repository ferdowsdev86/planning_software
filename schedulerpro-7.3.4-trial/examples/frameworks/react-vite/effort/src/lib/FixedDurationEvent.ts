import { EventModel } from '@bryntum/schedulerpro';

export class FixedDurationEvent extends EventModel {
    static fields = [
        // Change the event default "schedulingMode" to "FixedDuration"
        // which enforces the event to distribute the provided "effort" value over the event duration
        { name : 'schedulingMode', defaultValue : 'FixedDuration' }
    ];
}
