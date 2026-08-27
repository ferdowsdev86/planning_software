import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { BryntumSchedulerProComponent } from '@bryntum/schedulerpro-angular';
import { SchedulerPro, DateHelper, TimeZoneHelper } from '@bryntum/schedulerpro';
import { schedulerProProps } from './app.config';
import 'src/lib/data';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {
    @ViewChild(BryntumSchedulerProComponent) schedulerProComponent: BryntumSchedulerProComponent;

    private schedulerPro: SchedulerPro;

    schedulerProProps = schedulerProProps;

    private currentDate: Date;
    public isLoading: boolean = false;

    // Loads more data from the fake backend
    // Locks the UI while loading
    public async loadData(startDate: Date, endDate: Date) {
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;

        this.currentDate = startDate;

        this.schedulerPro.setTimeSpan(startDate, endDate);

        await this.schedulerPro.project.load();
        await this.schedulerPro.project.commitAsync();

        this.isLoading = false;
    }

    public eventRenderer({ eventRecord }) {
        // Not showing UTC time on parent (if nested)
        if (eventRecord.isParent) {
            return 'Nested events';
        }

        // Example of how a time zone converted date can be converted back to local system time or UTC
        const utcString = TimeZoneHelper.fromTimeZone(eventRecord.startDate, (this as any).timeZone).toISOString();
        return `UTC<br>${utcString}`;
    }

    public get today() {
        const now = new Date();
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }

    public get tomorrow() {
        return DateHelper.add(this.today, 1, 'day');
    }

    public get timeZones() {
        // Available options in the drop down-menu is those available for the native Intl.DateTimeFormat. The actual
        // time zone conversion uses toLocaleString('locale', { timeZone: chosenTimeZone }) and then parses it into
        // a local system date.
        return (Intl as any).supportedValuesOf?.('timeZone') || ['America/Caracas', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
            'America/New_York', 'America/Sao_Paulo', 'America/St_Johns', 'Asia/Bangkok', 'Asia/Dhaka', 'Asia/Hong_Kong',
            'Asia/Tokyo', 'Australia/Adelaide', 'Australia/Melbourne', 'Europe/London', 'Europe/Helsinki', 'Europe/Moscow',
            'Europe/Stockholm', 'Indian/Maldives', 'Indian/Mahe', 'Pacific/Auckland', 'Pacific/Honolulu'];
    }

    public groupItems = {
        prevButton : {
            type     : 'button',
            icon     : 'b-icon-previous',
            tooltip  : 'View previous day',
            // Use arrow function to keep correct `this` context for onPrevDayClick
            onAction : () => {
                this.onPrevDayClick();
            }
        },
        todayButton : {
            type     : 'button',
            text     : 'Today',
            tooltip  : 'View today, to see the current time line',
            // Use arrow function to keep correct `this` context for onTodayClick
            onAction : () => {
                this.onTodayClick();
            }
        },
        nextButton : {
            type     : 'button',
            icon     : 'b-icon-next',
            tooltip  : 'View next day',
            // Use arrow function to keep correct `this` context for onNextDayClick
            onAction : () => {
                this.onNextDayClick();
            }
        }
    };

    public get currentTimeZone() {
        // TimeZone drop-down start value is local system timezone
        return new Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    public onPrevDayClick() {
        // Re-populates the store with data for the previous day.
        // Not needed when working with real data
        this.loadData(DateHelper.add(this.currentDate, -1, 'day'), this.currentDate);
    }

    public onTodayClick() {
        // Re-populates the store with data for today.
        // Not needed when working with real data
        const
            { timeZone } = this.schedulerPro,
            tzToday      = TimeZoneHelper.toTimeZone(this.today, timeZone),
            tzTomorrow   = TimeZoneHelper.toTimeZone(this.tomorrow, timeZone);

        this.loadData(tzToday, tzTomorrow);
    }

    public onNextDayClick() {
        // Re-populates the store with data for the next day.
        // Not needed when working with real data
        this.loadData(DateHelper.add(this.currentDate, 1, 'day'), DateHelper.add(this.currentDate, 2, 'day'));
    }

    public onTimeZoneSelect({ record }) {
        // TimeZone drop-down selection
        this.schedulerPro.timeZone = record.data.text;
    }

    public onBeforeLoad({ pack }) {
        // Add the "currentDay" to all load requests
        if (!pack.params) {
            pack.params = {};
        }
        pack.params.date = this.currentDate;
    }

    /**
     * Called after View is initialized
     */
    ngAfterViewInit(): void {
        // SchedulerPro instance
        this.schedulerPro = this.schedulerProComponent.instance;

        this.schedulerPro.project.on({
            beforeLoad : this.onBeforeLoad,
            thisObj    : this
        });

        // Load a bit later to not upset Angular state tracking
        requestAnimationFrame(() => this.loadData(this.today, this.tomorrow));
    }
}
