import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Checkbox, SchedulerPro } from '@bryntum/schedulerpro';
import { BryntumPanelComponent, BryntumPanelProps, BryntumSchedulerProComponent, BryntumSplitterComponent } from '@bryntum/schedulerpro-angular';

import { config, panelProps, schedulerProProps } from './app.config';

@Component({
    standalone    : false,
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {

    // Bryntum SchedulerPro Angular wrapper reference
    @ViewChild(BryntumSchedulerProComponent) schedulerProComponent!: BryntumSchedulerProComponent;
    @ViewChild(BryntumSplitterComponent) splitterComponent!: BryntumSplitterComponent;
    @ViewChild(BryntumPanelComponent) panelComponent!: BryntumPanelComponent;

    schedulerProProps       = schedulerProProps;
    panelProps: BryntumPanelProps = {
        ...panelProps,
        // Store panel items config here for accessing SchedulerPro instance in the method for altering feature values
        items : {
            // Toggle features on/off (or rather disable/enable)
            features : {
                type     : 'container',
                defaults : {
                    ref       : 'slidetoggle',
                    type      : 'slidetoggle',
                    cls       : 'b-blue',
                    listeners : {
                        // Define thisObj to access AppComponent scope to allow the change method to use SchedulerPro
                        thisObj : this,
                        change  : this.onPanelSlideToggleChange
                    }
                },
                items : {
                    enableDragDrop      : { text : 'Enable task drag drop', checked : true },
                    highlight           : { text : 'Enable highlighting', checked : true },
                    constrainToResource : { text : 'Constrain drag to row', checked : false },
                    snap                : { text : 'Snap to grid', checked : true }
                }
            }
        }
    };

    schedulerPro!: SchedulerPro;

    ngAfterViewInit(): void {
        // Store schedulerPro and panel instance and pass required variables to config
        config.schedulerPro = this.schedulerPro = this.schedulerProComponent.instance;
        config.panel        = this.panelComponent.instance;
    }

    // Change event on SlideToggle on Panel
    onPanelSlideToggleChange({ source }: { source: Checkbox }) {
        const
            { checked }  = source,
            { features } = this.schedulerPro;

        switch (source.ref) {
            case 'enableDragDrop':
                features.eventDrag.disabled = !checked;
                break;
            case 'constrainToResource':
                features.eventDrag.constrainDragToResource = checked;
                break;
            case 'highlight':
                features.calendarHighlight.disabled = !checked;
                break;
            case 'snap':
                this.schedulerPro.snap = checked;
                break;
            default:
                break;
        }
    }
}
