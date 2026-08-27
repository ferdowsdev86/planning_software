import { SchedulerResourceModel } from '@bryntum/schedulerpro';

export class Developer extends SchedulerResourceModel {
    declare years: number;

    static fields = [
        { name : 'years', type : 'number' }
    ];
}
