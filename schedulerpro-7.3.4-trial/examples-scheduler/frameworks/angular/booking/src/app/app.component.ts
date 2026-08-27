import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Button, ButtonGroup, GridFeatureManager, LocaleManager, SchedulerResourceModel, ResourceTimeRangeModel, Scheduler, SlideToggle, StringHelper, SummaryConfig } from '@bryntum/schedulerpro';
import { BryntumSchedulerComponent } from '@bryntum/schedulerpro-angular';
import { schedulerProps } from './app.config';
import ReservationModel from '../lib/ReservationModel';
import DailyRateStore from '../lib/DailyRateStore';
import PropertyModel from '../lib/PropertyModel';
import { DaySelectorFeature } from '../lib/DaySelectorFeature';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})

export class AppComponent implements AfterViewInit {
    public schedulerProps = schedulerProps;

    public summaryFeature: SummaryConfig = {
        renderer : ({ events }) => {
            const
                reservations = events as ReservationModel[],
                countButton  = this.scheduler.widgetMap['countButton'] as Button,
                result       = countButton.pressed ? reservations.length : reservations.reduce((total, reservation) => total + reservation.guests, 0);
            return StringHelper.xss`${result || ''}`;
        }
    };

    private scheduler!: Scheduler;

    // Bryntum Grid Angular wrapper reference
    @ViewChild(BryntumSchedulerComponent, { static : false }) schedulerComponent!: BryntumSchedulerComponent;

    ngOnInit(): void {
        // Register custom DaySelectorFeature in Scheduler enabled by default
        GridFeatureManager.registerFeature(DaySelectorFeature, true, 'Scheduler');
    }

    async ngAfterViewInit(): Promise<void> {
        const
            scheduler             = this.scheduler = this.schedulerComponent.instance,
            { features, widgetMap } = scheduler,
            summaryButton         = widgetMap['summaryGroup'] as ButtonGroup,
            selectedRowButton     = widgetMap['selectedRowButton'] as SlideToggle,
            printButton           = widgetMap['printButton'] as Button;

        summaryButton.onClick = () => features.summary.refresh();

        selectedRowButton.onChange = () => features.summary.selectedOnly = !features.summary.selectedOnly;

        printButton.onClick = () => scheduler.features.print.showPrintDialog();

        scheduler.onBeforeEventAdd = ({ eventRecord, resourceRecords }) => {
            const
                reservation = eventRecord as ReservationModel,
                property    = resourceRecords[0] as PropertyModel;
            reservation.pricePerNight = (scheduler.resourceTimeRangeStore as DailyRateStore)
                .getPricePerNightFor(property, eventRecord.startDate as Date);
        };

        // Applying localization settings to translate the placeholder value from 'New Event' to 'Guest'
        // in english in the event editor
        await LocaleManager.applyLocale('En', {
            Object : {
                newEvent : 'Guest'
            }
        });
    }

    // Create a new booking when double-clicking an available day
    async onResourceTimeRangeDblClick(event: {
        resourceTimeRangeRecord: ResourceTimeRangeModel
        resourceRecord: SchedulerResourceModel
    }): Promise<void> {
        await this.scheduler.createEvent(event.resourceTimeRangeRecord.startDate as Date, event.resourceRecord);
    }

}
