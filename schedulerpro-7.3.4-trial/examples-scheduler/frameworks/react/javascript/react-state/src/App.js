/**
 * The App component
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

import { Toast } from '@bryntum/schedulerpro';

import { BryntumScheduler, BryntumDemoHeader, BryntumCombo } from '@bryntum/schedulerpro-react';
import './App.scss';

import { schedulerProps, data } from './AppConfig.js';

const App = props => {
    const initialIndex = 0;
    const schedulerRef = useRef(null);

    const [index, setIndex] = useState(initialIndex);
    const [resources, setResources] = useState(data.resources[initialIndex]);
    const [events, setEvents] = useState(data.events[initialIndex]);

    // Called when user selects "Load data with Axios"
    const loadData = useCallback(() => {
        axios
            .get('./data.json')
            .then(response => {
                const { rows : resources } = response.data.resources;
                const { rows : events } = response.data.events;
                setResources(resources);
                setEvents(events);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

    // Called on index change
    useEffect(() => {
        if (index === 5) {
            loadData();
        }
        else {
            const newResources = data.resources[index] || [];
            const newEvents = data.events[index] || [];

            setResources(newResources);
            setEvents(newEvents);
        }
    }, [index, loadData]);

    // Called when data changes in any of the Scheduler stores
    const onDataChange = useCallback(({ store, action, records }) => {
        if ('dataset' !== action && store.changes) {
            Toast.show(`
            <h3>${store.id} changed</h3>
            Added: <strong>${store.changes.added.length}</strong>
            Modified: <strong>${store.changes.modified.length}</strong>
            Removed: <strong>${store.changes.removed.length}</strong>
            `);
        }
    }, []);

    const [comboItems] = useState([
        { value : 0, text : 'Dataset 0' },
        { value : 1, text : 'Dataset 1' },
        { value : 2, text : 'Dataset 2 - empty' },
        { value : 3, text : 'Dataset 3' },
        { value : 4, text : 'Dataset 4' },
        { value : 5, text : 'Load data with Axios' }
    ]);

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <div className="demo-app">
                <div className="demo-toolbar align-right">
                    <BryntumCombo
                        label="Select Dataset"
                        value={index}
                        inputWidth="12em"
                        onChange={({ value }) => setIndex(value)}
                        editable={false}
                        items={comboItems}
                    />
                </div>
                <BryntumScheduler
                    ref={schedulerRef}
                    {...schedulerProps}
                    events={events}
                    resources={resources}
                    onDataChange={onDataChange}
                />
            </div>
        </>
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
