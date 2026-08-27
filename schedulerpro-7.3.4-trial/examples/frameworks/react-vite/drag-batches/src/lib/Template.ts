import { Model } from '@bryntum/schedulerpro';

export class TemplateChild extends Model {

    declare name: string;
    declare resourceId: string;
    declare duration: number;

    static fields = [
        { name : 'name', type : 'string' },
        { name : 'resourceId', type : 'string' },
        { name : 'duration', type : 'number' }
    ];
}

export class Template extends Model {

    declare name: string;
    declare capacity: number;
    declare running: boolean;
    declare statusMessage: string;

    declare children: TemplateChild[];

    static fields = [
        { name : 'name', type : 'string' },
        { name : 'capacity', type : 'number' },
        { name : 'running', type : 'boolean' },
        { name : 'statusMessage', type : 'string' }
    ];
}
