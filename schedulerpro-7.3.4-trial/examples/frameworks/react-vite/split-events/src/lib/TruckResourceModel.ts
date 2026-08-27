import { ResourceModel } from '@bryntum/schedulerpro';

export class TruckResourceModel extends ResourceModel {

    declare icon?: string;

    static fields = [
        { name : 'icon', type : 'string' }
    ];

}
