import SchedulerResourceModel from '../../../lib/Scheduler/model/ResourceModel.js';

export default class CustomResource extends SchedulerResourceModel {
    static $name = 'CustomResource';

    static fields = [
        // Do not persist `cls` field because we change its value on dragging unplanned resources to highlight the row
        { name : 'cls', persist : false }
    ];

    get nbrAssignedEvents() {
        return this.events.length;
    }
}
