import { ResourceModel } from '@bryntum/schedulerpro';

export class DriverResource extends ResourceModel {

    declare vehicle: string;
    declare active: boolean;

    static fields = [
        'vehicle',
        'active'
    ];
}
