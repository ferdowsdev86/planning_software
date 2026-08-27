import { SchedulerResourceModel } from '@bryntum/schedulerpro';

// SchedulerResourceModel extended with the demo's custom `city` field (generated per resource by the backend).
export class AppResourceModel extends SchedulerResourceModel {
    declare city : string;

    static override fields = [
        { name : 'city', type : 'string' }
    ];
}
