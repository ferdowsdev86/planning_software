import { useRef } from 'react';
import type { CalendarModel, CheckboxListeners, TimeAxis, TimeSpan } from '@bryntum/schedulerpro';
import { BryntumDemoHeader, BryntumSchedulerPro, BryntumSchedulerProProjectModel } from '@bryntum/schedulerpro-react';
import { calendars, calendarsWithIntervals, projectProps, useSchedulerProProps } from './AppConfig';
import './App.scss';

function App() {
    const
        schedulerProRef = useRef<BryntumSchedulerPro>(null),
        projectRef      = useRef<BryntumSchedulerProProjectModel>(null);

    const onFilter: CheckboxListeners['change'] = ({ checked }) => {
        const
            instance = schedulerProRef.current!.instance,
            timeAxis = instance.timeAxis as TimeAxis;
        if (checked) {
            // Filter that keeps working time ticks in time axis
            timeAxis.filter(
                (t : TimeSpan) => (instance.project.calendar as CalendarModel).isWorkingTime(t.startDate as Date, t.endDate as Date)
            );
        }
        else {
            // Restore all ticks
            timeAxis.clearFilters();
        }
    };

    const onIntervals: CheckboxListeners['change'] = ({ checked }) => {
        const instance     = schedulerProRef.current!.instance;
        instance.calendars = checked ? calendarsWithIntervals : calendars;
    };

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader/>
            <BryntumSchedulerProProjectModel
                ref={projectRef}
                {...projectProps}
                calendars={calendarsWithIntervals}
            />
            <BryntumSchedulerPro
                ref={schedulerProRef}
                project={projectRef}
                {...useSchedulerProProps({
                    onFilter,
                    onIntervals
                })}
            />
        </>
    );
}

export default App;
