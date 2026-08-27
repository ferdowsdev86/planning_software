import type { SchedulerEventModelConfig, SchedulerResourceModelConfig } from '@bryntum/schedulerpro';
import { queryClient } from '../queryClient';

/**
 * TanStack Query data layer — the single channel from the Scheduler's lazy-loading stores to
 * the backend (the `requestData` handlers call `fetchResources`/`fetchEvents`, cached by key).
 */

// Relative so the demo works wherever it's hosted (dev: Vite proxies to Apache; prod: bundled).
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

// Builds `baseUrl + path?query` from a params object (all values stringified).
function buildUrl(path : string, params : Record<string, string | number>) : string {
    const query = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
    );
    return `${baseUrl}${path}?${query}`;
}

// `fetch` only rejects on network errors, so throw on a non-OK status too — the rejection
// reaches `requestData` and makes the Scheduler report a load failure instead of a silent [].
function readJson<T>(response : Response) : Promise<T> {
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

// GET resource/read.php?startIndex&count → a page of generated resources.
function getResources({ startIndex, count } : ResourceQueryParams) : Promise<ResourceResponse> {
    return fetch(buildUrl('resource/read.php', { startIndex, count })).then(r => readJson<ResourceResponse>(r));
}

// GET event/read.php → events for the visible resource window within the date range.
function getEvents({ startIndex, count, startDate, endDate } : EventQueryParams) : Promise<EventResponse> {
    return fetch(buildUrl('event/read.php', { startIndex, count, startDate, endDate })).then(r => readJson<EventResponse>(r));
}

// Imperative fetches for AppConfig's `requestData` — outside a component, so no composables.
// `fetchQuery` resolves to the result and caches it by key.
export function fetchResources(params : ResourceQueryParams) : Promise<ResourceResponse> {
    return queryClient.fetchQuery({
        queryKey : ['resources', params],
        queryFn  : () => getResources(params)
    });
}

export function fetchEvents(params : EventQueryParams) : Promise<EventResponse> {
    return queryClient.fetchQuery({
        queryKey : ['events', params],
        queryFn  : () => getEvents(params)
    });
}
