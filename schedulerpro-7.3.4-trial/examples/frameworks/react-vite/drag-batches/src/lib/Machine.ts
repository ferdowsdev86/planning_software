import { ResourceModel } from '@bryntum/schedulerpro';

export class Machine extends ResourceModel {

    declare capacity: number;
    declare running: boolean;
    declare statusMessage: string;

    static fields = [
        { name : 'capacity', type : 'number' },
        { name : 'running', type : 'boolean' },
        { name : 'statusMessage', type : 'string' }
    ];

}
