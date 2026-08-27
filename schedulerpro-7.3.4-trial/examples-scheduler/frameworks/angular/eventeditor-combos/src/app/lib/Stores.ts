import { AjaxStore } from '@bryntum/schedulerpro';
import { BuildingModel, FloorModel, RoomModel, PurposeModel, EquipmentModel } from './Types';

export const buildings = new AjaxStore({
    id         : 'buildings',
    modelClass : BuildingModel
});

export const floors = new AjaxStore({
    id         : 'floors',
    modelClass : FloorModel
});

export const rooms = new AjaxStore({
    id         : 'rooms',
    modelClass : RoomModel
});

export const purpose = new AjaxStore({
    id         : 'purpose',
    modelClass : PurposeModel
});

export const equipment = new AjaxStore({
    id         : 'equipment',
    modelClass : EquipmentModel
});
