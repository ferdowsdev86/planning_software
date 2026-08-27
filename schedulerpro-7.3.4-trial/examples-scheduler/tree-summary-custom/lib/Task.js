import SchedulerEventModel from '../../../lib/Scheduler/model/EventModel.js';

export default class Task extends SchedulerEventModel {
    static get fields() {
        return [
            { name : 'icon' },
            // A custom field used in this demo to define how many hours / day the task will be worked on
            { name : 'effortPerDay', defaultValue : 4 }
        ];
    }

    assign(resourceRecord, clear) {
        if (resourceRecord.isParent) {
            resourceRecord = resourceRecord.children[this.resource.parentIndex];
        }
        return super.assign(resourceRecord, clear);
    }
}
