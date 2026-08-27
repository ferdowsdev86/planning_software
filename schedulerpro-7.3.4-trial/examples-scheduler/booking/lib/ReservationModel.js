import SchedulerEventModel from '../../../lib/Scheduler/model/EventModel.js';

// Custom event model, adding the guests and pricePerNight fields
export default class ReservationModel extends SchedulerEventModel {
    static $name = 'ReservationModel';

    static fields = [
        { name : 'guests', type : 'number', defaultValue : 2 },
        { name : 'pricePerNight', type : 'number' }
    ];
}
