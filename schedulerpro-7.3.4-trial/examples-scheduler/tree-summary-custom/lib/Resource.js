import SchedulerResourceModel from '../../../lib/Scheduler/model/ResourceModel.js';

export default class Resource extends SchedulerResourceModel {
    static get fields() {
        return [
            // A custom field used in this demo to define how many hours / day a resource is working
            { name : 'hoursPerDay', defaultValue : 8 }
        ];
    }

}
