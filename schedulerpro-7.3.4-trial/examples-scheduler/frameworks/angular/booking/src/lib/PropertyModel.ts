import { SchedulerResourceModel } from '@bryntum/schedulerpro';

// Custom resource model, adding the sleeps field
export default class PropertyModel extends SchedulerResourceModel {

    declare sleeps : number;

    static override get fields(): object[] {
        return [
            { name : 'sleeps', type : 'number' }
        ];
    }

}
