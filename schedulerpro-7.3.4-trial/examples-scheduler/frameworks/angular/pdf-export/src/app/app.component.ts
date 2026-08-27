/**
 * app component script
 */
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { BryntumSchedulerComponent } from '@bryntum/schedulerpro-angular';
import { Scheduler } from '@bryntum/schedulerpro';
import { schedulerProps } from './app.config';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})
export class AppComponent {
    public schedulerProps: any = schedulerProps;
    private scheduler!: Scheduler;

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent!: BryntumSchedulerComponent;

    ngAfterViewInit(): void {
        // Store Scheduler instance
        this.scheduler = this.schedulerComponent.instance;
    }

    onExportClick(): void {
        this.scheduler.features.pdfExport.showExportDialog();
    }
}
