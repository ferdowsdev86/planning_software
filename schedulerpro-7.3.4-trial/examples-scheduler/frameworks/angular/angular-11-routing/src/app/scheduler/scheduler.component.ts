import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { BryntumSchedulerComponent } from '@bryntum/schedulerpro-angular';
import { Scheduler } from '@bryntum/schedulerpro';
import { schedulerProps } from './scheduler.config';

@Component({
    selector    : 'app-scheduler',
    templateUrl : './scheduler.component.html',
    styleUrls   : ['./scheduler.component.scss']
})
export class SchedulerComponent implements AfterViewInit  {

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent: BryntumSchedulerComponent | undefined;

    scheduler: Scheduler | undefined;
    public schedulerProps = schedulerProps;

    ngAfterViewInit(): void {
        this.scheduler = this.schedulerComponent.instance;
    }
}
