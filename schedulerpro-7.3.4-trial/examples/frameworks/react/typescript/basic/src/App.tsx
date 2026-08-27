/**
 * Application
 */
import React, { Fragment, FunctionComponent, useRef, useEffect } from 'react';

import { BryntumDemoHeader, BryntumSchedulerPro } from '@bryntum/schedulerpro-react';
import { Toast } from '@bryntum/schedulerpro';
import { schedulerProProps } from './AppConfig';
import './App.scss';

const App: FunctionComponent = () => {
    const schedulerProRef = useRef<BryntumSchedulerPro>(null);
    const schedulerProInstance = () => schedulerProRef.current?.instance;

    useEffect(() => {
        // This shows loading data
        // To load data automatically configure project with `autoLoad : true`
        schedulerProInstance()?.project.load();
    });

    return (
        <Fragment>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <BryntumSchedulerPro
                ref={schedulerProRef}
                {...schedulerProProps}
            />
        </Fragment>
    );
};

export default App;

// <test>
!document.location.search.includes('test') &&
// </test>
Toast.show({
    color : 'b-orange',
    html  : `
        <p>This demo was created with <strong>Create React App</strong> (CRA).</p>
        <p>Since CRA is deprecated, we recommend you to check out our React Vite demos.</p>
    `,
    timeout : 10000
});
