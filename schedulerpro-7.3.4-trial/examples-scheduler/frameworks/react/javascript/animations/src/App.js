/**
 * The App file. It should stay as simple as possible
 */
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { DateHelper, DomHelper, Toast } from '@bryntum/schedulerpro';
import { BryntumButton, BryntumDemoHeader, BryntumScheduler, BryntumSlider } from '@bryntum/schedulerpro-react';
import { schedulerProps, sliderProps } from './AppConfig';
import './App.scss';

const App = () => {
    const schedulerRef = useRef(null);
    const [duration, setDuration] = useState(600);

    /**
     * Gets the styleNode from the head. Creates if it does not exist.
     */
    const getStyleNode = useCallback(() => {
        const styleNode =
                  DomHelper.getElement('style#duration') ||
                  DomHelper.append(document.head, {
                      id  : 'duration',
                      tag : 'style'
                  });
        return styleNode;
    }, []);
    const [styleNode] = useState(getStyleNode());

    /**
     * Sets the animation duration both in scheduler and in
     * the page head in styleNode
     */
    useEffect(() => {
        schedulerRef.current.instance.transitionDuration = duration;
        schedulerRef.current.instance.initialAnimationDuration = duration;
        styleNode.innerHTML = `.b-grid-row,.b-sch-event-wrap { animation-duration: ${duration / 1000}s !important; .b-grid-row,.b-sch-event-wrap { transition-duration: ${duration / 1000}s !important; }`;
    }, [duration, styleNode]);

    /**
     * Reshuffles some events randomly.
     */
    const randomClickHandler = useCallback(() => {
        const scheduler  = schedulerRef.current.instance,
            eventStore = scheduler.eventStore,
            indices    = [];

        // Grab a bunch of random events to change
        while (indices.length < 4) {
            const index = Math.floor(Math.random() * eventStore.count);

            if (!indices.includes(index)) {
                indices.push(index);
            }
        }
        indices.forEach(index => {
            const ev = eventStore.getAt(index);

            if (ev && ev.resource) {
                ev.beginBatch();
                ev.resourceId = ((scheduler.resourceStore.indexOf(ev.resource) + 2) % 8) + 1;
                ev.setStartDate(
                    DateHelper.add(ev.startDate, ev.startDate.getHours() % 2 ? 1 : -1, 'hour'),
                    true
                );
                ev.endBatch();
            }
        });
    }, []);

    /**
     * Resizes some events to be max 1 hour long.
     */
    const maxClickHandler = useCallback(() => {
        schedulerRef.current.instance.eventStore
            .query(task => task.eventType === 'Meeting')
            .forEach(task => (task.duration = Math.min(task.duration, 1)));
    }, []);

    /**
     * Moves some events to after lunch time.
     */
    const moveClickHandler = useCallback(() => {
        const scheduler = schedulerRef.current.instance;
        const eventStore = scheduler.eventStore;
        const lunchFinishTime = scheduler.features.timeRanges.store.getById('lunch').endDate;
        eventStore
            .query(task => task.eventType === 'Meeting')
            .forEach(
                task => (task.startDate = DateHelper.max(task.startDate, lunchFinishTime))
            );
    }, []);

    return (
        <Fragment>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <div className="demo-app">
                <div className="demo-toolbar">
                    <BryntumSlider
                        {...sliderProps}
                        value={duration}
                        onChange={({ value }) => setDuration(value)}
                    />
                    <BryntumButton
                        text="Max 1hr"
                        onClick={maxClickHandler}
                    />
                    <BryntumButton
                        text="Move to after lunch"
                        onClick={moveClickHandler}
                    />
                    <BryntumButton
                        text="Random update"
                        onClick={randomClickHandler}
                    />
                </div>
                <BryntumScheduler
                    ref={schedulerRef}
                    {...schedulerProps}
                />
            </div>
        </Fragment>
    );
};

export default App;


Toast.show({
    color : 'b-orange',
    html  : `
    <p>This demo was created with <strong>Create React App</strong> (CRA).</p>
    <p>Since CRA is deprecated, we recommend you to check out our React Vite demos.</p>
`,
    timeout : 10000
});
