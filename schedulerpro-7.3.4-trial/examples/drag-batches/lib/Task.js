import EventModel from '../../../lib/SchedulerPro/model/EventModel.js';

export default class Task extends EventModel {
    static get fields() {
        return [
            { name : 'durationUnit', defaultValue : 'h' },
            'orderId'
        ];
    }

    get order() {
        return this.project?.getCrudStore('orders').getById(this.orderId);
    }

    get orderSize() {
        return this.order?.size;
    }

    get eventColor() {
        return this.order?.eventColor;
    }
}
