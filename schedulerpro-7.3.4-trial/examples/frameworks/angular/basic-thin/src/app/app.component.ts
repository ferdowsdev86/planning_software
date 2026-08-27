import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { ProjectModel, SchedulerPro } from '@bryntum/schedulerpro-thin';
import { BryntumSchedulerProComponent, BryntumSchedulerProProjectModelComponent } from '@bryntum/schedulerpro-angular-thin';
import { projectProps, schedulerProProps } from './app.config';

@Component({
    standalone    : false,
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {
    @ViewChild(BryntumSchedulerProComponent) schedulerProComponent!: BryntumSchedulerProComponent;
    @ViewChild(BryntumSchedulerProProjectModelComponent) schedulerProProjectComponent!: BryntumSchedulerProProjectModelComponent;

    private schedulerPro!: SchedulerPro;
    private project!: ProjectModel;

    schedulerProProps = schedulerProProps;
    projectProps      = projectProps;

    ngAfterViewInit(): void {
        // SchedulerPro and Project instance
        this.schedulerPro = this.schedulerProComponent.instance;
        this.project = this.schedulerProProjectComponent.instance;
    }
}
