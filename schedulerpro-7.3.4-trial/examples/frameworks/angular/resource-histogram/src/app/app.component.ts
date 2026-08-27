/**
 * App component script
 */
import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { BryntumResourceHistogramComponent, BryntumSchedulerProComponent } from '@bryntum/schedulerpro-angular';
import { ResourceHistogram, SchedulerPro } from '@bryntum/schedulerpro';

import { histogramProps, schedulerProProps } from './app.config';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})

export class AppComponent implements AfterViewInit {
    schedulerProProps = schedulerProProps;
    histogramProps = histogramProps;

    schedulerPro: SchedulerPro;
    resourceHistogram: ResourceHistogram;

    @ViewChild(BryntumSchedulerProComponent) schedulerProComponent: BryntumSchedulerProComponent;
    @ViewChild(BryntumResourceHistogramComponent) resourceHistogramComponent: BryntumResourceHistogramComponent;

    ngAfterViewInit(): void {
        this.schedulerPro = this.schedulerProComponent.instance;
        this.resourceHistogram = this.resourceHistogramComponent.instance;
        this.resourceHistogram.addPartner(this.schedulerPro);
    }

    /**
     * handles clicks on toolbar checkboxes
     */
    onCheckboxAction({ source }, option: string): void {
        this.resourceHistogram[option] = source.checked;
    }

    /**
     * Handles zoom-in click event
     */
    onZoomIn(): void {
        this.schedulerPro.zoomIn();
    }

    /**
     * Handles zoom-out click event
     */
    onZoomOut(): void {
        this.schedulerPro.zoomOut();
    }
}
