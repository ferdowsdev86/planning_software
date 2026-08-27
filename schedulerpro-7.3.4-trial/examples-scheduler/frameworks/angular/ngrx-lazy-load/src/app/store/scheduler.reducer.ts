import { createReducer, on } from '@ngrx/store';
import * as SchedulerActions from './scheduler.actions';
import type { EventData, ResourceData } from './scheduler.actions';

export const schedulerFeatureKey = 'schedulerpro';

// One cache entry per unique request (keyed by its params in the action `key`),
// mirroring RTK Query's cache-by-arg. `requestData` dispatches a load action (which
// flips `loading` on) and then reads this entry once `loading` flips back off.
export interface CacheEntry {
    loading : boolean;
    data    : (ResourceData | EventData)[];
    total   : number;
    error   : string | null;
}

export interface SchedulerState {
    entries : Record<string, CacheEntry>;
}

export const initialState : SchedulerState = {
    entries : {}
};

export const schedulerReducer = createReducer(
    initialState,

    // A load starts: mark the entry loading, keeping any previously cached data so the
    // store can still serve it while the (re)fetch is in flight.
    on(SchedulerActions.loadResources, SchedulerActions.loadEvents, (state, { key }) => ({
        ...state,
        entries : {
            ...state.entries,
            [key] : {
                loading : true,
                data    : state.entries[key]?.data ?? [],
                total   : state.entries[key]?.total ?? 0,
                error   : null
            }
        }
    })),

    on(SchedulerActions.loadSuccess, (state, { key, data, total }) => ({
        ...state,
        entries : {
            ...state.entries,
            [key] : { loading : false, data, total, error : null }
        }
    })),

    on(SchedulerActions.loadFailure, (state, { key, error }) => ({
        ...state,
        entries : {
            ...state.entries,
            [key] : { loading : false, data : [], total : 0, error }
        }
    }))
);
