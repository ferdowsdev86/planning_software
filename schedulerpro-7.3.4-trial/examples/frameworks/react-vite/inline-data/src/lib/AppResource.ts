import { ResourceModel } from '@bryntum/schedulerpro';

export class AppResourceModel extends ResourceModel {

    declare vehicleCondition: number;

    static override fields = [
        { name : 'vehicleCondition', type : 'number' }
    ];
}
