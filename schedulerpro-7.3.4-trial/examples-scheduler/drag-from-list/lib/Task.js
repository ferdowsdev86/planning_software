import SchedulerEventModel from '../../../lib/Scheduler/model/EventModel.js';

// Our custom model class where we add an extra `equipment` field and reconfigure the default duration unit to 'h'
export default class Task extends SchedulerEventModel {
    static fields = [
        { name : 'equipment', type : 'array', defaultValue : [] },
        // in this demo, default duration for tasks will be hours (instead of days)
        { name : 'durationUnit', defaultValue : 'h' }
    ];
}
