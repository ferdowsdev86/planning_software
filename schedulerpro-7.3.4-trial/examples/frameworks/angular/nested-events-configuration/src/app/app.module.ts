import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BryntumSchedulerProModule } from '@bryntum/schedulerpro-angular';
import { AppComponent } from './app.component';

@NgModule({
    declarations : [AppComponent],
    imports      : [BrowserModule, BryntumSchedulerProModule],
    providers    : [],
    bootstrap    : [AppComponent]
})
export class AppModule {}
