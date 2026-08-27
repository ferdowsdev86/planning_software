import { SchedulerEventModel } from '@bryntum/schedulerpro';

export default class AppEventModel extends SchedulerEventModel {

    declare desc: string;
    declare eventType: string;

    static override $name = 'AppEventModel';

    static override get fields() : object[] {
        return [
            { name : 'desc' },
            { name : 'eventType' }
        ];
    }
}
