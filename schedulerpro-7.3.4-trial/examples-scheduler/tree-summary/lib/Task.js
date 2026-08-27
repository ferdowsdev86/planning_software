import SchedulerEventModel from '../../../lib/Scheduler/model/EventModel.js';

export default class Task extends SchedulerEventModel {
    static get fields() {
        return [
            {
                name         : 'demandedCapacity',
                type         : 'number',
                defaultValue : 0
            }
        ];
    }
}
