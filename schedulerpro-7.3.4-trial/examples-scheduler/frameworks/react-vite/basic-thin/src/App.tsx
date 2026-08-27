import { FunctionComponent, useCallback, useRef, useState } from 'react';
import { Model, Toast } from '@bryntum/core-thin';
import { EventModel, Scheduler, SchedulerListenersTypes } from '@bryntum/scheduler-thin';
import { BryntumButton, BryntumDemoHeader, BryntumNumberField } from '@bryntum/core-react-thin';
import { BryntumScheduler } from '@bryntum/scheduler-react-thin';
import { schedulerProps } from './AppConfig';
import { AppEventModel } from './AppEventModel';
import './App.scss';

const App: FunctionComponent = () => {
    const schedulerRef      = useRef<BryntumScheduler>(null);
    const schedulerInstance = () => schedulerRef.current?.instance as Scheduler;

    const [barMargin, setBarMargin]         = useState(5);
    const [selectedEvent, setSelectedEvent] = useState<EventModel | null>(null);

    // event selection change handler
    const onEventSelectionChange = useCallback<SchedulerListenersTypes['eventSelectionChange']>(({ selected }) => {
        setSelectedEvent(selected.length > 0 ? selected[0] : null);
    }, []);

    // add event handler
    const addEvent = useCallback(() => {
        const scheduler = schedulerInstance();
        const startDate = new Date(scheduler.startDate.getTime());
        const endDate   = new Date(startDate.getTime());
        const resource  = scheduler.resourceStore.first;

        if (!resource) {
            Toast.show('There is no resource available');
            return;
        }

        endDate.setHours(endDate.getHours() + 2);

        scheduler.eventStore.add(new AppEventModel({
            resourceId : (resource as Model).id,
            startDate,
            endDate,
            name       : 'New task',
            eventType  : 'Meeting'
        }));
    }, []);

    // remove event handler
    const removeEvent = useCallback(() => {
        selectedEvent?.remove();
        setSelectedEvent(null);
    }, [selectedEvent]);

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader/>
            <div className="demo-app">
                <div className="demo-toolbar align-right">
                    {(() => {
                        return selectedEvent ? (
                            <div className="selected-event">
                                <span>Selected event: </span>
                                <span>{selectedEvent.name}</span>
                            </div>
                        ) : (
                            ''
                        );
                    })()}

                    <BryntumNumberField
                        label="Bar margin"
                        min={0}
                        max={15}
                        value={barMargin}
                        onChange={({ value }) => setBarMargin(value)}
                    />
                    <BryntumButton
                        icon="fa fa-plus"
                        cls="b-green"
                        onClick={addEvent}
                    />
                    <BryntumButton
                        icon="fa fa-trash"
                        // b-custom-xx is used for testing purposes only. You may remove it.
                        cls={`b-red ${selectedEvent ? 'b-custom-enabled' : 'b-custom-disabled'}`}
                        onClick={removeEvent}
                        disabled={!selectedEvent}
                    />
                </div>
                <BryntumScheduler
                    ref={schedulerRef}
                    {...schedulerProps}
                    barMargin={barMargin}
                    onEventSelectionChange={onEventSelectionChange}
                />
            </div>
        </>
    );
};

export default App;
