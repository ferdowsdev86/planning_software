import { useEffect, useRef, useState } from 'react';
import { BryntumDemoHeader, BryntumGrid, BryntumSchedulerPro, BryntumSchedulerProProjectModel, BryntumSplitter } from '@bryntum/schedulerpro-react';
import { AssignmentStore, EventStore, TimeAxis, ButtonListenersTypes, DateField, DateFieldListenersTypes, DateHelper, DragHelperConfig, FilterFieldListenersTypes, GridListenersTypes, ProjectModel, ProjectModelListenersTypes, SchedulerProListenersTypes, SlideToggleListenersTypes, StoreChainedClass, SlideToggle, Splitter } from '@bryntum/schedulerpro';
import { schedulerProProps, projectProps, gridProps } from './AppConfig';
import './App.scss';
import Task from './lib/Task';
import Drag from './lib/Drag';
import MapPanel from './lib/MapPanel';

function App() {
    const
        schedulerProRef                           = useRef<BryntumSchedulerPro>(null),
        projectRef                                = useRef<BryntumSchedulerProProjectModel>(null),
        gridRef                                   = useRef<BryntumGrid>(null),
        [mapPanel, setMapPanel]                   = useState<MapPanel>(),
        [unplannedSplitter, setUnplannedSplitter] = useState<Splitter>();

    const onEventClick : SchedulerProListenersTypes['eventClick'] = ({ eventRecord }) => {
        const task = eventRecord as Task;
        if (task.marker) {
            mapPanel?.showTooltip(task, true);
        }
    };

    const onAfterEventSave: SchedulerProListenersTypes['afterEventSave'] = ({ eventRecord }) => {
        const task = eventRecord as Task;
        if (task.marker) {
            mapPanel?.scrollMarkerIntoView?.(task);
        }
    };

    const onDateFieldChange : DateFieldListenersTypes['change'] = ({ value, userAction }) => {
        if (userAction) {
            const
                startTime = DateHelper.add(value, 8, 'hour'),
                endTime   = DateHelper.add(value, 20, 'hour');

            schedulerProRef.current?.instance.setTimeSpan(startTime, endTime);
        }
    };

    const onNewEventClick : ButtonListenersTypes['click'] = () => {
        const newTask = new (projectRef.current?.instance as ProjectModel).eventStore.modelClass({
            startDate : schedulerProRef.current?.instance.startDate
        });

        schedulerProRef.current?.instance.editEvent(newTask);
    };

    const onFilterChange : FilterFieldListenersTypes['change'] = ({ value }) => {
        const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        schedulerProRef.current?.instance.eventStore.filter({
            filters : (record : Task) => new RegExp(escapedValue, 'i').test(record.name),
            replace : true
        });
    };

    const onToggleUnscheduled : SlideToggleListenersTypes['change'] = ({ value }) => {
        schedulerProRef.current?.instance.trigger('toggleUnscheduled', { value });
    };

    const onUnplannedSplitterToggle = ({ eventName }: { eventName: string }): void => {
        const slideToggle = schedulerProRef.current?.instance.widgetMap['toggleUnscheduled'] as SlideToggle;
        slideToggle.value = eventName === 'splitterCollapseClick';
    };

    const onChange : ProjectModelListenersTypes['change'] = ({ store, action }) => {
        if (store instanceof AssignmentStore) {
            if (action !== 'dataset') {
                (gridRef.current?.instance.store as StoreChainedClass).fillFromMaster();
            }
        }
    };

    const onMarkerClick = async({ eventRecord } : { eventRecord : Task }) => {
        if (eventRecord.resources.length > 0 && schedulerProRef.current?.instance) {
            await schedulerProRef.current.instance.scrollEventIntoView(eventRecord, { animate : true, highlight : true });
            schedulerProRef.current.instance.selectedEvents = [eventRecord];
        }
        else {
            await (gridRef.current?.instance as any).expand();
            (schedulerProRef.current?.instance.widgetMap['toggleUnscheduled'] as SlideToggle).value = true;
            gridRef.current?.instance.scrollRowIntoView(eventRecord, { animate : true, highlight : true });
        }
    };

    useEffect(() => {
        if (unplannedSplitter) {
            unplannedSplitter.on({
                splitterExpandClick   : onUnplannedSplitterToggle,
                splitterCollapseClick : onUnplannedSplitterToggle
            });
        }
    }, [unplannedSplitter]);

    // useEffect to initialize components when both scheduler and grid are available
    useEffect(() => {
        const
            schedulerPro = schedulerProRef.current?.instance,
            grid         = gridRef.current?.instance;

        if (schedulerPro && grid) {
            // Initialize scheduler components
            (schedulerPro.widgetMap['dateField'] as DateField).value = schedulerPro.startDate;
            schedulerPro.widgetMap['dateField'].on('change', onDateFieldChange);
            schedulerPro.widgetMap['newEventButton'].on('click', onNewEventClick);
            schedulerPro.widgetMap['filterByName'].on('change', onFilterChange);
            schedulerPro.widgetMap['toggleUnscheduled'].on('change', onToggleUnscheduled);
            schedulerPro.on('toggleUnscheduled', ({ value } : { value : boolean }) => {
                grid.toggleCollapsed(!value);
            });

            // Create MapPanel
            const mapPanel = new MapPanel({
                ref         : 'map',
                appendTo    : 'content',
                flex        : 3,
                collapsible : true,
                header      : false,
                eventStore  : schedulerPro.eventStore as EventStore,
                timeAxis    : schedulerPro.timeAxis as TimeAxis,
                listeners   : {
                    markerclick : onMarkerClick
                }
            });

            setMapPanel(mapPanel);

            const dragInstance = new Drag({
                grid,
                schedule     : schedulerPro,
                constrain    : false,
                outerElement : grid.element
            } as DragHelperConfig);

            // Cleanup function
            return () => {
                mapPanel.destroy?.();
                dragInstance.destroy();
            };
        }
    }, []);

    const onCellClick : GridListenersTypes['cellClick'] = ({ record }) => {
        const task = record as Task;
        if (task.marker) {
            mapPanel?.showTooltip(task, true);
        }
    };

    const onLoad : ProjectModelListenersTypes['load'] = () => {
        const
            grid    = gridRef.current?.instance,
            project = projectRef.current?.instance;
        if (project && grid) {
            grid.store = project.eventStore.chain(eventRecord => !(eventRecord as Task).assignments.length);
            grid.store.sort('name');
        }
    };

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <BryntumSchedulerProProjectModel
                ref={projectRef}
                onLoad={onLoad}
                onChange={onChange}
                {...projectProps}
            />
            <div className="demo-app">
                <div id='content' className='b-side-by-side'>
                    <BryntumSchedulerPro
                        ref={schedulerProRef}
                        project={projectRef}
                        onEventClick={onEventClick}
                        onAfterEventSave={onAfterEventSave}
                        {...schedulerProProps}
                    />
                    <BryntumSplitter showButtons={true} />
                </div>
                {gridRef.current?.instance &&
                <BryntumSplitter
                    showButtons="end"
                    onPaint={({ firstPaint, source }) => {
                        if (firstPaint) {
                            setUnplannedSplitter(source as Splitter);
                        }
                    }}
                />
                }
                <BryntumGrid
                    ref={gridRef}
                    {...gridProps}
                    onCellClick={onCellClick}
                />
            </div>
        </>
    );
}

export default App;
