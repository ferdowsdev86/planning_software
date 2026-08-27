/**
 * The App contains Header and Scheduler components and makes them to work together
 */
import React, { Fragment, useState, useRef, useCallback } from 'react';
import { PropTypes } from 'prop-types';

import { Toast, StringHelper } from '@bryntum/schedulerpro';
import {
    BryntumDemoHeader,
    BryntumButton,
    BryntumNumberField,
    BryntumSlideToggle
} from '@bryntum/schedulerpro-react';
import Scheduler from './components/Scheduler';
import Selected from './components/Selected';
import './App.scss';

const App = props => {
    // State
    const [barMargin, setBarMargin] = useState(props.defaultBarMargin);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [columnLines, setColumnLines] = useState({ disabled : false });
    const [stripe, setStripe] = useState({ disabled : true });

    // Scheduler ref forwarded to Scheduler component
    const schedulerRef = useRef(null);

    /**
     * Show toast and set the selected event name.
     */
    const selectionChangeHandler = useCallback(({ selection }) => {
        const name = selection.length ? selection[0].name : '';
        const msg = name ? `You selected <b>${StringHelper.encodeHtml(name)}</b>` : 'All events are <b>deselected</b>';

        setSelectedEvent(name);
        Toast.show(msg);
    }, []);

    /**
     * Add a 1hr event for the first resource at the beginning of the scheduler
     */
    const addClickHandler = useCallback(
        event => {
            // Get the scheduler instance
            const scheduler = schedulerRef.current?.instance;

            if (!scheduler) {
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
                name       : 'New task',
                eventType  : 'Meeting'
            });
        },
        [schedulerRef]
    );

    /**
     * Remove the selected event
     */
    const removeClickHandler = useCallback(
        event => {
            console.log('removeClickHandler', event);
            // Get the scheduler instance
            const scheduler = schedulerRef.current?.instance;

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
        [schedulerRef]
    );

    const rangeClickHandler = useCallback(
        () => {
            Toast.show('Please come back tomorrow 😊');
        },
        []
    );

    // Scheduler configuration
    const [schedulerProps] = useState({
        barMargin,
        onEventSelectionChange : selectionChangeHandler
    });

    return (
        <Fragment>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <div className="demo-app">
            <div className="demo-toolbar align-right">
                <BryntumNumberField
                    label="Bar Margin:"
                    width={160}
                    min={0}
                    max={15}
                    step={1}
                    value={barMargin}
                    onChange={({ value }) => setBarMargin(value)}
                />
                <div className="spacer" />

                <BryntumSlideToggle
                    label="Stripe Feature"
                    checked={false}
                    onAction={({ checked }) => setStripe({ disabled : !checked })}
                />
                <BryntumSlideToggle
                    label="Column Lines Feature"
                    checked={true}
                    onAction={({ checked }) => setColumnLines({ disabled : !checked })}
                />
                <Selected selectedEvent={selectedEvent} />
                <BryntumButton
                    icon="fa fa-plus"
                    onClick={addClickHandler}
                />
                <BryntumButton
                    color="b-red"
                    icon="fa fa-trash"
                    onClick={removeClickHandler}
                    disabled={!selectedEvent}
                />
            </div>
            <Scheduler
                ref={schedulerRef}
                {...schedulerProps}
                columnLinesFeature={columnLines}
                stripeFeature={stripe}
                resourceTimeRangesFeature={{ enableMouseEvents : true }}
                onResourceTimeRangeClick={rangeClickHandler}
            />
            </div>
        </Fragment>
    );
};

App.propTypes = {
    defaultBarMargin : PropTypes.number
};

App.defaultProps = {
    defaultBarMargin : 5
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
