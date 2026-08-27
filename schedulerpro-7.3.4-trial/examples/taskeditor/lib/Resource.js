import ResourceModel from '../../../lib/SchedulerPro/model/ResourceModel.js';

// Custom resource model with an additional field
export default class Resource extends ResourceModel {
    static get fields() {
        return [
            'type'
        ];
    }

    get percentAllocated() {
        const duration = this.events.reduce((total, task) => total += task.duration, 0);
        return Math.round((duration / 40) * 100);
    }
}
