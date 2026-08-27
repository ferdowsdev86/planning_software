import { DateHelper } from '@bryntum/schedulerpro';
import type { SchedulerEventStoreConfig, LazyLoadRequestParams } from '@bryntum/schedulerpro';
import type { BryntumSchedulerProps } from '@bryntum/schedulerpro-react';
import { store } from './store/store';
import { schedulerApi } from './services/schedulerApi';
import { AppResourceModel } from './lib/AppResourceModel';

// Scheduler configuration for the demo: lazy-loads resources (vertical axis) and
// events (horizontal axis) on demand through RTK Query (see schedulerApi.ts), with
// the timeline centered on the current date.

// Center the timeline on today; the backend generates data for any date range.
const today = DateHelper.clearTime(new Date());

export const schedulerProps : BryntumSchedulerProps = {
    startDate : DateHelper.add(today, -1, 'month'),
    endDate   : DateHelper.add(today, 2, 'month'),

    // Infinite timeline + resource scroll: events load per visible date range (horizontal),
    // resources load per visible row window (vertical).
    infiniteScroll : true,
    visibleDate    : { date : today, block : 'center' },

    resourceStore : {
        modelClass : AppResourceModel,
        lazyLoad   : true,
        autoLoad   : true,

        async requestData(params) {
            const { startIndex, count } = params as LazyLoadRequestParams;
            // We're outside React (no hooks), so run the endpoint imperatively via initiate().
            // `subscribe: false` keeps it a one-shot read.
            const result = await store.dispatch(
                schedulerApi.endpoints.getResources.initiate({ startIndex, count }, { subscribe : false })
            );
            // Throw on failure so the error surfaces immediately instead of a silent [].
            if (result.error) {
                throw new Error(`Failed to load resources: ${'status' in result.error ? result.error.status : result.error.message}`);
            }
            return { data : result.data?.data ?? [], total : result.data?.total ?? 0 };
        }
    },

    eventStore : {
        lazyLoad : true,

        async requestData(params) {
            const { startIndex, count, startDate, endDate } = params as LazyLoadRequestParams;
            // One-shot imperative read with `subscribe: false` (see resourceStore above).
            const result = await store.dispatch(
                schedulerApi.endpoints.getEvents.initiate({
                    startIndex,
                    count,
                    startDate : DateHelper.format(startDate!, 'YYYY-MM-DD'),
                    endDate   : DateHelper.format(endDate!, 'YYYY-MM-DD')
                }, { subscribe : false })
            );
            // Surface backend failures rather than hiding them (see resourceStore above).
            if (result.error) {
                throw new Error(`Failed to load events: ${'status' in result.error ? result.error.status : result.error.message}`);
            }
            const data = result.data?.data ?? [];
            return { data, total : data.length };
        }
    } satisfies SchedulerEventStoreConfig,

    resourceImagePath : 'users/',

    columns : [
        {
            type  : 'resourceInfo',
            text  : 'Name',
            width : 200,
            // avoid showing misleading event count - events are lazy-loaded
            showEventCount : false
        },
        {
            type  : 'column',
            text  : 'City',
            field : 'city',
            width : 120
        }
    ],

    // Working time is shown client-side (weekends shaded) instead of lazy loading
    // resource time ranges from the backend.
    nonWorkingTimeFeature : true
};
