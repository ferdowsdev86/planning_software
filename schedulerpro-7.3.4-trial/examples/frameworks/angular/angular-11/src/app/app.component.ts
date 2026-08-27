import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { BryntumSchedulerProComponent } from '@bryntum/schedulerpro-angular';
import { SchedulerPro } from '@bryntum/schedulerpro';
import { schedulerProProps } from './app.config';
import { projectData } from './app.data';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {
    @ViewChild(BryntumSchedulerProComponent) schedulerProComponent: BryntumSchedulerProComponent;

    private schedulerPro: SchedulerPro;

    schedulerProProps = schedulerProProps;
    projectData = projectData;

    /**
     * Called after View is initialized
     */
    ngAfterViewInit(): void {
        // SchedulerPro instance
        this.schedulerPro = this.schedulerProComponent.instance;
    }

}
