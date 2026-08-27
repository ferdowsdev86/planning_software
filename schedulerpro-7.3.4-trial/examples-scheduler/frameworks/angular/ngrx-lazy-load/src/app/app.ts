import { Component, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { BryntumSchedulerProModule } from '@bryntum/schedulerpro-angular';
import { createSchedulerProps } from './scheduler.config';

@Component({
    // Standalone component (no NgModule). BryntumSchedulerProModule exports both the
    // <bryntum-scheduler> and <bryntum-demo-header> components used in the template.
    selector      : 'app-root',
    imports       : [BryntumSchedulerProModule],
    templateUrl   : './app.html',
    styleUrl      : './app.scss',
    encapsulation : ViewEncapsulation.None
})
export class AppComponent {
    // Precise type inferred from the factory's `satisfies` return — all props are present,
    // so the template binds them without `!`.
    schedulerProps : ReturnType<typeof createSchedulerProps>;

    // The Store is injected here (DI is available in the component) and handed to the
    // config factory, so the lazy-loading stores can dispatch/await NgRx state.
    constructor(store : Store) {
        this.schedulerProps = createSchedulerProps(store);
    }
}
