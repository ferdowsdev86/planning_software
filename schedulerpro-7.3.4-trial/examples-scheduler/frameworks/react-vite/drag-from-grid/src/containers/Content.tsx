import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@bryntum/schedulerpro';
import { BryntumButton, BryntumGrid, BryntumScheduler, BryntumSplitter } from '@bryntum/schedulerpro-react';
import { UnplannedGrid } from '../components/UnplannedGrid';
import { Drag } from '../lib/Drag';
import { Task } from '../lib/Task';
import { TaskStore } from '../lib/TaskStore';
import { schedulerProps } from './ContentConfig';

const Content = () => {

    // Scheduler and grid refs
    const schedulerRef = useRef<BryntumScheduler>(null);
    const gridRef      = useRef<BryntumGrid>(null);

    // Reschedule button state
    const [autoReschedule, setAutoReschedule] = useState<boolean>(false);

    // Reschedules the overlapping events if the button is pressed
    const onEventStoreUpdate = useCallback(
        ({ record, source : eventStore }: { record: Task; source: TaskStore }): void => {
            if (autoReschedule) {
                eventStore.rescheduleOverlappingTasks(record);
            }
        },
        [autoReschedule]
    );

    // Reschedules the overlapping events if the button is pressed
    const onEventStoreAdd = useCallback(
        ({ records, source : eventStore }: { records: Task[]; source: TaskStore }): void => {
            if (autoReschedule) {
                records.forEach(eventRecord => eventStore.rescheduleOverlappingTasks(eventRecord));
            }
        },
        [autoReschedule]
    );

    // Set onUpdate and onAdd functions to eventStore
    useEffect(() => {
        const eventStore = schedulerRef.current.instance.eventStore;
        Object.assign(eventStore, {
            onUpdate : onEventStoreUpdate,
            onAdd    : onEventStoreAdd
        });
    }, [onEventStoreAdd, onEventStoreUpdate]);

    // Create and destroy Drag instance
    useEffect(() => {
        const drag = new Drag({
            grid         : gridRef.current.instance,
            schedule     : schedulerRef.current.instance,
            constrain    : false,
            outerElement : gridRef.current.instance.element
        });
        return () => {
            drag.destroy();
        };
    }, []);

    return (
        <>
            <div className="demo-app">
                <div className="demo-toolbar align-right">
                    <BryntumButton
                        toggleable={true}
                        icon="fa fa-calendar"
                        text="Auto Reschedule Tasks"
                        tooltip="Toggles whether to automatically reschedule overlapping tasks"
                        cls="reschedule-button"
                        onClick={({ source : button }: { source: Button }) => {
                            setAutoReschedule(button.pressed);
                        }}
                    />
                </div>

                <div className="content-container">
                    <BryntumScheduler
                        ref={schedulerRef}
                        {...schedulerProps}
                    />
                    <BryntumSplitter/>
                    <UnplannedGrid
                        gridRef={gridRef}
                        schedulerRef={schedulerRef}
                    />
                </div>
            </div>
        </>
    );
};

export default Content;
