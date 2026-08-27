import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { CalendarModel, EventHelper, SchedulerPro, SlideToggle, StringHelper, TimeSpan } from '@bryntum/schedulerpro';
import { BryntumSchedulerProComponent } from '@bryntum/schedulerpro-angular';
import { schedulerProProps } from './app.config';

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

    // Custom event renderer that displays small thumbs for assigned resources
    public eventRenderer({ eventRecord, renderData }) {
        const durationColors = {
            0 : 'blue',
            1 : 'indigo',
            2 : 'violet'
        };

        // Project length determines color
        renderData.eventColor = durationColors[Math.min(Math.floor(eventRecord.duration / 9), 2)];

        // Custom content, displays images for assigned resources + event name
        return [
            {
                html : StringHelper.encodeHtml(eventRecord.name)
            },
            {
                className : 'assigned',
                children  : eventRecord.resources.map(resource => ({
                    tag       : 'img',
                    draggable : false,
                    src       : resource.image !== false ? (this as any).resourceImagePath + resource.name.toLowerCase() + '.png' : null,
                    alt       : StringHelper.encodeHtml(resource.name),
                    dataset   : {
                        resourceId : resource.id
                    }
                }))
            }
        ];
    }

    onSchedulerPaint({ firstPaint }): void {
        if (firstPaint) {
            // To have resource images in events redrawn when assignments change, do a full refresh
            this.schedulerPro.assignmentStore.on({
                add     : this.schedulerPro.refreshWithTransition,
                remove  : this.schedulerPro.refreshWithTransition,
                thisObj : this.schedulerPro
            });

            // Select row when clicking a resource image on an event
            EventHelper.on({
                element  : this.schedulerPro.element,
                delegate : '.assigned img',
                thisObj  : this.schedulerPro,
                click    : event => this.schedulerPro.selectRow({ record : event.target.dataset.resourceId })
            });
        }
    }

    onFilterButtonToggle({ checked }): void {
        if (checked) {
            // Filter that keeps working time ticks in time axis
            this.schedulerPro.timeAxis.filter({ filterBy :
                (tick : TimeSpan) => (this.schedulerPro.project.calendar as CalendarModel).isWorkingTime(tick.startDate as Date, tick.endDate as Date)
            });
        }
        else {
            // Restore all ticks
            this.schedulerPro.timeAxis.clearFilters();
        }
    }

    /**
     * Called after View is initialized
     */
    ngAfterViewInit(): void {
        // SchedulerPro instance
        this.schedulerPro = this.schedulerProComponent.instance;
        const { filterButton } = this.schedulerPro.widgetMap as { filterButton: SlideToggle };

        this.schedulerPro.on({
            paint   : this.onSchedulerPaint,
            thisObj : this
        });

        filterButton.on({
            change  : this.onFilterButtonToggle,
            // change  : () => { console.log('Hello World!'); },
            thisObj : this
        });

    }
}
