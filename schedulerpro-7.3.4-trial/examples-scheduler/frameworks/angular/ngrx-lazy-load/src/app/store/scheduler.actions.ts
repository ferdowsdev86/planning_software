import { createAction, props } from '@ngrx/store';
import type { SchedulerEventModelConfig, SchedulerResourceModelConfig } from '@bryntum/schedulerpro';

// NgRx actions for the demo's lazy loading. Each lazy request the Scheduler makes is
// turned into a `load*` action; an effect performs the HTTP call and dispatches a
// `loadSuccess`/`loadFailure` keyed by the originating request (see scheduler.effects.ts).

// One generated resource as sent by generateResources in generator.php: a standard
// Bryntum resource plus this demo's custom `city` field.
export type ResourceData = SchedulerResourceModelConfig & { city : string };

// One generated event as sent by generateEvents in generator.php. All fields map
// directly onto Bryntum's event model, so the config type describes it as-is.
export type EventData = SchedulerEventModelConfig;

// Resource (vertical) lazy load — the slice of rows to fetch. `key` uniquely identifies
// the request so its result can be cached and awaited (mirrors RTK Query's cache-by-arg).
export const loadResources = createAction(
    '[Scheduler] Load Resources',
    props<{ key : string, startIndex : number, count : number }>()
);

// Event (horizontal) lazy load — the resource slice plus the visible date range
// (ISO `YYYY-MM-DD` strings).
export const loadEvents = createAction(
    '[Scheduler] Load Events',
    props<{ key : string, startIndex : number, count : number, startDate : string, endDate : string }>()
);

// Shared success/failure, keyed by the request that triggered them.
export const loadSuccess = createAction(
    '[Scheduler] Load Success',
    props<{ key : string, data : (ResourceData | EventData)[], total : number }>()
);

export const loadFailure = createAction(
    '[Scheduler] Load Failure',
    props<{ key : string, error : string }>()
);
