import { SchedulerEventModel, SchedulerEventModelConfig, SchedulerResourceModel, SchedulerResourceModelConfig } from '@bryntum/schedulerpro';

type BryntumAppEventModelProps = SchedulerEventModelConfig & {
    desc: string
    eventType: string
    eventColor: string
}

type BryntumAppResourceModelProps = SchedulerResourceModelConfig & {
    color: string
}

export class AppEventModel extends SchedulerEventModel {

    static override $name = 'AppEventModel';

    static override get fields()  {
        return [
            'desc',
            'eventType'
        ];
    }

    desc?: string;
    eventType?: string;

    constructor(config: BryntumAppEventModelProps) {
        super(config);
    }

}

export class AppResourceModel extends SchedulerResourceModel {

    static override $name = 'AppResourceModel';

    static override get fields()  {
        return [
            'color'
        ];
    }

    color?: string;

    constructor(config: BryntumAppResourceModelProps) {
        super(config);
    }

}
