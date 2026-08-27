import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { ProjectModel, SchedulerPro } from '@bryntum/schedulerpro';
import { BryntumSchedulerProComponent, BryntumSchedulerProModule, BryntumSchedulerProProjectModelComponent } from '@bryntum/schedulerpro-angular';
import { projectProps, schedulerProProps } from './app.config';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None,
    standalone    : true,
    imports       : [BryntumSchedulerProModule]
})
export class AppComponent implements AfterViewInit {
    @ViewChild(BryntumSchedulerProComponent) schedulerProComponent!: BryntumSchedulerProComponent;
    @ViewChild(BryntumSchedulerProProjectModelComponent) schedulerProProjectComponent!: BryntumSchedulerProProjectModelComponent;

    // These properties are not used directly in this app but demonstrate how to access
    // the SchedulerPro and Project instances when needed in your application
    private schedulerPro!: SchedulerPro;
    private project!: ProjectModel;

    schedulerProProps = schedulerProProps;
    projectProps      = projectProps;

    ngAfterViewInit(): void {
        // Store SchedulerPro and Project instances for further use
        this.schedulerPro = this.schedulerProComponent.instance;
        this.project = this.schedulerProProjectComponent.instance;
    }
}
