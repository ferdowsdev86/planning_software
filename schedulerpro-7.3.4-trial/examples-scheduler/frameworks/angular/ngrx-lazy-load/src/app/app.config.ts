import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { AppErrorHandler } from './error.handler';
import { schedulerFeatureKey, schedulerReducer } from './store/scheduler.reducer';
import { SchedulerEffects } from './store/scheduler.effects';

// Standalone bootstrap providers (see main.ts): HttpClient, the NgRx store + effects
// (lazy-load cache and backend fetch), and the error handler.
export const appConfig : ApplicationConfig = {
    providers : [
        provideHttpClient(),
        provideStore({ [schedulerFeatureKey] : schedulerReducer }),
        provideEffects([SchedulerEffects]),
        { provide : ErrorHandler, useClass : AppErrorHandler }
    ]
};
