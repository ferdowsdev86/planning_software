import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Scheduler } from '@bryntum/schedulerpro';
import { BryntumSchedulerComponent } from '@bryntum/schedulerpro-angular';
import { scheduler1Props, scheduler2Props } from './app.config';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {
    scheduler1Props = scheduler1Props;
    scheduler2Props = scheduler2Props;

    private scheduler1!: Scheduler;
    private scheduler2!: Scheduler;

    @ViewChild('scheduler1', { static : true }) schedulerComponent1!: BryntumSchedulerComponent;
    @ViewChild('scheduler2', { static : true }) schedulerComponent2!: BryntumSchedulerComponent;

    ngAfterViewInit(): void {
        // Store Scheduler instance
        this.scheduler1 = this.schedulerComponent1.instance;
        this.scheduler2 = this.schedulerComponent2.instance;
        this.scheduler2.addPartner(this.scheduler1);
    }

    /**
     * Handles zoom-in click event
     */
    onZoomIn():void {
        this.scheduler1.zoomIn();
    }

    /**
     * Handles zoom-out click event
     */
    onZoomOut() {
        this.scheduler1.zoomOut();
    }

}
