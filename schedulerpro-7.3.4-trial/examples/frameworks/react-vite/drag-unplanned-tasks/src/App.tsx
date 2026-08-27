import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { BryntumDemoHeader, BryntumGrid, BryntumSchedulerPro, BryntumSchedulerProProjectModel, BryntumSplitter, BryntumToolbar } from '@bryntum/schedulerpro-react';
import { SchedulerResourceModel } from '@bryntum/schedulerpro';
import { schedulerProps, projectConfig, gridProps } from './AppConfig';
import SchedulerToolbar from './components/SchedulerToolbar';
import GridToolbar from './components/GridToolbar';
import { Appointment } from './lib/Appointment';
import { Doctor } from './lib/Doctor';
import { Drag } from './lib/Drag';

import './App.scss';

function App() {
    const gridRef             = useRef<BryntumGrid>(null);
    const schedulerRef        = useRef<BryntumSchedulerPro>(null);
    const projectRef          = useRef<BryntumSchedulerProProjectModel>(null);
    const dragRef             = useRef<Drag>(null);
    const schedulerToolbarRef = useRef<BryntumToolbar>(null);

    const [toggleLayout, setToggleLayout]         = useState(false);
    const [mode, setMode]                         = useState<'horizontal' | 'vertical'>('horizontal');
    const [schedulerVisible, setSchedulerVisible] = useState(true);
    const pendingModeRef                          = useRef<'horizontal' | 'vertical' | null>(null);

    // Phase 1: hide the scheduler so Bryntum fully unregisters the old instance before the new one is created
    const onModeChange = useCallback((newMode: 'horizontal' | 'vertical') => {
        if (newMode === mode) {
            return;
        }
        pendingModeRef.current = newMode;
        setSchedulerVisible(false);
    }, [mode]);

    // Phase 2: apply the pending mode and remount the scheduler with a fresh instance
    useEffect(() => {
        if (!schedulerVisible && pendingModeRef.current !== null) {
            setMode(pendingModeRef.current);
            pendingModeRef.current = null;
            setSchedulerVisible(true);
        }
    }, [schedulerVisible]);

    useEffect(() => {
        if (!schedulerVisible) {
            return;
        }

        const scheduler = schedulerRef.current?.instance;
        const grid      = gridRef.current?.instance;

        if (!scheduler || !grid || !scheduler.project) {
            return;
        }

        const { project } = scheduler;

        // Chain the event store to show only unassigned appointments in the grid
        const chainedStore = grid.store = project.eventStore.chain(
            eventRecord => !(eventRecord as Appointment).assignments.length,
            undefined,
            {
                groupers : [
                    {
                        field     : 'requiredRole',
                        ascending : true
                    }
                ]
            }
        );

        // When assignments change, update the chained store.
        // Capture the detacher so the listener is removed on cleanup; the project outlives the
        // scheduler remount, so without this each mode switch leaks an extra listener.
        const detachAssignmentListener = project.assignmentStore.on({
            change  : () => chainedStore.fillFromMaster(),
            thisObj : gridRef.current?.instance
        });

        (dragRef as Drag).current = new Drag({
            grid        : gridRef.current?.instance,
            schedule    : schedulerRef.current?.instance,
            getSchedule : () => schedulerRef.current?.instance,
            constrain   : false,
            outerElement: gridRef.current?.instance?.element
        });

        return () => {
            detachAssignmentListener?.();
            (dragRef as any).current?.destroy?.();
            (dragRef as any).current = null;
        };
    }, [schedulerVisible, mode]);

    const onSchedulerSelectionChange = useCallback(() => {
        const scheduler = schedulerRef.current?.instance;
        if (!scheduler) {
            return;
        }
        const selectedRecords       = scheduler.selectedRecords as SchedulerResourceModel[];
        const { calendarHighlight } = scheduler.features;
        if (selectedRecords.length > 0) {
            calendarHighlight.highlightResourceCalendars(selectedRecords);
        }
        else {
            calendarHighlight.unhighlightCalendars();
        }
    }, [schedulerRef.current?.instance]);

    const onGridSelectionChange = useCallback(() => {
        const scheduler = schedulerRef.current?.instance;
        if (!scheduler) {
            return;
        }
        const selectedRecords                       = gridRef.current?.instance?.selectedRecords as Appointment[];
        const { calendarHighlight }                 = scheduler.features;
        const requiredRoles: Record<string, number> = {};

        selectedRecords.forEach((appointment: Appointment) => requiredRoles[appointment.requiredRole as string] = 1);

        if (Object.keys(requiredRoles).length === 1) {
            const appointment        = selectedRecords[0] as Appointment;
            const availableResources = scheduler.resourceStore
                .query(record => (record as Doctor).role === appointment.requiredRole || !appointment.requiredRole) as SchedulerResourceModel[];
            calendarHighlight.highlightResourceCalendars(availableResources);
        }
        else {
            calendarHighlight.unhighlightCalendars();
        }
    }, [gridRef.current?.instance, schedulerRef.current?.instance]);

    const schedulerModeProps = useMemo<Record<string, any>>(
        () => mode === 'vertical'
            ? {
                mode           : 'vertical',
                subGridConfigs : {
                    locked : {
                        width    : 100,
                        minWidth : 100
                    }
                }
            }
            : {
                mode : 'horizontal'
            },
        [mode]
    );

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader/>
            <div id="content" className={toggleLayout ? 'demo-app' : 'b-side-by-side demo-app'}>
                <div className="scheduler-container">
                    <SchedulerToolbar
                        ref={schedulerToolbarRef}
                        schedulerRef={schedulerRef}
                        toggleLayout={toggleLayout}
                        setToggleLayout={setToggleLayout}
                        mode={mode}
                        setMode={onModeChange}
                    />
                    <BryntumSchedulerProProjectModel
                        ref={projectRef}
                        {...projectConfig}
                    />
                    {schedulerVisible && (
                        <BryntumSchedulerPro
                            ref={schedulerRef}
                            cls="b-scheduler-pro"
                            {...schedulerProps}
                            {...schedulerModeProps}
                            project={projectRef}
                            onSelectionChange={onSchedulerSelectionChange}
                        />
                    )}
                </div>
                <BryntumSplitter/>
                <div className="grid-container">
                    <GridToolbar
                        gridRef={gridRef}
                    />
                    <BryntumGrid
                        ref={gridRef}
                        cls="b-unplanned-grid"
                        {...gridProps}
                        onSelectionChange={onGridSelectionChange}
                    />
                </div>
            </div>
        </>
    );
}

export default App;
