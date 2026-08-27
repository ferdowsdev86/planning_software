import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { EventModel, ResourceModel, SchedulerPro } from '@bryntum/schedulerpro';
import { BryntumSchedulerProComponent } from '@bryntum/schedulerpro-angular';
import { schedulerProProps } from './app.config';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {

    // Bryntum Grid Angular wrapper reference
    @ViewChild(BryntumSchedulerProComponent, { static : false }) schedulerComponent!: BryntumSchedulerProComponent;

    scheduler!: SchedulerPro;

    schedulerProProps = schedulerProProps;
    startDate         = new Date(2020, 3, 6);
    endDate           = new Date(2020, 3, 11);

    ngAfterViewInit(): void {
        // Store grid instance
        const scheduler = this.scheduler = this.schedulerComponent.instance;

        const { project } = this.scheduler;

        project.on({
            // Display the editor when data is loaded
            async load() {

                // Await initial calculations
                await project.commitAsync();

                // Show the editor with 500 ms delay
                setTimeout(() => scheduler.editEvent(scheduler.eventStore.first as EventModel, scheduler.resourceStore.getById('weld') as ResourceModel), 500);
            }
        });
    }
}
