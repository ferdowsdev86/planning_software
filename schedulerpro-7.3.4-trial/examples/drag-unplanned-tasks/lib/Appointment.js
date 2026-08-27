import EventModel from '../../../lib/SchedulerPro/model/EventModel.js';

// Custom Appointment model, based on EventModel with additional fields and changed defaults
export default class Appointment extends EventModel {
    static fields = [
        'patient',
        'requiredRole',
        // override field defaultValue to hours
        { name : 'durationUnit', defaultValue : 'h' }
    ];
}
