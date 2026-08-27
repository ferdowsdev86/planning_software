/**
 * The React App file
 */

// React libraries
import React, { Fragment, useEffect, useRef } from 'react';

// Stylings
import './App.scss';

// Application components
import {
    BryntumDemoHeader,
    BryntumSchedulerPro
} from '@bryntum/schedulerpro-react';
import { Toast } from '@bryntum/schedulerpro';
import { schedulerProps } from './AppConfig';

const App = () => {
    const schedulerPro = useRef();

    function onAddInvalidDependencyClick() {
        const scheduler = schedulerPro.current.instance;

        // Here we add an invalid dependency linking "Arrive" event to itself
        // which naturally building a cycle..
        // This action triggers event rescheduling which then detects the cycle
        // and informs user about it.

        scheduler.dependencyStore.add({ fromEvent : 1, toEvent : 1 });
    }

    function onAddInvalidCalendarClick() {
        const scheduler = schedulerPro.current.instance;

        // Here we add an invalid calendar and assign it to "Arrive #2" event.
        // The calendar has no working intervals and thus cannot be used for scheduling,
        // Assigning of the calendar triggers event rescheduling which then detects the issue
        // and informs user about it.

        const [calendar] = scheduler.calendarManagerStore.add({
            name                     : 'Foo',
            // we setup a global not working interval on the calendar but
            // not provide any single working one so the calendar has zero working periods
            unspecifiedTimeIsWorking : false
        });

        scheduler.eventStore.getById(5).calendar = calendar;
    }

    useEffect(() => {
        const { addInvalidDependencyButton, addInvalidCalendarButton } = schedulerPro.current.instance.widgetMap;
        addInvalidDependencyButton.on({ click : onAddInvalidDependencyClick, thisObj : this });
        addInvalidCalendarButton.on({ click : onAddInvalidCalendarClick, thisObj : this });
    }, []);

    return (
        <Fragment>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <BryntumSchedulerPro
                ref={schedulerPro}
                {...schedulerProps}
            />
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
