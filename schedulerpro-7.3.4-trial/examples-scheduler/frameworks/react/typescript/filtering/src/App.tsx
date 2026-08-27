/**
 * Main App file
 */
import React, { Fragment, FunctionComponent, useCallback, useRef } from 'react';
import {
    BryntumScheduler,
    BryntumDemoHeader,
    BryntumTextField
} from '@bryntum/schedulerpro-react';
import { DomClassList, SchedulerEventModel, Scheduler, Toast } from '@bryntum/schedulerpro';
import './App.scss';
import { schedulerProps, findProps, highlightProps } from './AppConfig';

const App: FunctionComponent = () => {
    const schedulerRef = useRef<BryntumScheduler>(null);
    const schedulerInstance = () => schedulerRef.current?.instance as Scheduler;

    // runs when value in the filter input field changes and filters the eventStore
    const filterChangeHandler = useCallback(({ value }: { value: string }) => {
        const eventStore = schedulerInstance().eventStore;

        // Replace previous filtering fn with a new filter
        eventStore.filter({
            filters : (event: SchedulerEventModel) => event.name.match(new RegExp(value, 'i')),
            replace : true
        });
    }, []);

    // runs when value in the highlight input field changes and highlights the matched events
    const highlightChangeHandler = useCallback(({ value }: { value: string }) => {
        const scheduler = schedulerInstance();

        scheduler.eventStore.forEach((task: any) => {
            const taskClassList = new DomClassList(task.cls);
            const matched = taskClassList.contains('b-match');

            if (task.name.toLowerCase().indexOf(value) >= 0) {
                if (!matched) {
                    taskClassList.add('b-match');
                }
            }
            else if (matched) {
                taskClassList.remove('b-match');
            }
            task.cls = taskClassList.value;
        });
        scheduler.element.classList[value.length > 0 ? 'add' : 'remove']('b-highlighting');
    }, []);

    return (
        <Fragment>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <div className="demo-app">
                <div className="demo-toolbar align-right">
                    <BryntumTextField
                        {...findProps}
                        onInput={filterChangeHandler}
                    />
                    <BryntumTextField
                        {...highlightProps}
                        onInput={highlightChangeHandler}
                    />
                </div>
                <BryntumScheduler
                    ref={schedulerRef}
                    {...schedulerProps}
                />
            </div>
        </Fragment>
    );
};

export default App;

// <test>
!document.location.search.includes('test') &&
// </test>
Toast.show({
    color : 'b-orange',
    html  : `
        <p>This demo was created with <strong>Create React App</strong> (CRA).</p>
        <p>Since CRA is deprecated, we recommend you to check out our React Vite demos.</p>
    `,
    timeout : 10000
});
