import { DomClassList, Toast } from '@bryntum/schedulerpro';
import { BryntumDemoHeader, BryntumScheduler, BryntumTextField } from '@bryntum/schedulerpro-react';
import React, { Fragment, useCallback, useRef } from 'react';
import { findProps, highlightProps, schedulerProps } from './AppConfig';
import './App.scss';

const App = () => {
    const scheduler = useRef(null);

    // runs when value in the filter input field changes and filters the eventStore
    const filterChangeHandler = useCallback(({ value }) => {
        const eventStore = scheduler.current.instance.eventStore;
        value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        eventStore.filter({
            filters : event => event.name.match(new RegExp(value, 'i')),
            replace : true
        });
    }, []);

    // runs when value in the highlight input field changes and highlights the matched events
    const highlightChangeHandler = useCallback(({ value }) => {
        const instance = scheduler.current.instance;

        instance.eventStore.forEach(task => {
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

        instance.element.classList[value.length > 0 ? 'add' : 'remove']('b-highlighting');
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
                    ref={scheduler}
                    {...schedulerProps}
                />
            </div>
        </Fragment>
    );
};

export default App;


Toast.show({
    color : 'b-orange',
    html  : `
    <p>This demo was created with <strong>Create React App</strong> (CRA).</p>
    <p>Since CRA is deprecated, we recommend you to check out our React Vite demos.</p>
`,
    timeout : 10000
});
