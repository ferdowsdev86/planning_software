// Define a new store extending standard ResourceTimeRangeStore
// with RecurringTimeSpansMixin mixin to add recurrence support to the store.
// This store will contain resource time ranges.
import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import ResourceTimeRangeStore from '../../../lib/Scheduler/data/ResourceTimeRangeStore.js';
import ResourceTimeRangeModel from '../../../lib/Scheduler/model/ResourceTimeRangeModel.js';

// so we make a special model extending standard ResourceTimeRangeModel
// with RecurringTimeSpan which adds recurrence support
class DailyRateModel extends ResourceTimeRangeModel {
    static fields = [
        { name : 'pricePerNight', type : 'number' }
    ];

    get name() {
        return this.pricePerNight ? `$${this.pricePerNight}` : '';
    }
}

export default class DailyRateStore extends ResourceTimeRangeStore {
    static configurable = {
        // Configure store to use our new DailyRateModel model
        modelClass : DailyRateModel
    };

    getPricePerNightFor(property, date) {
        const dayModel = this.getRanges({
            resourceRecord : property,
            startDate      : date,
            endDate        : DateHelper.add(date, 1, 'day')
        })?.[0];

        return dayModel?.pricePerNight;
    }
}
