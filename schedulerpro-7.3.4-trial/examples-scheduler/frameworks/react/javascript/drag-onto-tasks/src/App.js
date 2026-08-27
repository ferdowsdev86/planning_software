import React, { Fragment, useEffect, useState } from 'react';
import { AjaxStore, SchedulerEventStore, Toast } from '@bryntum/schedulerpro';
import { BryntumDemoHeader } from '@bryntum/schedulerpro-react';
import Scheduler from './components/Scheduler.js';
import EquipmentGrid from './lib/EquipmentGrid.js';
import Task from './lib/Task.js';
import './App.scss';

const App = () => {
    // we need to pass these three down to scheduler
    // useState prevents creating new instances on each run
    const [equipmentStore] = useState(
        new AjaxStore({
            modelClass : Task,
            readUrl    : 'data/equipment.json',
            sorters    : [{ field : 'name', ascending : true }]
        })
    );
    const [eventStore] = useState(
        new SchedulerEventStore({
            modelClass : Task
        })
    );
    const [equipmentGrid] = useState(
        new EquipmentGrid({
            ref   : 'equipment',
            cls   : 'equipment',
            eventStore,
            // Use a chained Store to avoid its filtering to interfere with Scheduler's rendering
            store : equipmentStore.chain()
        })
    );
    useEffect(() => {
        equipmentGrid.appendTo = 'content';
        equipmentGrid.render();


        Toast.show({
            timeout : 3500,
            html    : 'Please note that this example uses the Bryntum Grid, which is licensed separately.'
        });
    }, [equipmentGrid]);

    return (
        <Fragment>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <div id="content" className="demo-app">
                <Scheduler
                    extraData={{ equipmentStore, EquipmentGrid, equipmentGrid }}
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
