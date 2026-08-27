import { EventModel } from '@bryntum/schedulerpro';

// Custom Appointment model, based on EventModel with additional fields and changed defaults
export class Appointment extends EventModel {

    declare patient: string;
    declare requiredRole : string;

    static override get fields() {
        return [
            'patient',
            'requiredRole',
            // override field defaultValue to hours
            { name : 'durationUnit', defaultValue : 'h' }
        ];
    }

    static override get defaults() {
        return {
            // In this demo, default duration for sessions will be hours (instead of days)
            durationUnit : 'h'
        };
    }
}
