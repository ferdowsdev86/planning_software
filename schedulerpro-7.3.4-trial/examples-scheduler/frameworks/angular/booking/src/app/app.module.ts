/**
 * App module
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, Injector } from '@angular/core';
import { AppErrorHandler } from './error.handler';
import { AppComponent } from './app.component';
import { BryntumSchedulerProModule } from '@bryntum/schedulerpro-angular';

import { EventTooltipRendererComponent } from './event-tooltip-renderer/event-tooltip-renderer.component';
import { EventRendererComponent } from './event-renderer/event-renderer.component';

// Needed to convert Angular Component to Custom Element
import { createCustomElement } from '@angular/elements';

@NgModule({
    declarations : [
        AppComponent
    ],
    imports : [
        BrowserModule,
        BryntumSchedulerProModule
    ],
    providers : [{ provide : ErrorHandler, useClass : AppErrorHandler }],
    bootstrap : [AppComponent]
})

export class AppModule {
    constructor(injector: Injector) {
        // convert Angular Components to Custom Elements and register them with the browser
        customElements.define('event-tooltip-renderer', createCustomElement(EventTooltipRendererComponent, { injector }));
        customElements.define('event-renderer', createCustomElement(EventRendererComponent, { injector }));
    }
}
