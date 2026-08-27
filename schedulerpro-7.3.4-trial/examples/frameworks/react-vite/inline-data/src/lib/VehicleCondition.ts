import { Model } from '@bryntum/schedulerpro';

export class VehicleCondition extends Model {
    declare value: number;
    declare text: string;

    static override fields = [
        { name : 'value', type : 'number' },
        { name : 'text', type : 'string' }
    ];
}
