import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { BryntumSchedulerComponent } from '@bryntum/schedulerpro-angular';
import { Scheduler } from '@bryntum/schedulerpro';
import { schedulerProps } from './app.config';

@Component({
    standalone    : false,
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {

    public schedulerProps = schedulerProps;
    private scheduler!: Scheduler;

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent!: BryntumSchedulerComponent;

    ngAfterViewInit(): void {
        // Store Scheduler instance
        this.scheduler = this.schedulerComponent.instance;
        // The following lines are only needed for ViewEncapsulation.ShadowDom
        document.fonts.add(new FontFace('FontAwesome6Free', `url(assets/fonts/fa-solid-900.woff2)`));
        document.fonts.add(new FontFace('Roboto', `url(assets/fonts/Roboto-Regular.woff2)`));
    }
}
