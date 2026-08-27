import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { BryntumSchedulerProComponent } from '@bryntum/schedulerpro-angular';
import { SchedulerPro, Button, EventModel, CalendarModel } from '@bryntum/schedulerpro';
import { schedulerProProps } from './app.config';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {
    @ViewChild(BryntumSchedulerProComponent)
        schedulerProComponent: BryntumSchedulerProComponent;

    private schedulerPro: SchedulerPro;

    schedulerProProps = schedulerProProps;

    onAddInvalidDependencyClick(): void {
        // Here we add an invalid dependency linking "Arrive" event to itself
        // which naturally builds a cycle...
        // This action triggers event rescheduling which then detects the cycle
        // and informs user about it.
        this.schedulerPro.dependencyStore.add({ fromEvent : 1, toEvent : 1 });
    }

    onAddInvalidCalendarClick(): void {
        // Here we add an invalid calendar and assign it to "Arrive #2" event.
        // The calendar has no working intervals and thus cannot be used for scheduling,
        // Assigning of the calendar triggers event rescheduling which then detects the issue
        // and informs user about it.

        const [calendar] = this.schedulerPro.project.calendarManagerStore.add({
            name                     : 'Foo',
            // We setup a global not working interval on the calendar but
            // not provide any single working one so the calendar has zero working periods
            unspecifiedTimeIsWorking : false
        }) as CalendarModel[];

        const eventRecord = this.schedulerPro.eventStore.getById(5) as EventModel;
        eventRecord.calendar = calendar;
    }

    /**
     * Called after View is initialized
     */
    ngAfterViewInit(): void {
        // SchedulerPro instance
        this.schedulerPro = this.schedulerProComponent.instance;

        const { addInvalidDependencyButton, addInvalidCalendarButton } = this.schedulerPro.widgetMap as { addInvalidDependencyButton: Button; addInvalidCalendarButton: Button};

        addInvalidDependencyButton.on({ click : this.onAddInvalidDependencyClick, thisObj : this });
        addInvalidCalendarButton.on({ click : this.onAddInvalidCalendarClick, thisObj : this });
    }
}
