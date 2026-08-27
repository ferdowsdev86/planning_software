/**
 * Application
 */
import React, { Fragment, useEffect, useRef } from 'react';

import {
    BryntumSchedulerPro,
    BryntumResourceHistogram,
    BryntumDemoHeader,
    BryntumSplitter,
    BryntumButton,
    BryntumSchedulerProProjectModel
} from '@bryntum/schedulerpro-react';
import { Toast } from '@bryntum/schedulerpro';

import './App.scss';
import { histogramProps, schedulerProps, projectProps } from './AppConfig';

function App() {
    const schedulerRef = useRef(null);
    const histogramRef = useRef(null);
    const projectRef   = useRef(null);

    // setup partnership between scheduler and histogram
    useEffect(() => {
        histogramRef.current.instance.addPartner(schedulerRef.current.instance);
    }, []);

    // Toolbar checkboxes click handler
    const onToolbarAction = (source) => {
        const action = source.dataset.action;
        histogramRef.current.instance[action] = source.checked;
    };

    // Zoom In/Out handler
    const onZoom = ({ source }) => {
        const {
            dataset : { action }
        } = source;
        schedulerRef.current.instance[action]();
    };

    return (
        <Fragment>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <div className="demo-app">
                <div className="demo-toolbar">
                    <BryntumButton
                        dataset={{ action : 'zoomIn' }}
                        icon="b-icon-search-plus"
                        text="Zoom in"
                        onAction={onZoom}
                    />
                    <BryntumButton
                        dataset={{ action : 'zoomOut' }}
                        icon="b-icon-search-minus"
                        text="Zoom out"
                        onAction={onZoom}
                    />
                </div>
                <BryntumSchedulerProProjectModel
                    ref={projectRef}
                    {...projectProps}
                />
                <BryntumSchedulerPro
                    ref={schedulerRef}
                    project={projectRef}
                    {...schedulerProps}
                />
                <BryntumSplitter />
                <BryntumResourceHistogram
                    ref={histogramRef}
                    project={projectRef}
                    extraData={{ onToolbarAction }}
                    {...histogramProps}
                />
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
