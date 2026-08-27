import { Component, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { projectProps, schedulerProProps, resourceUtilizationProps } from './app.config';
import { BryntumSchedulerProProjectModelComponent, BryntumSchedulerProComponent, BryntumResourceUtilizationComponent } from '@bryntum/schedulerpro-angular';
import { ProjectModel, SchedulerPro, ResourceUtilization } from '@bryntum/schedulerpro';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {

    projectProps             = projectProps;
    schedulerProProps        = schedulerProProps;
    resourceUtilizationProps = resourceUtilizationProps;

    private project!: ProjectModel;
    private schedulerPro!: SchedulerPro;
    private resourceUtilization!: ResourceUtilization;

    // Bryntum component Angular wrapper reference
    @ViewChild(BryntumSchedulerProProjectModelComponent) projectComponent! : BryntumSchedulerProProjectModelComponent;
    @ViewChild(BryntumSchedulerProComponent) schedulerProComponent! : BryntumSchedulerProComponent;
    @ViewChild(BryntumResourceUtilizationComponent) resourceUtilizationComponent! : BryntumResourceUtilizationComponent;

    ngAfterViewInit(): void {
        // Save scheduler and project instances to this object
        this.schedulerPro        = this.schedulerProComponent.instance;
        this.project             = this.projectComponent.instance;
        this.resourceUtilization = this.resourceUtilizationComponent.instance;

        // check if both scheduler and resource exist
        if (this.schedulerPro  && this.resourceUtilization) {
            // add scheduler as partner
            this.resourceUtilization.addPartner(this.schedulerPro);
        }

    }
}
