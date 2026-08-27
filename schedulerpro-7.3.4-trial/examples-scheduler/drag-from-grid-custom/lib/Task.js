import SchedulerEventModel from '../../../lib/Scheduler/model/EventModel.js';
import DateHelper from '../../../lib/Core/helper/DateHelper.js';
export default class Task extends SchedulerEventModel {

    static $name = 'Task';

    static fields = [
        { name : 'icon', defaultValue : 'fa fa-asterisk' }
    ];

    static defaults = {
        // In this demo, default duration for tasks will be hours (instead of days)
        durationUnit : 'h',

        // Use a default name, for better look in the grid if unassigning a new event
        name : 'New event'
    };

    get eventStartEndTimeString() {
        return `${DateHelper.format(this.startDate, 'LT')} - ${DateHelper.format(this.endDate, 'LT')}`;
    }
}
