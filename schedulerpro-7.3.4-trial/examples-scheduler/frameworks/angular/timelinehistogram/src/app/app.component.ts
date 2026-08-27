import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { BryntumTimelineHistogramComponent } from '@bryntum/schedulerpro-angular';
import { histogramProps } from './app.config';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})

export class AppComponent {
    public histogramProps = histogramProps;

    @ViewChild(BryntumTimelineHistogramComponent, { static : false }) histogramComponent!: BryntumTimelineHistogramComponent;

}
