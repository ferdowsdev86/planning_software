import EventModel from '../../../lib/SchedulerPro/model/EventModel.js';
import DateHelper from '../../../lib/Core/helper/DateHelper.js';

export default class EventWithBoundaries extends EventModel {
    static get fields() {
        return [
            'minStartTime',
            'maxEndTime',

            // override field defaultValue to hours
            { name : 'durationUnit', defaultValue : 'h' }
        ];
    }

    get minStartDate() {
        if (this.minStartTime) {
            const start = DateHelper.startOf(this.startDate);

            start.setHours(this.minStartTime);

            return start;
        }
    }

    get maxEndDate() {
        if (this.maxEndTime) {

            const end = DateHelper.startOf(this.endDate);

            end.setHours(this.maxEndTime);

            return end;
        }
    }
}
