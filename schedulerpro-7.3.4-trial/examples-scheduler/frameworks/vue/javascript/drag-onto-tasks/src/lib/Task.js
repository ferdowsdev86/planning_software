/**
 * Custom Task model
 *
 * taken from the vanilla example
 */
import { SchedulerEventModel } from '@bryntum/schedulerpro';

export default class Task extends SchedulerEventModel {
    static get fields() {
        return [
            'equipment'
        ];
    }

    static get defaults() {
        return {
            // in this demo, default duration for tasks will be hours (instead of days)
            durationUnit : 'h',
            equipment    : []
        };
    }
}
