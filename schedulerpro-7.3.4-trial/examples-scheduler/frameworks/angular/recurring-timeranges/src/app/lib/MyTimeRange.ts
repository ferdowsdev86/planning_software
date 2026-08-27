import { RecurringTimeSpan, TimeSpan, RecurringTimeSpansMixin, Store } from '@bryntum/schedulerpro';

// Define a new Model extending TimeSpan class
// with RecurringTimeSpan mixin which adds recurrence support
export class MyTimeRange extends RecurringTimeSpan(TimeSpan) {}

// Define a new store extending the Store class
// with RecurringTimeSpansMixin mixin to add recurrence support to the store.
// This store will contain time ranges.
export class MyTimeRangeStore extends RecurringTimeSpansMixin(Store) {
    static configurable: object = {
        // use our new MyTimeRange model
        modelClass : MyTimeRange,
        id         : 'timeRanges'
    };
}
