/**
 * App module
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { AppErrorHandler } from './error.handler';
import { BryntumSchedulerProModule } from '@bryntum/schedulerpro-angular';

import { AppComponent } from './app.component';

@NgModule({
    declarations : [],
    imports      : [
        BrowserModule,
        BryntumSchedulerProModule,
        AppComponent
    ],
    providers : [{ provide : ErrorHandler, useClass : AppErrorHandler }]
})

export class AppModule {}
