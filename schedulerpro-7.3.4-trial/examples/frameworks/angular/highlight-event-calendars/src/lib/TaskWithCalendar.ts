import { type CalendarModel, DateHelper, EventModel, StringHelper, type CalendarIntervalModel } from '@bryntum/schedulerpro';

// A custom task class with a few extra fields
export default class TaskWithCalendar extends EventModel {
    declare requiredRole: string;
    declare patient: string;
    declare confirmed: boolean;

    static override get fields() {
        return [
            'patient',
            'confirmed',
            'requiredRole',
            // override field defaultValue to hours
            { name : 'durationUnit', defaultValue : 'h' }
        ];
    }

    get firstCalendarInterval(): CalendarIntervalModel {
        return (this.calendar as CalendarModel)?.intervalStore.first as CalendarIntervalModel;
    }

    get calendarInfo() {
        const { calendar, firstCalendarInterval } = this;

        if (firstCalendarInterval.isRecurrent()) {
            return StringHelper.encodeHtml((calendar as CalendarModel).name);
        }
        return DateHelper.format(firstCalendarInterval.startDate as Date, 'MMM Do') + ' - ' +
            DateHelper.format(this.firstCalendarInterval.endDate as Date, 'MMM Do');
    }
}
