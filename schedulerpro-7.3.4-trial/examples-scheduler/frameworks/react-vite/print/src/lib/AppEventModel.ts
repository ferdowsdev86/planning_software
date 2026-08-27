import { SchedulerEventModel } from '@bryntum/schedulerpro';

export default class AppEventModel extends SchedulerEventModel {
    declare firstName : string;
    declare surName   : string;
    declare score     : number;

    static fields = [
        { name : 'firstName', type : 'string' },
        { name : 'surName', type : 'string' },
        { name : 'score', type : 'number' }
    ];
}
