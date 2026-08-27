/**
 * The App file. It should stay as simple as possible
 */
import React, { Fragment, useEffect, useRef } from 'react';

import {
    BryntumScheduler,
    BryntumDemoHeader
} from '@bryntum/schedulerpro-react';
import { StringHelper, Toast } from '@bryntum/schedulerpro';
import { schedulerProps } from './AppConfig';
import './App.scss';

const App = () => {
    const schedulerRef = useRef(null);

    // Custom eventRenderer, applying color based on event duration
    function eventRenderer({ eventRecord, renderData }) {
        const hours = eventRecord.duration * 24;
        if (hours > 8) {
            renderData.eventColor = 'red';
        }
        else if (hours > 4) {
            renderData.eventColor = 'orange';
        }
        else if (hours > 2) {
            renderData.eventColor = 'lime';
        }

        return StringHelper.xss`${eventRecord.name}<span>(${hours} hour${hours > 1 ? 's' : ''})</span>`;
    }

    function onAddClick() {
        const scheduler = schedulerRef.current.instance;
        // scheduler.columns is a store, it supports the normal Store CRUD operations
        scheduler.columns.insert(1, { text : 'Accessible', field : 'accessible', region : 'left', type : 'check' });
        scheduler.widgetMap.addButton.disable();
        scheduler.widgetMap.removeButton.enable();
    }

    function onRemoveClick() {
        const scheduler = schedulerRef.current.instance;
        scheduler.columns.getAt(1).remove();
        scheduler.widgetMap.addButton.enable();
        scheduler.widgetMap.removeButton.disable();
    }

    useEffect(() => {
        const scheduler = schedulerRef.current.instance;

        scheduler.widgetMap.addButton.on({ click : onAddClick });
        scheduler.widgetMap.removeButton.on({ click : onRemoveClick });
    }, []);

    return (
        <Fragment>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <BryntumScheduler
                ref={schedulerRef}
                eventRenderer={eventRenderer}
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
