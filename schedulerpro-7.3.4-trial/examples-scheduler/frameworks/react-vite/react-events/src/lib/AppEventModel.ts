import { SchedulerEventModel } from '@bryntum/schedulerpro';

export default class AppEventModel extends SchedulerEventModel {
    declare percentage : number;
    declare icon       : string;

    static fields = [
        { name : 'percentage', type : 'number', defaultValue : 0 },
        { name : 'icon', type : 'string' }
    ];
}
