import { AfterViewInit, Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { BryntumGridComponent, BryntumSchedulerComponent } from '@bryntum/schedulerpro-angular';
import { gridProps, schedulerProps } from './app.config';
import { EventStoreListenersTypes, Grid, Scheduler, Store, Toast } from '@bryntum/schedulerpro';
import { Drag } from './lib/Drag';
import { TaskStore } from './lib/TaskStore';
import { Task } from './lib/Task';

@Component({
    standalone    : false,
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {
    private scheduler!: Scheduler;
    private grid!: Grid;

    gridProps = gridProps;

    @Input() autoRescheduleTasks = false;

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent!: BryntumSchedulerComponent;
    @ViewChild(BryntumGridComponent, { static : true }) gridComponent!: BryntumGridComponent;

    // specific to this example - reschedules the tasks
    onEventStoreUpdate : EventStoreListenersTypes['update'] = ({ record, changes }) => {
        const { scheduler, grid, autoRescheduleTasks } = this;

        if (autoRescheduleTasks) {
            (scheduler.eventStore as TaskStore).rescheduleOverlappingTasks((record as Task));
        }

        if ('resourceId' in changes && !(record as Task).resourceId) {
            scheduler.eventStore.remove(record);
            (grid.store as Store).add(record);
        }
    };

    // specific to this example - reschedules the tasks
    onEventStoreAdd: EventStoreListenersTypes['add'] = ({ records }) => {
        const { scheduler, autoRescheduleTasks } = this;

        if (autoRescheduleTasks) {
            (records as Task[]).forEach((eventRecord) =>
                (scheduler.eventStore as TaskStore).rescheduleOverlappingTasks(
                    eventRecord
                )
            );
        }
    };

    schedulerProps = schedulerProps({
        onEventStoreAdd    : this.onEventStoreAdd,
        onEventStoreUpdate : this.onEventStoreUpdate
    });

    ngAfterViewInit(): void {
        // Store Scheduler/Grid instance
        const scheduler = this.scheduler = this.schedulerComponent.instance;
        const grid = this.grid = this.gridComponent.instance;

        new Drag({
            grid,
            schedule     : scheduler,
            constrain    : false,
            outerElement : grid.element
        });


        setTimeout(() => {
            Toast.show({
                timeout : 3500,
                html    : 'Please note that this example uses the Bryntum Grid, which is licensed separately.'
            });
        }, 500);

    }

    onAutomaticRescheduleChange({ checked } : { checked : boolean }): void {
        this.autoRescheduleTasks = checked;
    }

}
