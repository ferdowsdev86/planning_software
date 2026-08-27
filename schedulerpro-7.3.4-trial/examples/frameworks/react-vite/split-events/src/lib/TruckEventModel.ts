import { EventModel } from '@bryntum/schedulerpro';

export class TruckEventModel extends EventModel {

    declare icon?: string;
    declare event?: TruckEventModel;

    static fields = [
        { name : 'icon', type : 'string' }
    ];
}
