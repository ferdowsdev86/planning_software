import { Model } from '@bryntum/schedulerpro';

export class VehicleCondition extends Model {
    declare value: number;
    declare text: string;

    static override get fields() {
        return [
            { name : 'value', type : 'number' },
            { name : 'text', type : 'string' }
        ];
    }
}
