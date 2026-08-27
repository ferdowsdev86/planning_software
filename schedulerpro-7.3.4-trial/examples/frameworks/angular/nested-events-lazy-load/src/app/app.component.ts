import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { ProjectModel, SchedulerPro } from '@bryntum/schedulerpro';
import {
    BryntumSchedulerProComponent, BryntumSchedulerProModule, BryntumSchedulerProProjectModelComponent
} from '@bryntum/schedulerpro-angular';
import { projectProps, schedulerProProps } from './app.config';
import { getDependencies } from './lib/Data';

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

    private schedulerPro!: SchedulerPro;
    private project!: ProjectModel;

    schedulerProProps = schedulerProProps;
    projectProps      = projectProps;

    /**
     * Called after View is initialized
     */
    ngAfterViewInit(): void {
        // SchedulerPro and Project instance
        this.schedulerPro = this.schedulerProComponent.instance;
        this.project      = this.schedulerProProjectComponent.instance;

        // Load dependencies
        getDependencies().then(dependencies => {
            this.schedulerPro.dependencyStore.data = dependencies;
        });
    }
}
