import EventModel from '../../../lib/SchedulerPro/model/EventModel.js';
import Duration from '../../../lib/Core/data/Duration.js';

const statuses = [
    'not_arrived',
    'arrived',
    'in_bar',
    'all_seated',
    'paid',
    'all_guests_left'
];

export default class Reservation extends EventModel {
    static $name = 'Reservation';
    static fields = [
        { name : 'reservedBy' },
        { name : 'durationUnit', defaultValue : 'h' },
        { name : 'nbrGuests', defaultValue : 2 },
        { name : 'isBirthday', type : 'boolean', defaultValue : false },
        { name : 'isVip', type : 'boolean', defaultValue : false },
        { name : 'tags', type : 'array', defaultValue : [] },
        { name : 'allergies', type : 'array', defaultValue : [] },
        { name : 'status', defaultValue : 'not_arrived' },
        { name : 'isNewGuest', type : 'boolean' },
        { name : 'creditCard', type : 'boolean' },
        { name : 'postamble', dataSource : 'cleanupBuffer', convert : value => value ? new Duration(typeof value === 'number' ? value + 'min' : value) : null }
    ];
}
