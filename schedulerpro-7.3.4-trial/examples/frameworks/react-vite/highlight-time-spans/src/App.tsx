import { useCallback, useRef, useState } from 'react';
import {
    DateConstraint, EventModel, SchedulerEventModel, SchedulerProListeners, SchedulerResourceModel, SlideToggle, SlideToggleListenersTypes
} from '@bryntum/schedulerpro';
import { BryntumDemoHeader, BryntumSchedulerPro, BryntumSchedulerProProjectModel, BryntumToolbarProps } from '@bryntum/schedulerpro-react';
import { projectProps, schedulerProProps } from './AppConfig';
import './App.scss';
import { EventWithBoundaries } from './lib/EventWithBoundaries';

function App() {
    const projectRef      = useRef<BryntumSchedulerProProjectModel>(null);
    const schedulerProRef = useRef<BryntumSchedulerPro>(null);
    const getSchedulerPro = () => schedulerProRef.current.instance;

    const [listeners] = useState<SchedulerProListeners>({
        scheduleClick() {
            (getSchedulerPro().widgetMap.highlightButton as SlideToggle).checked = false;
            getSchedulerPro().unhighlightTimeSpans(true);
        },

        async eventSelectionChange() {
            const schedulerPro  = getSchedulerPro();
            const selectedEvent = schedulerPro.selectedEvents[0];

            if (selectedEvent && schedulerPro.selectedEvents.length === 1) {
                await highlightDeliveryWindow(schedulerPro.selectedEvents[0] as EventModel);
            }
        },

        async eventDragStart({ eventRecords }) {
            await highlightDeliveryWindow(eventRecords[0] as EventModel);
        },

        eventDragReset() {
            getSchedulerPro().unhighlightTimeSpans();
        },

        async eventResizeStart({ eventRecord }) {
            await highlightDeliveryWindow(eventRecord as EventModel);
        },

        eventResizeEnd() {
            getSchedulerPro().unhighlightTimeSpans();
        }
    });

    const [tbarProps] = useState<BryntumToolbarProps>({
        items : [{
            type    : 'slidetoggle',
            ref     : 'highlightDragButton',
            cls     : 'b-blue',
            text    : 'Highlight while dragging',
            checked : true
        },
        {
            type     : 'slidetoggle',
            ref      : 'highlightButton',
            text     : 'Highlight 10-11am + 2-4pm',
            onAction : context => onHighlightButtonToggle(context)
        }
        ]
    });

    // This template method dictates how event bars are constrained for drag&drop, resize and create UI interactions
    const getDateConstraints = useCallback((_resourceRecord: SchedulerResourceModel, eventRecord: SchedulerEventModel): DateConstraint => {
        const { minStartDate, maxEndDate } = eventRecord as EventWithBoundaries;
        if (minStartDate) {
            return {
                start : minStartDate,
                end   : maxEndDate
            };
        }
    }, []);

    // Utility method used to highlight the delivery window for an event record
    const highlightDeliveryWindow = useCallback(async(eventModel: EventModel) => {
        const { minStartDate, maxEndDate }             = eventModel as EventWithBoundaries;
        const schedulerPro                             = getSchedulerPro();
        const { highlightButton, highlightDragButton } = schedulerPro.widgetMap as Record<string, SlideToggle>;
        const highlightEnabled                         = highlightDragButton.checked;

        if (highlightButton.checked) {
            highlightButton.toggle();
        }

        // debugger
        if (highlightEnabled && minStartDate && maxEndDate) {
            await schedulerPro.highlightTimeSpan({
                // Optional, to support animations
                animationId : 'deliveryWindow',
                // Highlight surrounding area
                surround    : true,
                name        : 'Unavailable time',
                // The time span to visualize
                startDate   : minStartDate,
                endDate     : maxEndDate
            });
        }
    }, []);

    const onHighlightButtonToggle = useCallback<SlideToggleListenersTypes['action']>(async({ checked }) => {
        const schedulerPro = getSchedulerPro();
        if (checked) {
            await schedulerPro.highlightTimeSpans([
                {
                    name      : 'Morning',
                    // Add a custom CSS class to the highlight element
                    cls       : 'morning',
                    startDate : new Date(2025, 0, 20, 9),
                    endDate   : new Date(2025, 0, 20, 10)
                },
                {
                    name      : 'Afternoon',
                    startDate : new Date(2025, 0, 20, 14),
                    endDate   : new Date(2025, 0, 20, 16)
                }
            ]);
        }
        else {
            await schedulerPro.unhighlightTimeSpans(true);
        }
    }, []);

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader/>
            <BryntumSchedulerProProjectModel
                ref={projectRef}
                {...projectProps}
            />
            <BryntumSchedulerPro
                ref={schedulerProRef}
                project={projectRef}
                listeners={listeners}
                tbar={tbarProps}
                getDateConstraints={getDateConstraints}
                {...schedulerProProps}
            />
        </>
    );
}

export default App;
