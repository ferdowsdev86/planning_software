import SchedulerResourceModel from '../../../lib/Scheduler/model/ResourceModel.js';

// Custom resource model, adding the sleeps field
export default class PropertyModel extends SchedulerResourceModel {
    static $name = 'PropertyModel';

    static fields = [
        { name : 'sleeps', type : 'number', defaultValue : 2 }
    ];
}
