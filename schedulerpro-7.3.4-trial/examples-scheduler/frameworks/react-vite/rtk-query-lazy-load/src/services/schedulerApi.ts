import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { SchedulerEventModelConfig, SchedulerResourceModelConfig } from '@bryntum/schedulerpro';

/**
 * RTK Query API slice — the single channel from the Scheduler's lazy-loading stores to the
 * backend (the `requestData` handlers dispatch these endpoints; store.ts wires in the slice).
 */

// Relative URL so the demo works wherever it is hosted. In dev a Vite proxy forwards `/php`
// to Apache (see vite.config.ts); in production it resolves to the bundled `php/` folder.
const baseUrl = './php/';

// Resource (vertical) lazy-load query params.
type ResourceQueryParams = {
    startIndex : number
    count      : number
};

// Event (horizontal) lazy-load query params: resource slice + visible date range (YYYY-MM-DD).
type EventQueryParams = {
    startIndex : number
    count      : number
    startDate  : string
    endDate    : string
};

// One generated resource: a Bryntum resource plus this demo's custom `city` field.
type ResourceData = SchedulerResourceModelConfig & { city : string };

// One generated event (maps directly onto Bryntum's event model).
type EventData = SchedulerEventModelConfig;

// Shape returned by resource/read.php. `total` lets the store size the scrollbar.
type ResourceResponse = {
    success : boolean
    data    : ResourceData[]
    total   : number
};

// Shape returned by event/read.php (no total — events are bounded by the date range).
type EventResponse = {
    success : boolean
    data    : EventData[]
};

export const schedulerApi = createApi({
    reducerPath : 'schedulerApi',
    baseQuery   : fetchBaseQuery({ baseUrl }),
    endpoints   : builder => ({
        // GET resource/read.php?startIndex&count → a page of generated resources.
        getResources : builder.query<ResourceResponse, ResourceQueryParams>({
            query : ({ startIndex, count }) => ({
                url    : 'resource/read.php',
                params : { startIndex, count }
            })
        }),
        // GET event/read.php → events for the visible resource window within the date range.
        getEvents : builder.query<EventResponse, EventQueryParams>({
            query : ({ startIndex, count, startDate, endDate }) => ({
                url    : 'event/read.php',
                params : { startIndex, count, startDate, endDate }
            })
        })
    })
});
