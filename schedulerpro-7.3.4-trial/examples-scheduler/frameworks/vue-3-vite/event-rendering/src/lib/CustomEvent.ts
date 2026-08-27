import { SchedulerEventModel } from '@bryntum/schedulerpro';

export class CustomEventModel extends SchedulerEventModel {

    declare progress : number;
    declare type : string;

    static $name  = 'CustomEventModel';
    static fields = [
        { name : 'progress', type : 'number' },
        { name : 'type', defaultValue : 'task' }
    ];
}
