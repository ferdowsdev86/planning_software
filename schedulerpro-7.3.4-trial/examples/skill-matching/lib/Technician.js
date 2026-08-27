import ResourceModel from '../../../lib/SchedulerPro/model/ResourceModel.js';
import DateHelper from '../../../lib/Core/helper/DateHelper.js';

// Custom Technician resource model, based on ResourceModel with additional fields
export default class Technician extends ResourceModel {
    static fields = [
        { name : 'id', description : 'Unique identifier' },
        { name : 'name', description : 'The name of the technician' },
        { name : 'skillIds', type : 'array', defaultValue : [] },
        { name : 'skills' },
        { name : 'type', description : 'The type of resource (e.g. Mechanics, Technicians)' },
        { name : 'hoursPerDay', defaultValue : 8, description : 'The maximum hours a resource is allowed to work per day. Always take this number into account when rescheduling or reassigning tasks to another resource.' },
        { name : 'hoursPerWeek', defaultValue : 40, description : 'The maximum hours a resource is allowed to work per week. Always take this number into account when rescheduling or reassigning tasks to another resource.' }
    ];

    getBookedHours(startDate, endDate) {
        let total = 0;
        this.events.forEach(eventRecord => {
            if (DateHelper.intersectSpans(eventRecord.startDate, eventRecord.endDate, startDate, endDate)) {
                total += eventRecord.duration;
            }
        });

        return total;
    }

    canPerformTask(taskRecord, startDate) {
        const
            {
                skillIds : requiredSkills,
                calendar
            }                     = taskRecord,
            endDate               = startDate && DateHelper.add(startDate, taskRecord.duration, taskRecord.durationUnit),
            skillsMatch           = !requiredSkills || requiredSkills.every(skillId => this.skillIds?.includes(skillId)),
            hasEnoughAvailability = Boolean(!startDate || this.getFirstAvailableTimeSlot(startDate, taskRecord));

        return skillsMatch && (!startDate || (
            // Respect technician working time
            (!calendar || calendar.isWorkingTime(startDate, endDate, true)))) &&
            hasEnoughAvailability;
    }

    get skills() {
        const skillStore = this.firstStore?.crudManager.getCrudStore('skills');
        return skillStore && this.skillIds ? skillStore.getByIds(this.skillIds) : [];
    }

    get skillNames() {
        return this.skills?.map(s => s.name) || '';
    }

    getEventsForDay(date) {
        return this.getEventsInRange(date, DateHelper.add(date, 1, 'day'));
    }

    getEventsInRange(startDate, endDate) {
        return this.events.filter(eventRecord => DateHelper.intersectSpans(startDate, endDate, eventRecord.startDate, eventRecord.endDate));
    }

    getFirstAvailableTimeSlot(date, taskRecord) {
        date = DateHelper.clearTime(date);

        const availabilityRange = this.effectiveCalendar.getWorkingTimeRanges(date, DateHelper.add(date, 1, 'day'))[0];

        if (availabilityRange) {
            let eventsOnDate = this.getEventsForDay(date);

            if (DateHelper.isSameDate(taskRecord.startDate, date)) {
                eventsOnDate = eventsOnDate.filter(ev => ev !== taskRecord);
            }

            const
                nextStartSlot          = eventsOnDate[eventsOnDate.length - 1]?.endDate || availabilityRange.startDate,
                remainingAvailableTime = availabilityRange.endDate - nextStartSlot;

            if (remainingAvailableTime >= taskRecord.durationMS) {
                return nextStartSlot;
            }
        }
    }
}
