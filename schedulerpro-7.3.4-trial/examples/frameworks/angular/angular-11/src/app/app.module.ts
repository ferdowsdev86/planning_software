import { BrowserModule } from '@angular/platform-browser';
import { BryntumSchedulerProModule } from '@bryntum/schedulerpro-angular';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

@NgModule({
    declarations : [AppComponent],
    imports      : [BrowserModule, BryntumSchedulerProModule, FormsModule],
    providers    : [],
    bootstrap    : [AppComponent]
})
export class AppModule {}
