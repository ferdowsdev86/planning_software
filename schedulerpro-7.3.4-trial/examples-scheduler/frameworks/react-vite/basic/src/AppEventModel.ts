import { SchedulerEventModel, SchedulerEventModelConfig } from '@bryntum/schedulerpro';

export type AppEventModelConfig = SchedulerEventModelConfig & {
    desc?: string
    eventType?: string
}

export class AppEventModel extends SchedulerEventModel {

    declare desc: string;
    declare eventType: string;

    static fields = [
        'desc',
        'eventType'
    ];

    constructor(config: AppEventModelConfig) {
        super(config);
    }

}
