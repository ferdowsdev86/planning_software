import { DateHelper } from '@bryntum/schedulerpro';
import type { SchedulerEventStoreConfig, LazyLoadRequestParams } from '@bryntum/schedulerpro';
import { type BryntumSchedulerProps } from '@bryntum/schedulerpro-vue-3';
import { fetchEvents, fetchResources } from './services/schedulerApi';
import { AppResourceModel } from './lib/AppResourceModel';

// Scheduler configuration for the demo: lazy-loads resources (vertical axis) and
// events (horizontal axis) on demand through TanStack Query (see schedulerApi.ts), with
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
            // Runs the fetch through TanStack Query (cached/deduped); awaiting resolves
            // to the response.
            const result = await fetchResources({ startIndex, count });
            return { data : result.data ?? [], total : result.total ?? 0 };
        }
    },

    eventStore : {
        lazyLoad : true,

        async requestData(params) {
            const { startIndex, count, startDate, endDate } = params as LazyLoadRequestParams;
            // Runs the fetch through TanStack Query (cached/deduped); awaiting resolves
            // to the response.
            const result = await fetchEvents({
                startIndex,
                count,
                startDate : DateHelper.format(startDate!, 'YYYY-MM-DD'),
                endDate   : DateHelper.format(endDate!, 'YYYY-MM-DD')
            });
            const data = result.data ?? [];
            return { data, total : data.length };
        }
    } satisfies SchedulerEventStoreConfig,

    // Where resource avatar images live (served from public/users; the avatar
    // filename comes from each resource's `image` field). The resourceInfo column
    // renders the avatar, falling back to name initials if an image is missing.
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
