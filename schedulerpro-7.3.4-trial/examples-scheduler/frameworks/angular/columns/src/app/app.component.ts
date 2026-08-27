import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { BryntumSchedulerComponent } from '@bryntum/schedulerpro-angular';
import { Button, ColumnStore, SchedulerEventModel, Scheduler, StringHelper } from '@bryntum/schedulerpro';
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
    private addButton: Button;
    private removeButton: Button;

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent: BryntumSchedulerComponent;

    eventRenderer({ eventRecord, renderData }: { eventRecord: SchedulerEventModel; renderData: any }): string {
        const hours = eventRecord.duration * 24;
        if (hours > 8) {
            renderData.eventColor = 'red';
        }
        else if (hours > 4) {
            renderData.eventColor = 'orange';
        }
        else if (hours > 2) {
            renderData.eventColor = 'lime';
        }

        return `${StringHelper.encodeHtml(eventRecord.name)}<span>(${hours} hour${hours > 1 ? 's' : ''})</span>`;
    }

    onAddClick(): void {
        // scheduler.columns is a store, it supports the normal Store CRUD operations
        const columns = this.scheduler.columns as ColumnStore;
        columns.insert(1, { text : 'Accessible', field : 'accessible', region : 'left', type : 'check' });
        this.addButton.disable();
        this.removeButton.enable();
    }

    onRemoveClick(): void {
        const columns = this.scheduler.columns as ColumnStore;
        columns.getAt(1).remove();
        this.addButton.enable();
        this.removeButton.disable();
    }

    /**
     * Runs after the view (including the child scheduler) initialized
     */
    ngAfterViewInit(): void {
        this.scheduler = this.schedulerComponent.instance;

        const { addButton, removeButton } = this.scheduler.widgetMap as { addButton: Button; removeButton: Button };

        this.addButton = addButton;
        this.removeButton = removeButton;

        addButton.on({ click : this.onAddClick, thisObj : this });
        removeButton.on({ click : this.onRemoveClick, thisObj : this });
    }
}
