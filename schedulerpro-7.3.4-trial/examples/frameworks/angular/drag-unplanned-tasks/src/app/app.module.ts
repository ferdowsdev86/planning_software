import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BryntumSchedulerProModule } from '@bryntum/schedulerpro-angular';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations : [
        AppComponent
    ],
    imports : [
        BrowserModule,
        BryntumSchedulerProModule,
        FormsModule
    ],
    providers : [],
    bootstrap : [AppComponent]
})
export class AppModule {}
