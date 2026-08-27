import { QueryClient } from '@tanstack/vue-query';

/**
 * The Scheduler's `requestData` runs outside Vue (no inject context), so it can't use the
 * `useQuery`/`useQueryClient()` composables - it imports this client and calls `fetchQuery`
 * directly. `retry: false` makes a failed lazy load surface immediately.
 */
export const queryClient = new QueryClient({
    defaultOptions : {
        queries : {
            retry : false
        }
    }
});
