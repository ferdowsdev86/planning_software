// Define a new store extending standard ResourceTimeRangeStore
// with RecurringTimeSpansMixin mixin to add recurrence support to the store.
// This store will contain resource time ranges.
// So we make a special model extending standard ResourceTimeRangeModel

import { DateHelper, ResourceTimeRangeModel, ResourceTimeRangeStore } from '@bryntum/schedulerpro';
import type { PropertyModel } from './PropertyModel';

export class DailyRateModel extends ResourceTimeRangeModel {
    declare pricePerNight: number;

    static override fields = [
        { name : 'pricePerNight', type : 'number' }
    ];
}

export class DailyRateStore extends ResourceTimeRangeStore {
    declare pricePerNight: number;

    static fields = [
        { name : 'pricePerNight', type : 'number' }
    ];

    getPricePerNightFor(property: PropertyModel, date: Date) {
        const dayModel = this.getRanges({
            resourceRecord : property,
            startDate      : date,
            endDate        : DateHelper.add(date, 1, 'day')
        })?.[0];

        return (dayModel as DailyRateModel)?.pricePerNight;
    }
}
