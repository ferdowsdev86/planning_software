import EventModel from '../../../../lib/SchedulerPro/model/EventModel.js';

export default class Event extends EventModel {
    static $name = 'Event';

    static fields = [
        // Time zone information should be used carefully with real time demo and clients in different time zones. It
        // may lead to events moving back and forth indefinitely while clients in different time zones recalculate start
        { name : 'startDate', format : 'YYYY-MM-DDTHH:mm:ss' },
        { name : 'endDate', format : 'YYYY-MM-DDTHH:mm:ss' },
        { name : 'constraintDate', format : 'YYYY-MM-DDTHH:mm:ss' },
        { name : 'parentIndex', persist : true },
        { name : 'orderedParentIndex', persist : true }
    ];

    // This demo works with the same server as the Gantt demo, we need to disable incompatible config
    static usesDelayFromParent = false;
}
