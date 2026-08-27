/**
 * App component script
 */
import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { BryntumSchedulerComponent } from '@bryntum/schedulerpro-angular';
import { Column, ComboModel, EventHelper, Popup, Scheduler, Tooltip } from '@bryntum/schedulerpro';
import { AppEventModel, colors, EmployeeResourceModel, schedulerProps } from './app.config';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {

    public schedulerProps : any = schedulerProps;
    private scheduler! : Scheduler;

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent! : BryntumSchedulerComponent;

    ngAfterViewInit() : void {
        // Store Scheduler instance
        this.scheduler      = this.schedulerComponent.instance;
        const { scheduler } = this;

        // Tooltip for add client buttons (plain divs)
        new Tooltip({
            forSelector : '.add',
            html        : 'Add client',
            hideDelay   : 100
        });

        // Handle click on those add divs
        EventHelper.addListener(scheduler.element, {
            element  : scheduler.element,
            delegate : '.add',
            click(event : any) {
                const
                    employee = scheduler.getRecordFromElement(event.target) as EmployeeResourceModel,
                    data     = new EmployeeResourceModel({
                        name  : 'New client',
                        color : colors[Math.floor(Math.random() * colors.length)].toLowerCase()
                    });

                if (employee) {
                    // Add a new client with random color
                    employee.appendChild(data);
                }
            }
        });

    }

    onCellDblClick(event : any) : void {
        const { record, cellElement, column } : { record : EmployeeResourceModel; cellElement : HTMLElement; column : Column } = event;
        // Show a custom editor when dbl clicking a client cell
        if (column.field === 'name' && record.isLeaf) {
            new Popup({
                autoShow     : true,
                autoClose    : true,
                closeAction  : 'destroy',
                scrollAction : 'realign',
                forElement   : cellElement,
                anchor       : true,
                width        : '20em',
                cls          : 'client-editor',
                items        : [{
                    type       : 'textfield',
                    name       : 'name',
                    label      : 'Client',
                    labelWidth : '4em',
                    value      : record.name,
                    onChange   : ({ value }) => {
                        record.name = value;
                    }
                }, {
                    type        : 'combo',
                    cls         : 'b-last-row',
                    name        : 'color',
                    label       : 'Color',
                    labelWidth  : '4em',
                    items       : colors.map(color => [color.toLowerCase(), color]),
                    value       : record.color,
                    listItemTpl : record => {
                        const row = record as ComboModel;
                        return `<div class="color-item ${row.value}"></div>${row.text}`;
                    },
                    onChange : ({ value }) => {
                        record.color = value;
                    }
                }]
            });
        }
    }

    onDragCreateEnd(event : any) : void {
        const { eventRecord, resourceRecord } : { eventRecord : AppEventModel; resourceRecord : EmployeeResourceModel } = event;
        // Make new event have correct type, to show correct fields in event editor
        eventRecord.type                                                                                                = resourceRecord.isLeaf ? 'client' : 'employee';
    }

}
