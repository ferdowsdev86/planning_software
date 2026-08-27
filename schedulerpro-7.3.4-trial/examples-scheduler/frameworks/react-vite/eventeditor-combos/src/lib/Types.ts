import { SchedulerEventModel, Model } from '@bryntum/schedulerpro';

export class AppEventModelConfig extends SchedulerEventModel {
    declare floor: string;
    declare room: string;
    declare eventType: string;
    declare startDate: Date;

    static override fields = [
        { name : 'floor', type : 'string' },
        { name : 'room', type : 'string' },
        { name : 'eventType', type : 'string' }
    ];
}

export class FloorModel extends Model {
    declare id: string;
    declare text: string;
    declare buildingId: string;

    static override fields = [
        'id',
        'text',
        'buildingId'
    ];
}

export class RoomModel extends Model {
    declare id: string;
    declare text: string;
    declare floorId: string;

    static override fields = [
        'id',
        'text',
        'floorId'
    ];
}

export class BuildingModel extends Model {
    declare id: string;
    declare text: string;

    static override fields = [
        'id',
        'text'
    ];
}

export class PurposeModel extends Model {
    declare id: string;
    declare text: string;

    static override fields = [
        'id',
        'text'
    ];
}

export class EquipmentModel extends Model {
    declare id: string;
    declare text: string;

    static override fields = [
        'id',
        'text'
    ];
}
