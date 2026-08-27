import { AjaxStore, AjaxStoreConfig, SchedulerEventModel, Model } from '@bryntum/schedulerpro';

export type Equipment = {
    id?: number
    name?: string
    iconCls? : string
}

export class AppEventModel extends SchedulerEventModel {
    equipment? : Equipment[];
}

export type BryntumEquipmentStoreProps = AjaxStoreConfig & {
    durationUnit : string
    equipment : Model[]
};

export class EquipmentStore extends AjaxStore {
    durationUnit? : string;
    equipment? : Model[];

    constructor(config : BryntumEquipmentStoreProps) {
        super(config);
    }
}
