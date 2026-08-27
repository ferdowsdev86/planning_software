import { useRef } from 'react';
import { BryntumDemoHeader, BryntumSchedulerPro, BryntumSchedulerProProjectModel } from '@bryntum/schedulerpro-react';
import { projectProps, schedulerProps } from './AppConfig.tsx';
import './App.scss';

function App() {

    const projectRef = useRef<BryntumSchedulerProProjectModel>(null);

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader/>
            <BryntumSchedulerProProjectModel
                ref={projectRef}
                {...projectProps}
            />
            <BryntumSchedulerPro
                project={projectRef}
                {...schedulerProps}
            />
        </>
    );
}

export default App;
