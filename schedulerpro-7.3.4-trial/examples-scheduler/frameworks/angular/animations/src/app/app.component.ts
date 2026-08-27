import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { BryntumSchedulerComponent } from '@bryntum/schedulerpro-angular';
import { type Button, DateHelper, DomHelper, Menu, type Scheduler, type TimeSpan } from '@bryntum/schedulerpro';
import type AppEventModel from './lib/AppEventModel';
import { schedulerProps } from './app.config';

@Component({
    standalone    : false,
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.ShadowDom
})

export class AppComponent implements OnInit, AfterViewInit {

    public schedulerProps = schedulerProps;

    private styleNode: HTMLStyleElement = DomHelper.createElement({
        tag : 'style',
        id  : 'anim-duration'
    }) as HTMLStyleElement;

    private scheduler!: Scheduler;

    @ViewChild(BryntumSchedulerComponent) schedulerComponent!: BryntumSchedulerComponent;

    /**
     * Runs after the view (including the child scheduler) is initializes
     */
    ngAfterViewInit(): void {
        this.scheduler = this.schedulerComponent.instance;
        this.setAnimationDuration(600);
    }

    /**
     * Runs on this component initialization
     */
    ngOnInit(): void {
        // Append style node to shadow root
        document.getElementsByTagName('app-root')[0].shadowRoot!.appendChild(this.styleNode);
    }

    /**
     * Sets the duration of animation.
     */
    setAnimationDuration(value: number): void {
        this.scheduler.transitionDuration       = value;
        this.scheduler.initialAnimationDuration = value;
        this.styleNode.innerHTML                = `.b-grid-row,.b-sch-event-wrap { animation-duration: ${value / 1000}s !important; .b-grid-row,.b-sch-event-wrap { transition-duration: ${value / 1000}s !important; }`;
    }

    /**
     * Initial animation button click handler
     */
    onInitialAnimation = ({ source }: { source: Button }) => {
        const { scheduler } = this;

        function play(animation: any) {
            scheduler.restartInitialAnimation(animation);
        }

        new Menu({
            forElement  : source.element,
            closeAction : 'destroy',
            width       : source.element.offsetWidth,
            items       : [
                {
                    text     : 'Fade in',
                    icon     : 'fa fa-play',
                    disabled : scheduler.useInitialAnimation === 'fade-in',
                    onItem   : () => play('fade-in')
                },
                {
                    text     : 'Slide from left',
                    icon     : 'fa fa-play',
                    disabled : scheduler.useInitialAnimation === 'slide-from-left',
                    onItem   : () => play('slide-from-left')
                },
                {
                    text     : 'Slide from top',
                    icon     : 'fa fa-play',
                    disabled : scheduler.useInitialAnimation === 'slide-from-top',
                    onItem   : () => play('slide-from-top')
                },
                {
                    text     : 'Zoom in',
                    icon     : 'fa fa-play',
                    disabled : scheduler.useInitialAnimation === 'zoom-in',
                    onItem   : () => play('zoom-in')
                },
                {
                    text     : 'Custom',
                    icon     : 'fa fa-play',
                    cls      : 'b-separator',
                    disabled : scheduler.useInitialAnimation === 'custom',
                    onItem   : () => play('custom')
                }
            ],
            listeners : {
                destroy() {
                    source.pressed = false;
                }
            }
        });
    };

    /**
     * Random update button click handler
     */
    onRandomUpdate = () => {
        const
            { scheduler }     = this,
            eventStore        = scheduler.eventStore,
            indices: number[] = [],
            nbrToAnimate      = Math.min(eventStore.count, 4);

        // Grab a bunch of random events to change
        while (indices.length < nbrToAnimate) {
            const index = Math.floor(Math.random() * eventStore.count);

            if (!indices.includes(index)) {
                indices.push(index);
            }
        }
        indices.forEach((index) => {
            const ev: any = eventStore.getAt(index);

            if (ev && ev.resource) {
                ev.beginBatch();
                ev.resourceId = (scheduler.resourceStore.indexOf(ev.resource) + 2) % 8 + 1;
                ev.setStartDate(DateHelper.add(ev.startDate, ev.startDate.getHours() % 2 ? 1 : -1, 'hour'), true);
                ev.endBatch();
            }
        });

    };

    /**
     * After lunch button click handler. Moves all meetings after lunch.
     */
    onAfterLunch(): void {
        const
            { scheduler }   = this,
            eventStore      = scheduler.eventStore,
            lunchFinishTime = (scheduler.features.timeRanges.store.getById('lunch') as TimeSpan).endDate,
            events          = eventStore.query(event => (event as AppEventModel).eventType === 'Meeting') as AppEventModel[];

        events.forEach(event => event.startDate = DateHelper.max(event.startDate as Date, lunchFinishTime as Date));
    }

    /**
     * Max 1 hr button click handler. Resizes all Meeting to be max 1 hr long.
     */
    onMaxHour(): void {
        const
            { scheduler } = this,
            events        = (scheduler.eventStore.query(event => (event as AppEventModel).eventType === 'Meeting') as AppEventModel[]);
        events.forEach(event => event.duration = Math.min(event.duration, 1));
    }

    /**
     * Duration slider change handler
     */
    onDurationChange({ value }: { value: number }): void {
        this.setAnimationDuration(value);
    }

}
