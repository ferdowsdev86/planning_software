import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { SchedulerApiService } from '../services/scheduler-api';
import * as SchedulerActions from './scheduler.actions';

// Effects are the side-effecting bridge between actions and the backend: they listen for
// the `load*` actions dispatched by the Scheduler's `requestData` handlers, call the PHP
// endpoints through SchedulerApiService, and feed the result back as `loadSuccess`.
//
// `actions$`/`api` use inject() and are declared before the effects: createEffect() runs its
// factory during field initialization, when constructor parameter properties aren't set yet.
@Injectable()
export class SchedulerEffects {
    private actions$ = inject(Actions);
    private api = inject(SchedulerApiService);

    // Vertical axis: fetch a window of resources.
    loadResources$ = createEffect(() => this.actions$.pipe(
        ofType(SchedulerActions.loadResources),
        mergeMap(({ key, startIndex, count }) =>
            this.api.getResources(startIndex, count).pipe(
                map(res => SchedulerActions.loadSuccess({ key, data : res.data ?? [], total : res.total ?? 0 })),
                catchError(error => of(SchedulerActions.loadFailure({ key, error : String(error?.message ?? error) })))
            )
        )
    ));

    // Horizontal axis: fetch events for the visible resource window within a date range.
    loadEvents$ = createEffect(() => this.actions$.pipe(
        ofType(SchedulerActions.loadEvents),
        mergeMap(({ key, startIndex, count, startDate, endDate }) =>
            this.api.getEvents(startIndex, count, startDate, endDate).pipe(
                map(res => {
                    const data = res.data ?? [];
                    return SchedulerActions.loadSuccess({ key, data, total : data.length });
                }),
                catchError(error => of(SchedulerActions.loadFailure({ key, error : String(error?.message ?? error) })))
            )
        )
    ));
}
