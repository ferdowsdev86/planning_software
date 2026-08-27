import { DateHelper } from '@bryntum/schedulerpro';
import type { SchedulerEventStoreConfig, LazyLoadRequestParams } from '@bryntum/schedulerpro';
import type { BryntumSchedulerProps } from '@bryntum/schedulerpro-angular';
import type { Store } from '@ngrx/store';
import { filter, firstValueFrom, take } from 'rxjs';
import { AppResourceModel } from './lib/app-resource';
import * as SchedulerActions from './store/scheduler.actions';
import { selectEntry } from './store/scheduler.selectors';

const today = DateHelper.clearTime(new Date());

// A factory so it can receive the injected NgRx Store: each `requestData` dispatches a load
// action and awaits the matching cache entry (keyed by params) the effect fills.
export const createSchedulerProps = (store : Store) => {
    // `satisfies` keeps the precise inferred type so the template can bind without `!`.
    return {
        startDate : DateHelper.add(today, -1, 'month'),
        endDate   : DateHelper.add(today, 2, 'month'),

        // Lets events load per visible date range and resources per visible row window.
        infiniteScroll : true,
        visibleDate    : { date : today, block : 'center' },

        resourceStore : {
            modelClass : AppResourceModel,
            lazyLoad   : true,
            autoLoad   : true,

            async requestData(params) {
                const
                    { startIndex, count } = params as LazyLoadRequestParams,
                    key                   = `resources:${startIndex}:${count}`;

                store.dispatch(SchedulerActions.loadResources({ key, startIndex, count }));

                const result = await firstValueFrom(
                    store.select(selectEntry(key)).pipe(filter(e => !e.loading), take(1))
                );
                // Throw so the Scheduler reports a load failure (via AppErrorHandler) instead
                // of silently rendering an empty result.
                if (result.error) {
                    throw new Error(result.error);
                }
                return { data : result.data, total : result.total };
            }
        },

        eventStore : {
            lazyLoad : true,

            async requestData(params) {
                const
                    { startIndex, count, startDate, endDate } = params as LazyLoadRequestParams,
                    start                                     = DateHelper.format(startDate!, 'YYYY-MM-DD'),
                    end                                       = DateHelper.format(endDate!, 'YYYY-MM-DD'),
                    key                                       = `events:${startIndex}:${count}:${start}:${end}`;

                store.dispatch(SchedulerActions.loadEvents({ key, startIndex, count, startDate : start, endDate : end }));

                const result = await firstValueFrom(
                    store.select(selectEntry(key)).pipe(filter(e => !e.loading), take(1))
                );
                // Throw to surface load failures (see resourceStore above).
                if (result.error) {
                    throw new Error(result.error);
                }
                return { data : result.data, total : result.total };
            }
        } satisfies SchedulerEventStoreConfig,

        // Base path the resourceInfo column resolves each resource's `image` against.
        resourceImagePath : 'assets/users/',

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

        // Shade weekends client-side rather than lazy loading time ranges from the backend.
        nonWorkingTimeFeature : true
    } satisfies BryntumSchedulerProps;
};
