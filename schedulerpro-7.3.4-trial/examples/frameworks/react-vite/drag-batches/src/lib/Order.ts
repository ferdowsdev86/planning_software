import { EventStore, GridRowModel, Model, ProjectModel, Store } from '@bryntum/schedulerpro';
import { Machine } from './Machine';
import { Task } from './Task';
import { Template } from './Template';

let orderCount = 1010;

export class Order extends Model {

    declare stores: Store[];

    declare type: string;
    declare name: string;
    declare size: number;
    declare customer: string;
    declare firstTaskId: string | number;
    declare lastTaskId: string | number;

    static fields = [
        'type',
        'name',
        { name : 'size', type : 'number' },
        'customer',
        'firstTaskId',
        'lastTaskId'
    ];

    get tasks(): Task[] {
        return this.children as Task[];
    }

    get project(): ProjectModel {
        return (this.stores[0] as any).crudManager;
    }

    get template(): Template {
        return this.project.getCrudStore('templates').getById(this.type) as Template;
    }

    get templateName(): string {
        return this.template?.name;
    }

    get orderStartMachine(): Machine {
        return this.project.resourceStore.getById(this.template.children[0]?.resourceId) as Machine;
    }

    get isScheduled(): boolean {
        return Boolean(this.firstTask?.startDate);
    }

    get startDate(): Date {
        return this.firstTask?.startDate as Date;
    }

    get finishDate(): Date {
        return this.lastTask?.endDate as Date;
    }

    get firstTask(): Task {
        return (this.firstTaskId
            ? this.project.eventStore.getById(this.firstTaskId)
            : this.template?.firstChild) as Task;
    }

    get lastTask(): Task {
        return (this.lastTaskId
            ? this.project.eventStore.getById(this.lastTaskId)
            : this.template?.lastChild) as Task;
    }

    static generateNewOrderId() {
        return orderCount++;
    }
}
