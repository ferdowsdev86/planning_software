import { useRef, useState, useEffect } from 'react';
import { Scheduler } from '@bryntum/schedulerpro';
import { BryntumDemoHeader, BryntumScheduler } from '@bryntum/schedulerpro-react';
import { schedulerProps } from './AppConfig';

import './App.scss';
import DemoToolbar from './components/DemoToolbar.tsx';

const App = () => {

    const [schedulerInstance, setSchedulerInstance] = useState<Scheduler | null>(null);

    const schedulerRef = useRef<BryntumScheduler>(null);

    // Populate the schedulerInstance when the ref becomes available
    useEffect(() => {
        if (schedulerRef.current && !schedulerInstance) {
            setSchedulerInstance(schedulerRef.current.instance);
        }
    }, [schedulerRef]);

    return (
        <>
            <BryntumDemoHeader/>
            <div className="demo-app">
                {/* A lot of functionality is implemented in the Toolbar component */}
                <DemoToolbar
                    scheduler={schedulerInstance!}
                />

                <BryntumScheduler
                    ref={schedulerRef}
                    // We need to disable stripe feature to allow future enabling otherwise
                    // the feature would not exist and enabling it later would fail
                    stripeFeature={{ disabled : true }}
                    {...schedulerProps}
                />
            </div>
        </>
    );
};

export default App;
