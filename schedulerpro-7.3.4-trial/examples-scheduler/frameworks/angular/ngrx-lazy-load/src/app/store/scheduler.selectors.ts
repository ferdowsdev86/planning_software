import { createFeatureSelector, createSelector } from '@ngrx/store';
import { schedulerFeatureKey } from './scheduler.reducer';
import type { SchedulerState } from './scheduler.reducer';

const selectSchedulerState = createFeatureSelector<SchedulerState>(schedulerFeatureKey);

// Selects the cache entry for a given request key. `requestData` subscribes to this and
// waits until the entry exists and is no longer loading.
export const selectEntry = (key : string) => createSelector(
    selectSchedulerState,
    state => state.entries[key]
);
