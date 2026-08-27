import { Component, ViewEncapsulation, AfterViewInit, ViewChild } from '@angular/core';
import { BryntumSchedulerProComponent } from '@bryntum/schedulerpro-angular';
import { SchedulerPro, SchedulerEventModel } from '@bryntum/schedulerpro';
import { projectProps, schedulerProProps } from './app.config';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})

export class AppComponent implements AfterViewInit {
    @ViewChild(BryntumSchedulerProComponent) schedulerProComponent!: BryntumSchedulerProComponent;

    private schedulerPro!: SchedulerPro;

    schedulerProProps = schedulerProProps;
    projectProps = projectProps;

    // Hook called by drag creation and when double clicking to add an event. Used here to turn the added event into a parent
    onEventCreated(eventRecord : SchedulerEventModel) : void {
        eventRecord.convertToParent();
    }

    ngAfterViewInit(): void {
        this.schedulerPro = this.schedulerProComponent.instance;
        this.schedulerPro.onEventCreated = this.onEventCreated;
    }
}
