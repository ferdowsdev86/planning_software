import { EventModel, EventModelConfig } from '@bryntum/scheduler-thin';

export type AppEventModelConfig = EventModelConfig & {
    desc?: string
    eventType?: string
}

export class AppEventModel extends EventModel {

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
