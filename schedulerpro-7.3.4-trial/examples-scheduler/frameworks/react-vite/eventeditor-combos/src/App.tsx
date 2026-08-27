import { FunctionComponent, useRef } from 'react';
import { BryntumDemoHeader, BryntumScheduler } from '@bryntum/schedulerpro-react';
import { schedulerProps } from './AppConfig';
import './App.scss';

const App: FunctionComponent = () => {

    const scheduler = useRef<BryntumScheduler>(null);

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <BryntumScheduler
                ref = {scheduler}
                {...schedulerProps}
            />
        </>
    );
};

export default App;
