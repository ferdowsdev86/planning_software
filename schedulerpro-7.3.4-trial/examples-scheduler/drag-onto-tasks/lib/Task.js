import SchedulerEventModel from '../../../lib/Scheduler/model/EventModel.js';

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
