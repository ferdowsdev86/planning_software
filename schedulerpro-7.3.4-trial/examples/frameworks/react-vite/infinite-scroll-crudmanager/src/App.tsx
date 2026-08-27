import { Fragment } from 'react';

import { BryntumDemoHeader, BryntumSchedulerPro } from '@bryntum/schedulerpro-react';

import { schedulerProps } from './AppConfig';

import './App.scss';

function App() {
    return (
        <Fragment>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <BryntumSchedulerPro
                {...schedulerProps}
            />
        </Fragment>
    );
}

export default App;
