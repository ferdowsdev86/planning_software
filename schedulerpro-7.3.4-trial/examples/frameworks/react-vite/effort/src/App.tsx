import { useRef, useEffect, useCallback } from 'react';
import {
    BryntumDemoHeader, BryntumSchedulerPro, BryntumSplitter, BryntumToolbar, BryntumResourceUtilization, BryntumSchedulerProProjectModel
} from '@bryntum/schedulerpro-react';
import { SchedulerPro, ResourceModel, ResourceUtilization } from '@bryntum/schedulerpro';
import { schedulerProps, resourceUtilizationProps, schedulerProProjectProps } from './AppConfig';
import SchedulerToolbar from './components/SchedulerToolbar';
import ResourceUtilizationToolbar from './components/ResourceUtilizationToolbar';
import './App.scss';

function App() {
    const
        schedulerRef           = useRef<BryntumSchedulerPro>(null),
        schedulerToolbarRef    = useRef<BryntumToolbar>(null),
        schedulerProProjectRef = useRef<BryntumSchedulerProProjectModel>(null),
        resourceUtilizationRef = useRef<BryntumResourceUtilization>(null),
        getScheduler           = () => schedulerRef.current!.instance;

    const onSchedulerSelectionChange = useCallback(() => {
        const
            scheduler             = getScheduler() as SchedulerPro,
            selectedRecords       = scheduler.selectedRecords as ResourceModel[],
            { calendarHighlight } = scheduler.features;

        if (selectedRecords.length > 0) {
            calendarHighlight?.highlightResourceCalendars(selectedRecords);
        }
        else {
            calendarHighlight?.unhighlightCalendars();
        }
    }, []);

    useEffect(() => {
        const
            scheduler = getScheduler() as SchedulerPro,
            resource  = resourceUtilizationRef.current!.instance as ResourceUtilization;
        // check if both scheduler and resource exist
        if (scheduler && resource) {
            // add scheduler as partner
            resource.addPartner(scheduler);
            // check if the crud manager is not loading data
            if (!schedulerProProjectRef.current!.instance.isCrudManagerLoading) {
                // load project data
                schedulerProProjectRef.current!.instance.load();
            }
        }

    }, [schedulerRef, resourceUtilizationRef]);

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader/>
            <div className="demo-app">
                <div className="schedule-container">
                    <SchedulerToolbar
                        ref={schedulerToolbarRef}
                        schedulerRef={schedulerRef}
                    />
                    <BryntumSchedulerProProjectModel
                        ref={schedulerProProjectRef}
                        {...schedulerProProjectProps}
                    />
                    <BryntumSchedulerPro
                        {...schedulerProps}
                        ref={schedulerRef}
                        project={schedulerProProjectRef}
                        onSelectionChange={onSchedulerSelectionChange}
                    />
                </div>
                <BryntumSplitter/>
                <div className="resource-container">
                    <ResourceUtilizationToolbar
                        resourceUtilizationRef={resourceUtilizationRef}
                    />
                    <BryntumResourceUtilization
                        {...resourceUtilizationProps}
                        ref={resourceUtilizationRef}
                        project={schedulerProProjectRef}
                    />
                </div>
            </div>
        </>
    );
}

export default App;
