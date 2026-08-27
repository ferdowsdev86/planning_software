import { EventModel } from '@bryntum/schedulerpro';
import { Order } from './Order';

export class Task extends EventModel {

    declare durationUnit: string;
    declare orderId: string;

    static fields = [
        { name : 'durationUnit', defaultValue : 'h' },
        'orderId'
    ];

    get order(): Order {
        return this.project.getCrudStore('orders').getById(this.orderId) as Order;
    }

    get orderSize(): number {
        return this.order?.size;
    }

}
