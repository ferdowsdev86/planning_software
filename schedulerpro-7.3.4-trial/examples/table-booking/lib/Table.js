import ResourceModel from '../../../lib/SchedulerPro/model/ResourceModel.js';
import DateHelper from '../../../lib/Core/helper/DateHelper.js';

export default class Table extends ResourceModel {
    static $name = 'Table';

    static fields = [
        { name : 'seats' },
        { name : 'room' },
        { name : 'name', convert : (val, data) => data?.id }
    ];

    /*
     * Gets the next event for a resource, after the passed date, optionally skipping any ongoing event
     * @param {Scheduler.model.ResourceModel} resourceRecord The resource
     * @param {Object} options
     * @param {Date} [options.startDate=now] The date to search from, defaults to current date/time
     * @param {Date} [options.endDate] The end date to search to, defaults to one year from startDate
     * @param {Boolean} [options.ignoreOngoing=false] `true` to ignore ongoing events in the search
     * @returns {Scheduler.model.EventModel|null} The next event or `null`
     */
    getOngoingOrNextEvent(options = {}) {
        const
            { eventStore } = this,
            now = new Date(),
            {
                startDate     = now,
                endDate       = DateHelper.add(options.startDate || now, 1, 'year'),
                ignoreOngoing = false
            }              = options;

        if (!this.events.length) {
            return null;
        }

        if (!ignoreOngoing) {
            // Check if there's an event that is already in progress
            const ongoing = eventStore.getEvents({
                resourceRecord     : this,
                startDate,
                endDate,
                includeOccurrences : false,
                allowPartial       : true
            });

            if (ongoing.length) {
                return ongoing.sort((a, b) => a.endDate - b.endDate)[0];
            }
        }

        // Otherwise the nearest future start
        const upcomingEvents = eventStore.getEvents({
            resourceRecord     : this,
            startDate,
            endDate,
            includeOccurrences : false,
            allowPartial       : false
        }).sort((a, b) => a.startDate - b.startDate);

        return upcomingEvents[0] || null;
    }

    get ongoingOrNextReservation() {
        const { referenceDate } = this;

        return this.getOngoingOrNextEvent({
            startDate : referenceDate,
            endDate   : DateHelper.getStartOfNextDay(referenceDate, true)
        });
    }

    get nextGuestName() {
        return this.ongoingOrNextReservation?.reservedBy;
    }

    get nextReservationNbrGuests() {
        return this.ongoingOrNextReservation?.nbrGuests;
    }

    get nextReservationStart() {
        return this.ongoingOrNextReservation?.startDate;
    }

    get nextGuestCC() {
        return this.ongoingOrNextReservation?.creditCard;
    }

    get referenceDate() {
        return this.stores[0].eventStore.crudManager.timeRangeStore.first.startDate;
    }
}
