import { configureStore } from '@reduxjs/toolkit';
import { schedulerApi } from '../services/schedulerApi';

/**
 * The Redux store for the demo. The RTK Query slice contributes both the cached query state
 * (reducer) and the middleware that runs the `initiate()` fetches dispatched from AppConfig
 * and handles caching/refetching - appended to the default middleware.
 */
export const store = configureStore({
    reducer : {
        [schedulerApi.reducerPath] : schedulerApi.reducer
    },
    middleware : getDefaultMiddleware =>
        getDefaultMiddleware().concat(schedulerApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
