import EventModel from '../../../lib/SchedulerPro/model/EventModel.js';

// A custom appointment class with a few extra fields
export default class Appointment extends EventModel {
    static get fields() {
        return [
            'patient',
            'confirmed',
            'requiredRole',
            // override field defaultValue to hours
            { name : 'durationUnit', defaultValue : 'h' }
        ];
    }
}

Appointment.initClass();
