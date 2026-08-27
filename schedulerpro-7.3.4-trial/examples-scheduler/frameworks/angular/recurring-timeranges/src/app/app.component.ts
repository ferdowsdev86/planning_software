/**
 * App component script
 */
import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { BryntumButtonComponent, BryntumSchedulerComponent } from '@bryntum/schedulerpro-angular';
import { Scheduler, DateHelper } from '@bryntum/schedulerpro';
import { MyTimeRange } from './lib/MyTimeRange';
import { schedulerProps } from './app.config';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})

export class AppComponent implements AfterViewInit {

    public schedulerProps = schedulerProps;
    private scheduler: Scheduler;

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent: BryntumSchedulerComponent;
    @ViewChild(BryntumButtonComponent, { static : true }) coffeeButton: BryntumButtonComponent;

    /**
     * Runs after the view (including the child scheduler) is initializes
     */
    ngAfterViewInit(): void {
        this.scheduler = this.schedulerComponent.instance;
    }

    onCoffeeClick(): void {
        const coffee = this.scheduler.features.timeRanges.store.getById(1) as MyTimeRange;
        coffee.recurrenceRule = 'FREQ=WEEKLY;BYDAY=MO,TH;';
        this.coffeeButton.instance.disabled = true;
    }

    onPrevClick(): void {
        this.scheduler.shiftPrevious();
    }

    onTodayClick(): void {
        const today = DateHelper.clearTime(new Date());
        today.setHours(5);
        this.scheduler.setTimeSpan(today, DateHelper.add(today, 18, 'hour'));
    }

    onNextClick(): void {
        this.scheduler.shiftNext();
    }

    onStartClick(): void {
        this.scheduler.setTimeSpan(new Date(2019, 1, 7, 8), new Date(2019, 1, 29, 18));
    }
}
