import { Component, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { schedulerProProps } from './app.config';
import { BryntumSchedulerProComponent } from '@bryntum/schedulerpro-angular';
import { SchedulerPro } from '@bryntum/schedulerpro';

@Component({
    standalone    : false,
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {

    // Bryntum SchedulerPro Angular wrapper component reference
    @ViewChild(BryntumSchedulerProComponent) schedulerProComponent!: BryntumSchedulerProComponent;

    private schedulerPro!: SchedulerPro;

    schedulerProProps = schedulerProProps;

    ngAfterViewInit() : void {
        // Store schedulerpro instance
        this.schedulerPro = this.schedulerProComponent.instance;

    }
}
