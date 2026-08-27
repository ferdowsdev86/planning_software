import { ResourceModel } from '@bryntum/schedulerpro';

/**
 * Custom Aircraft model, based on ResourceModel with additional fields
 */
export class Aircraft extends ResourceModel {
    declare type: 'work' | 'material' | 'cost';
    declare fleet: string;

    static override get fields() {
        return [
            { name : 'fleet' },
            { name : 'type' }
        ];
    }
}
