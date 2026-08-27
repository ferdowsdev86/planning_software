import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { BryntumGridComponent, BryntumSchedulerProComponent, BryntumSchedulerProProjectModelComponent } from '@bryntum/schedulerpro-angular';
import { Grid, ProjectModel, SchedulerPro, SchedulerResourceModel, Toast } from '@bryntum/schedulerpro';
import { gridProps, projectProps, schedulerProProps } from './app.config';
import { Appointment } from 'src/lib/Appointment';
import { Doctor } from 'src/lib/Doctor';
import { Drag } from 'src/lib/Drag';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})

export class AppComponent implements AfterViewInit {

    schedulerProProps = schedulerProProps;
    gridProps         = gridProps;
    projectProps      = projectProps;

    private schedulerPro!: SchedulerPro;
    private grid!: Grid;
    private project!: ProjectModel;

    @ViewChild(BryntumSchedulerProComponent) schedulerProComponent!: BryntumSchedulerProComponent;
    @ViewChild(BryntumGridComponent) gridComponent!: BryntumGridComponent;
    @ViewChild(BryntumSchedulerProProjectModelComponent) projectComponent!: BryntumSchedulerProProjectModelComponent;

    ngAfterViewInit(): void {
        // Save grid, scheduler and project instances to this object
        this.grid         = this.gridComponent.instance;
        this.schedulerPro = this.schedulerProComponent.instance;
        this.project      = this.projectComponent.instance;

        // Create a chained version of the event store as our store.
        // It will be filtered to only display events that lack of assignments.
        // Config for grouping requiredRole in ascending mode while webpage loads initially.
        const chainedStore = this.grid.store = this.project.eventStore.chain(
            eventRecord => !(eventRecord as Appointment).assignments.length,
            undefined,
            {
                groupers : [
                    {
                        field     : 'requiredRole',
                        ascending : true
                    }
                ]
            }
        );

        // When assignments change, update our chained store to reflect the changes.
        this.project.assignmentStore.on({
            change : () => {
                chainedStore.fillFromMaster();
            },
            thisObj : this.grid
        });

        // project's listener
        this.project.on({
            change : () => {
                this.schedulerPro.widgetMap['saveButton'].disabled = !Boolean(this.project.eventStore.changes);
            },
            thisObj : this.project
        });

        new Drag({
            grid         : this.grid,
            schedule     : this.schedulerPro,
            constrain    : false,
            outerElement : this.grid.element
        });
    }

    onSchedulerSelectionChange() {
        const
            selectedRecords       = this.schedulerPro.selectedRecords as SchedulerResourceModel[],
            { calendarHighlight } = this.schedulerPro.features;
        if (selectedRecords.length > 0) {
            calendarHighlight.highlightResourceCalendars(selectedRecords);
        }
        else {
            calendarHighlight.unhighlightCalendars();
        }
    }

    onGridSelectionChange() {
        const
            appointments          = this.grid.selectedRecords as Appointment[],
            { calendarHighlight } = this.schedulerPro.features,
            requiredRoles: {
                [key: string]: number
            }                     = {};
        appointments.forEach((appointment: Appointment) => requiredRoles[appointment.requiredRole as string] = 1);

        if (Object.keys(requiredRoles).length === 1) {
            const
                appointment        = appointments[0] as Appointment,
                availableResources = this.schedulerPro.resourceStore.query(record => (record as Doctor).role === appointment.requiredRole || !appointment.requiredRole) as SchedulerResourceModel[];
            calendarHighlight.highlightResourceCalendars(availableResources);
        }
        else {
            calendarHighlight.unhighlightCalendars();
        }
    }

    onSave() {
        Toast.show('TODO: Save data (see onSave() event for SchedulerPro)');
    }
}
