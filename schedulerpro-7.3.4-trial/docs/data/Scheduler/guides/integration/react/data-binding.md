# Binding Bryntum Scheduler data

Bryntum Scheduler is a data intensive component that uses several datasets. These datasets usually come from the server
and are held in `Scheduler` project during the lifetime of the `Scheduler` view. There are several ways of populating the
project data stores.

## Using CrudManager transport

[CrudManager](#Scheduler/data/CrudManager) is a built-in class that implements loading and saving of data in multiple
stores with [transport](#Scheduler/data/CrudManager#config-transport) config. Loading the stores and saving all
changes is done in one request.

Configuring `crudManager` with `transport` is the simplest way of binding data to the `Scheduler` project stores as seen
from the client side, but it does require following a specific protocol on the backend.

The configuration of `crudManager` can be as simple as:

```javascript
crudManager : {
    transport : {
        load : {
            url : '/server/load/url'
        },
        sync : {
            url : '/server/save/url'
        }
    },
    autoLoad : true
}
```

With this configuration, the data is loaded and saved from and to the above URLs and the data `transport` is handled
automatically.

## Binding existing data to the component

When the application already has a server transport layer then the data for Scheduler is available in application code and
it needs to be passed (bound) to the component. One approach is to make the data available as state variables and set
these as properties of the React component:

**App.js:**

```typescript
import React, { useState } from 'react';

import { schedulerProps } from './AppConfig';
import { projectData } from './AppData';

import './App.scss';

function App() {
    const [events, setEvents] = useState(projectData.events);
    const [assignments, setAssignments] = useState(projectData.assignments);
    const [dependencies, setDependencies] = useState(projectData.dependencies);
    const [resources, setResources] = useState(projectData.resources);

    return (
        <BryntumScheduler
            ref = {scheduler}
            events = {events}
            assignments = {assignments}
            dependencies = {dependencies}
            resources = {resources}
            {...schedulerProps}
        />
    );
}

export default App;
```

Here we have state variables, one per data set, together with their setters so whenever a change of data is needed the
setter needs to be called with new data as the argument and the change will be immediately reflected in the `Scheduler`.

For example:

```javascript
setEvents(newEvents);
setResources(newResources);
```

<div class="note">

When binding to data, the same principles as for React state applies - an object in the incoming data must be replaced
instead of mutated for a change to be detected (
<a href="https://react.dev/learn/updating-objects-in-state">explained by the React team here</a>).<br><br>
If you cannot follow best practise and have to mutate the objects, you can configure the underlying store with
<code>useRawData: false</code>. It will then clone the incoming objects and can thus detect mutations when state is reapplied,
trading performance for flexibility (<a href="#Core/data/Store#config-useRawData">docs here</a>).

</div>

## Binding existing data to the project

This approach binds data to a standalone `SchedulerProjectModel` and then uses this project in `Scheduler`. Project has
its own markup in the template and it must be assigned to the `Scheduler` during initialization.

This approach is suitable for more complex applications that use more than one Bryntum component that share a common
project:

**App.js:**

```typescript
import React, { useState, useRef } from 'react';

import { schedulerProps, projectProps } from './AppConfig';
import { projectData } from './AppData';

import './App.scss';

function App() {
    const scheduler = useRef();
    const project = useRef();

    const [events] = useState(projectData.events);
    const [assignments] = useState(projectData.assignments);
    const [dependencies] = useState(projectData.dependencies);
    const [resources] = useState(projectData.resources);

    return (
        <>
            <BryntumSchedulerProjectModel
                ref = {project}
                events = {events}
                assignments = {assignments}
                dependencies = {dependencies}
                resources = {resources}
                {...projectProps}
            />
            <BryntumScheduler
                ref = {scheduler}
                project = {project}
                {...schedulerProps}
            />
        </>
    );
}

export default App;
```

Here we create a standalone `SchedulerProjectModel` (without any rendered output) with properties bound to individual data
sets. The project must be assigned to `Scheduler` in `useEffect` which is configured to run only once on component mount.

<div class="note">

Note that <code>BryntumSchedulerProjectModel</code> must be returned first for other components to use it. Otherwise the <code>Scheduler</code>
appears blank, without any data.

</div>

## Working with Redux

Bryntum components can also be integrated with a Redux `Store` using the same workflow that you would use to manage the
state of a traditional React project.

To see this in action, you can try out our Bryntum Taskboard
[React + Redux demo](https://bryntum.com/products/scheduler/examples/frameworks/react/javascript/advanced/).



<p class="last-modified">Last modified on 2026-07-22 10:51:34</p>