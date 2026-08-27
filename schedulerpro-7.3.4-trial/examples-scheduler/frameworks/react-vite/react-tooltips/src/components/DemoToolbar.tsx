import { SchedulerEventModel, Toast, type Scheduler } from '@bryntum/schedulerpro';
import { BryntumButton, BryntumNumberField, BryntumSlideToggle } from '@bryntum/schedulerpro-react';
import React, { useCallback, useEffect, useState } from 'react';

import DemoSelectedLabel from './DemoSelectedLabel.tsx';

interface DemoToolbarProps {
    scheduler?: Scheduler;
}

const DemoToolbar: React.FC<DemoToolbarProps> = ({ scheduler }) => {

    const [selectedEvent, setSelectedEvent] = useState('');

    // Installs listener to update the selected event name when selection changes
    useEffect(() => {
        if (scheduler) {
            scheduler.on('eventSelectionChange', ({ selection }: { selection: SchedulerEventModel[] }) => {
                setSelectedEvent(selection.length ? selection[0].name : '');
            });
        }
    }, [scheduler]);

    /**
     * Adds a 1-hour event for the first resource at the beginning of the scheduler
     */
    const addClickHandler = useCallback(
        () => {
            if (!scheduler) {
                console.warn('Could not get Scheduler instance');
                return;
            }

            // Get start and end date of the new event (1h duration)
            const startDate = new Date(scheduler.startDate.getTime()),
                endDate   = new Date(startDate.getTime()),
                resource  = scheduler.resourceStore.first;

            if (!resource) {
                Toast.show('There is no resource available');
                return;
            }

            endDate.setHours(endDate.getHours() + 1);

            // Gdd the event to the store
            scheduler.eventStore.add({
                resourceId : resource.id,
                startDate,
                endDate,
                name       : 'New task'
            });
        },
        [scheduler]
    );

    /**
     * Remove the selected event
     */
    const removeClickHandler = useCallback(
        () => {
            if (!scheduler) {
                console.warn('Could not get Scheduler instance');
                return;
            }

            // Remove the selected event
            if (scheduler.selectedEvents.length) {
                scheduler.selectedEvents[0].remove();
            }

            setSelectedEvent('');
        },
        [scheduler]
    );

    return (
        // Only render the toolbar when we have a scheduler instance
        scheduler && (
            <div className="demo-toolbar align-right">
                <BryntumButton
                    color="green"
                    rendition="outlined"
                    icon="fa fa-plus"
                    tooltip="Add event"
                    // Only needed for Bryntum automated testing,
                    // can be removed in a real world app
                    dataset={{ action : 'add' }}
                    onClick={addClickHandler}
                />
                <BryntumButton
                    color="red"
                    icon="fa fa-trash"
                    rendition="outlined"
                    tooltip="Delete selected event"
                    // Only needed for Bryntum automated testing,
                    // can be removed in a real world app
                    dataset={{ action : 'remove' }}
                    onClick={removeClickHandler}
                    disabled={!selectedEvent}
                />

                <DemoSelectedLabel
                    selectedEvent={selectedEvent}
                />

                <div className="spacer"/>

                <BryntumNumberField
                    label="Bar Margin:"
                    width={160}
                    min={0}
                    max={15}
                    step={1}
                    value={5}
                    // Only needed for Bryntum automated testing,
                    // can be removed in a real world app
                    dataset={{ field : 'barMargin' }}
                    onChange={({ value }) => {
                        scheduler.barMargin = value;
                    }}
                />

                <BryntumSlideToggle
                    label="Stripe Feature"
                    checked={false}
                    onAction={({ checked }) => {
                        scheduler.features.stripe.setConfig({ disabled : !checked });
                    }}
                />
                <BryntumSlideToggle
                    label="Column Lines Feature"
                    checked={true}
                    onAction={({ checked }) => {
                        scheduler.features.columnLines.setConfig({ disabled : !checked });
                    }}
                />

            </div>
        )
    );
};

export default DemoToolbar;
