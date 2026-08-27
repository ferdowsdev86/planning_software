import { ResourceModel } from '@bryntum/schedulerpro';

export class AppResource extends ResourceModel {

    declare duration: number;

    static fields = [
        { name : 'city', type : 'string' },
        { name : 'genre', type : 'string' },
        { name : 'country', type : 'string' },
        { name : 'productionCompany', type : 'string' },
        { name : 'duration', type : 'number' }
    ];

    get durationDate(): Date {
        const date = new Date();
        date.setHours(0, this.duration, 0, 0);
        return date;
    }

}

export class Movie extends AppResource {
    declare duration: number;
    declare city: string;
    declare country: string;
    declare productionCompany: string;
    declare genre: string;
}

export class Cinema extends AppResource {
    declare city: string;
}
