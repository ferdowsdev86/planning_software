import { useRef } from 'react';
import { BryntumDemoHeader, BryntumSchedulerPro, BryntumSchedulerProProjectModel } from '@bryntum/schedulerpro-react';
import { projectProps, schedulerProProps } from './AppConfig';
import { getDependencies } from './lib/Data';
import './App.scss';

function App() {
    const
        schedulerProRef = useRef<BryntumSchedulerPro>(null),
        projectRef      = useRef<BryntumSchedulerProProjectModel>(null);

    getDependencies().then(dependencies => {
        schedulerProRef.current!.instance.dependencyStore.data = dependencies;
    });

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader/>
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
