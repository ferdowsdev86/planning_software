import { EventModel, DateHelper } from '@bryntum/schedulerpro';

export class EventWithBoundaries extends EventModel {

    declare minStartTime: number;
    declare maxEndTime: number;
    declare durationUnit: string;

    static fields = [
        { name : 'minStartTime', type : 'number' },
        { name : 'maxEndTime', type : 'number' },
        { name : 'durationUnit', defaultValue : 'h' }
    ];

    get minStartDate() {
        if (this.minStartTime) {
            const start = DateHelper.startOf(this.startDate as Date);

            start.setHours(this.minStartTime);

            return start;
        }
        return undefined;
    }

    get maxEndDate() {
        if (this.maxEndTime) {

            const end = DateHelper.startOf(this.endDate as Date);

            end.setHours(this.maxEndTime);

            return end;
        }
        return undefined;
    }
}
