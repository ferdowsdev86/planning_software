import AssignmentModel from '../../../../lib/SchedulerPro/model/AssignmentModel.js';

export default class Assignment extends AssignmentModel {
    static $name = 'Assignment';

    static fields = [
        // In Gantt both event and eventId are persistable. In SchedulerPro only eventId is persistable. To be
        // compatible with Gantt we need to send both eventId and event. Same goes for resource.
        { name : 'event', persist : true },
        { name : 'eventId', persist : true },
        { name : 'resource', persist : true },
        { name : 'resourceId', persist : true }
    ];
}
