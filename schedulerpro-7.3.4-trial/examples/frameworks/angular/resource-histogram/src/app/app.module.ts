import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppErrorHandler } from './error.handler';

import { BryntumSchedulerProModule } from '@bryntum/schedulerpro-angular';

@NgModule({
    declarations : [AppComponent],
    imports      : [
        BrowserModule,
        BryntumSchedulerProModule
    ],
    providers : [{ provide : ErrorHandler, useClass : AppErrorHandler }],
    bootstrap : [AppComponent]
})
export class AppModule {}
