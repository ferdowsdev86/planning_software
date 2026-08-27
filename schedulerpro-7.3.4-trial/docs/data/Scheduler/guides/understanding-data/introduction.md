# Introduction

Bryntum components are data-driven by design—data is not just an enhancement, it is a core requirement.
Whether you're rendering a Scheduler, Gantt chart, or Grid, each component depends on well-structured data to
function correctly.

This guide serves as an introduction to Bryntum’s data management concepts, helping you understand the underlying
data structures, loading mechanisms, and integration strategies needed to build functional and efficient applications.

Let's start by exploring the two main sources of data:

* Inline data
* Remote data

<img src="Scheduler/data-sources.png" class="b-screenshot" alt="Sources of data">

## Inline data

The easiest way to feed data into your Bryntum Scheduler is by using inline data. Just as HTML allows inline CSS,
you can include the data directly inside the `new Scheduler({})` instance. Here's how to do it:

<div class="framework-tabs">
<div data-name="js">

```javascript
new Scheduler({
    // other configs
    resources : [
        { id : 1, name : 'Dan Stevenson' },
        { id : 2, name : 'Talisha Babin' }
    ],

    events : [
        { id : 1, resourceId : 1, name : 'Interview', startDate : '2018-05-06', endDate : '2018-05-07' },
        { id : 2, resourceId : 1, name : 'Press conference', startDate : '2018-05-08', endDate : '2018-05-09' },
        { id : 3, resourceId : 2, name : 'Audition', startDate : '2018-05-06', endDate : '2018-05-08' },
        { id : 4, resourceId : 2, name : 'Script deadline', startDate : '2018-05-11', endDate : '2018-05-11' }
    ]
});
```

</div>
<div data-name="react">

```javascript
const App = props => {
    const [resource, setResources] = useState([
        { id : 1, name : 'Dan Stevenson' },
        { id : 2, name : 'Talisha Babin' }
    ]);
    const [events, setEvents] = useState([
        { id : 1, resourceId : 1, name : 'Interview', startDate : '2018-05-06', endDate : '2018-05-07' },
        { id : 2, resourceId : 1, name : 'Press conference', startDate : '2018-05-08', endDate : '2018-05-09' },
        { id : 3, resourceId : 2, name : 'Audition', startDate : '2018-05-06', endDate : '2018-05-08' },
        { id : 4, resourceId : 2, name : 'Script deadline', startDate : '2018-05-11', endDate : '2018-05-11' }
    ]);

    return <BryntumScheduler resources={resources} events={events} />
}
```

</div>
<div data-name="vue">

```html
<bryntum-scheduler :resources="resources" :events="events" />
```

```javascript
<script setup>
{/* other config */}

const
    resources = reactive([
        { id : 1, name : 'Dan Stevenson' },
        { id : 2, name : 'Talisha Babin' }
      ]),
    events = reactive([
        { id : 1, resourceId : 1, name : 'Interview', startDate : '2018-05-06', endDate : '2018-05-07' },
        { id : 2, resourceId : 1, name : 'Press conference', startDate : '2018-05-08', endDate : '2018-05-09' },
        { id : 3, resourceId : 2, name : 'Audition', startDate : '2018-05-06', endDate : '2018-05-08' },
        { id : 4, resourceId : 2, name : 'Script deadline', startDate : '2018-05-11', endDate : '2018-05-11' }
    ])

</setup>
```

</div>
<div data-name="angular">

```html
<bryntum-scheduler [resources]="resources" [events]="events"></bryntum-scheduler>
```

```typescript
@Component()
export class AppComponent {
    resources = [
        { id : 1, name : 'Dan Stevenson' },
        { id : 2, name : 'Talisha Babin' }
    ];
    events = [
        { id : 1, resourceId : 1, name : 'Interview', startDate : '2025-05-06', endDate : '2025-05-07' },
        { id : 2, resourceId : 1, name : 'Press conference', startDate : '2025-05-08', endDate : '2025-05-09' },
        { id : 3, resourceId : 2, name : 'Audition', startDate : '2025-05-06', endDate : '2025-05-08' },
        { id : 4, resourceId : 2, name : 'Script deadline', startDate : '2025-05-11', endDate : '2025-05-11' }
    ];
}
```

</div>
</div>

The above config results in the following Scheduler:

<div class="external-example" data-file="Scheduler/guides/readme/basic.js"></div>

## Remote data

Remote data can come from a static `.json` file hosted on a web server (e.g., in the `/public` folder of your project
or on a CDN), or it can be retrieved dynamically from a server through an API call (e.g., `data.php`).

If you have a `/data.php` endpoint, you can access the data as follows:

<div class="framework-tabs">
<div data-name="js">

```javascript
new Scheduler({
    crudManager : {
        loadUrl  : '/data.php',
        autoLoad : true // auto load on initialization
    }
})
```

</div>
<div data-name="react">

```javascript
// Config.tsx
import { BryntumSchedulerProps } from "@bryntum/scheduler-react";

const schedulerProps: BryntumSchedulerProps = {
    // other config
    crudManager : {
        transport : {
            loadUrl : 'data.json' // can be replaced with an API endpoint (e.g. read.php)
        },
        autoLoad : true // auto load on initialization
    }

};

export { schedulerProps };
```

```javascript
import { schedulerProps } from "./Config";
// App.tsx
const App = props => {
    return <BryntumScheduler {...schedulerProps} />
}
```

</div>
<div data-name="vue">

```html
<script setup lang="ts">
import { BryntumScheduler } from '@bryntum/scheduler-vue-3';
import { schedulerProps } from './AppConfig.ts';
</script>

<template>
  <bryntum-scheduler v-bind="schedulerProps" />
</template>
```

```javascript
import { type BryntumSchedulerProps } from '@bryntum/scheduler-vue-3';

export const schedulerProps : BryntumSchedulerProps = {
    // other config
    crudManager : {
        transport : {
            loadUrl : 'data.json' // can be replaced with an API endpoint (e.g. read.php)
        },
        autoLoad : true // auto load on initialization
    }
};
```

</div>
<div data-name="angular">

```html
<bryntum-gantt-project-model
    #project
    [startDate]="projectModelProps.startDate!"
    [endDate]="projectModelProps.endDate!"
    [calendar]="projectModelProps.calendar!"
    [loadUrl]="projectModelProps.loadUrl!"
    [autoLoad]="projectModelProps.autoLoad!"
></bryntum-gantt-project-model>
<bryntum-gantt
    #gantt
    [project]="project"
></bryntum-gantt>
```

```typescript
// app.config.ts
import {  BryntumGanttProjectModelProps } from '@bryntum/gantt-angular';

export const projectModelProps : BryntumGanttProjectModelProps = {
    loadUrl            : 'data.json', // can be replaced with an API endpoint (e.g. read.php)
    autoLoad           : true,
    autoSetConstraints : true
};
```

```typescript
// app.component.ts
import { projectModelProps } from './app.config';

export class AppComponent implements AfterViewInit {
    public projectModelProps = projectModelProps;
}
```

</div>
</div>

The `crudManager` approach populates all stores in one request, reducing the API calls when loading the data.
Take a look at the load [request](#Scheduler/guides/data/crud_manager.md#load-request-structure) or 
[response](#Scheduler/guides/data/crud_manager.md#load-response-structure) structure to understand how to work with
the `crudManager`.

<div class="external-example" data-file="Scheduler/guides/readme/remote.js"></div>

You can also use `axios` or `fetch` API:

```javascript
async function loadData() {
    const response = await fetch('backend/load.php');
    return await response.json();
}

// Extract data from loadData() via `await` or `.then`
// Assuming it has been saved to `data`

const scheduler = new Scheduler({
    crudManager : {
        inlineData : data
    }
})

// or

scheduler.crudManager.inlineData = data;
```

Working with remote data is more complex as it offers multiple ways of interaction. Let's move on to the next topic to
learn more about how stores work.

Continue reading: [Understanding the `Store`](#Scheduler/guides/understanding-data/store.md)


<p class="last-modified">Last modified on 2026-07-22 10:51:35</p>