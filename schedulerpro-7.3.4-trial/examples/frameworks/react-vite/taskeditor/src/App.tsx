import { Fragment, useRef, useEffect } from 'react';

import { BryntumDemoHeader, BryntumSchedulerPro } from '@bryntum/schedulerpro-react';
import { SchedulerPro, SchedulerEventModel, SchedulerResourceModel } from '@bryntum/schedulerpro';
import { schedulerProps, taskEditConfig } from './AppConfig';

import './App.scss';

function App() {

    const schedulerRef = useRef<BryntumSchedulerPro>(null);

    useEffect(() => {
        const schedulerInstance = schedulerRef.current!.instance as SchedulerPro;
        const { project } = schedulerInstance;

        project.on({
            // Display the editor when data is loaded
            async load() {
                // Await initial calculations
                await project.commitAsync();

                // <test>
                !document.location.search.includes('test') &&
                // </test>
                // Show the editor with 500 ms delay
                setTimeout(() => !schedulerInstance.isDestroyed && schedulerInstance.editEvent(schedulerInstance.eventStore.first as SchedulerEventModel, schedulerInstance.resourceStore.getById('weld') as SchedulerResourceModel), 500);
            }
        });

    });

    return (
        <Fragment>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <BryntumSchedulerPro
                ref = {schedulerRef}
                taskEditFeature = {taskEditConfig}
                {...schedulerProps}
            />
        </Fragment>
    );
}

export default App;
