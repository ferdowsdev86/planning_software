import EventModel from '../../../lib/SchedulerPro/model/EventModel.js';

// Custom event model with multiple additional fields and a reconfigured default field
export default class ProEvent extends EventModel {
    static get fields() {
        return [
            { name : 'durationUnit', defaultValue : 'hour' },
            { name : 'order',  defaultValue : 'New order' },
            'jobCost',
            'contact',
            'phone',
            'priority'
        ];
    }
}
