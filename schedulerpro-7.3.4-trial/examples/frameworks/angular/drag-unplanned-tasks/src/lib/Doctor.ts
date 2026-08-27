import { ResourceModel } from '@bryntum/schedulerpro';

// Custom Doctor resource model, based on ResourceModel with additional fields
export class Doctor extends ResourceModel {

    declare role : string;
    declare roleIconCls : string;

    static override get fields() {
        return [
            'role',
            'roleIconCls'
        ];
    }
}
