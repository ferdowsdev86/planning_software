import { NgModule, ErrorHandler, Injector } from '@angular/core';
import { AppErrorHandler } from './error.handler';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { BryntumSchedulerProModule } from '@bryntum/schedulerpro-angular';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SchedulerComponent } from './scheduler/scheduler.component';
import { TooltipRendererComponent } from './tooltip-renderer/tooltip-renderer.component';

// Needed to convert Angular Component to Custom Element
import { createCustomElement } from '@angular/elements';

@NgModule({
    declarations : [
        AppComponent,
        HomeComponent,
        SchedulerComponent,
        TooltipRendererComponent
    ],
    imports   : [BrowserModule, AppRoutingModule, BryntumSchedulerProModule],
    providers : [{ provide : ErrorHandler, useClass : AppErrorHandler }],
    bootstrap : [AppComponent]
})
export class AppModule {
    constructor(injector:Injector) {
        customElements.define('tooltip-renderer', createCustomElement(TooltipRendererComponent, { injector }));
    }
}
