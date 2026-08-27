/**
 * Application file
 */
import React, { Fragment, useState, useRef, useCallback, useEffect } from 'react';

import { BryntumScheduler, BryntumDemoHeader } from '@bryntum/schedulerpro-react';
import { Toast } from '@bryntum/schedulerpro';
import Popup from './components/Popup';
import { schedulerProps } from './AppConfig';
import './App.scss';

function App() {
    const scheduler = useRef();

    const [popupShown, showPopup] = useState(false);
    const [eventRecord, setEventRecord] = useState(null);
    const [eventStore, setEventStore] = useState(null);
    const [resourceStore, setResourceStore] = useState(null);

    useEffect(() => {
        const { eventStore, resourceStore } = scheduler.current.instance;
        setEventStore(eventStore);
        setResourceStore(resourceStore);
    }, []);

    const showEditor = useCallback(eventRecord => {
        setEventRecord(eventRecord);
        showPopup(true);
    }, []);

    const hideEditor = useCallback(() => {
        // If isCreating is still true, user clicked cancel
        if (eventRecord.isCreating) {
            eventStore.remove(eventRecord);
            eventRecord.isCreating = false;
        }
        setEventRecord(null);
        showPopup(false);
    }, [eventRecord, eventStore]);

    const [listeners] = useState({
        beforeEventEdit : source => {
            source.eventRecord.resourceId = source.resourceRecord.id;
            showEditor(source.eventRecord);
            return false;
        }
    }
    );

    return (
        <Fragment>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <BryntumScheduler
                ref={scheduler}
                {...schedulerProps}
                listeners={listeners}
            />
            <div>
                {popupShown ? (
                    <Popup
                        text="Popup text"
                        closePopup={hideEditor}
                        eventRecord={eventRecord}
                        eventStore={eventStore}
                        resourceStore={resourceStore}
                    ></Popup>
                ) : null}
            </div>
        </Fragment>
    );
}

export default App;


Toast.show({
    color : 'b-orange',
    html  : `
    <p>This demo was created with <strong>Create React App</strong> (CRA).</p>
    <p>Since CRA is deprecated, we recommend you to check out our React Vite demos.</p>
`,
    timeout : 10000
});
