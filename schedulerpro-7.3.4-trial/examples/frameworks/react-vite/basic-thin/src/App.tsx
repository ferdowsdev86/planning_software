import { useRef } from 'react';
import { BryntumDemoHeader } from '@bryntum/core-react-thin';
import { BryntumSchedulerPro, BryntumSchedulerProProjectModel } from '@bryntum/schedulerpro-react-thin';
import { schedulerProProps, projectProps } from './AppConfig';
import './App.scss';

function App() {
    const
        schedulerProRef = useRef<BryntumSchedulerPro>(null),
        projectRef      = useRef<BryntumSchedulerProProjectModel>(null);

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <BryntumSchedulerProProjectModel
                ref={projectRef}
                {...projectProps}
            />
            <BryntumSchedulerPro
                ref={schedulerProRef}
                project={projectRef}
                {...schedulerProProps}
            />
        </>
    );
}

export default App;
