/**
 * App module
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { AppErrorHandler } from './error.handler';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BryntumSchedulerProModule } from '@bryntum/schedulerpro-angular';

@NgModule({
    declarations : [
        AppComponent
    ],
    imports : [
        BrowserModule,
        HttpClientModule,
        BryntumSchedulerProModule
    ],
    providers : [{ provide : ErrorHandler, useClass : AppErrorHandler }],
    bootstrap : [AppComponent]
})

export class AppModule { }

