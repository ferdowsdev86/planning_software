import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Scheduler } from '@bryntum/scheduler-thin';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular-thin';
import { schedulerProps } from './app.config';

@Component({
    standalone    : false,
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.ShadowDom
})
export class AppComponent implements AfterViewInit {

    public schedulerProps: any = schedulerProps;
    private scheduler!: Scheduler;

    columnLinesFeature = { disabled : false };
    stripeFeature = { disabled : true };

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent!: BryntumSchedulerComponent;

    ngAfterViewInit(): void {
        // Store Scheduler instance
        this.scheduler = this.schedulerComponent.instance;
    }

    toggleColumnLinesFeature(event : any): void {
        this.columnLinesFeature = { disabled : !event.checked };
    }

    toggleStripeFeature(event : any): void {
        this.stripeFeature = { disabled : !event.checked };
    }

}
