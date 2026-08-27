import { ResourceModel } from '@bryntum/schedulerpro';

export class AppResourceModel extends ResourceModel {

    declare vehicleCondition : number;

    static override get fields() {
        return [
            { name : 'vehicleCondition', type : 'number' }
        ];
    }
}
