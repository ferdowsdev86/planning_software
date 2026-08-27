/**
 * The React App file
 */

// React libraries
import React, { Fragment, useRef } from 'react';

// Stylings
import './App.scss';

// Application components
import {
    BryntumDemoHeader,
    BryntumSchedulerPro,
    BryntumTimeline,
    BryntumSchedulerProProjectModel
} from '@bryntum/schedulerpro-react';
import { Toast } from '@bryntum/schedulerpro';
import { schedulerProps, projectProps, timelineProps } from './AppConfig';

const App = () => {
    const projectRef = useRef(null);

    return (
        <Fragment>
            <BryntumSchedulerProProjectModel
                ref={projectRef}
                {...projectProps}
            />
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />

            <div id="content" class="demo-app">
                <BryntumTimeline
                    project={projectRef}
                    {...timelineProps}
                />
                <BryntumSchedulerPro
                    project={projectRef}
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
