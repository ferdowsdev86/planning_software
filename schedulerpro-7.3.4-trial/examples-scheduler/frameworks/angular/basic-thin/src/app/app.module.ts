/**
 * App component module
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { AppErrorHandler } from './error.handler';

import { BryntumCoreModule } from '@bryntum/core-angular-thin';
import { BryntumGridModule } from '@bryntum/grid-angular-thin';
import { BryntumSchedulerModule } from '@bryntum/scheduler-angular-thin';

import { AppComponent } from './app.component';

@NgModule({
    declarations : [
        AppComponent
    ],
    imports : [
        BrowserModule,
        BryntumCoreModule,
        BryntumGridModule,
        BryntumSchedulerModule
    ],
    providers : [{ provide : ErrorHandler, useClass : AppErrorHandler }],
    bootstrap : [AppComponent]
})
export class AppModule { }
