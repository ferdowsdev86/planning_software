import { SchedulerEventModel } from '@bryntum/schedulerpro';

export class AppEventModel extends SchedulerEventModel {

    declare desc: string;
    declare eventType: string;

    static fields = [
        'desc',
        'eventType'
    ];
}
