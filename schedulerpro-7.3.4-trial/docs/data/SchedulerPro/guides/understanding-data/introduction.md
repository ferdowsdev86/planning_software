# Introduction

Bryntum components are data-driven by design—data is not just an enhancement, it is a core requirement.
Whether you're rendering a Scheduler, Gantt chart, or Grid, each component depends on well-structured data to
function correctly.

This guide serves as an introduction to Bryntum’s data management concepts, helping you understand the underlying
data structures, loading mechanisms, and integration strategies needed to build functional and efficient applications.

Let's start by exploring the two main sources of data:

* Inline data
* Remote data

<img src="SchedulerPro/data-sources.png" class="b-screenshot" alt="Sources of data">

## Inline data

The easiest way to feed data into your Bryntum Scheduler Pro is by using inline data. Just as HTML allows inline CSS,
you can include the data directly inside the `new SchedulerPro({})` instance. Here's how to do it:

<div class="framework-tabs">
<div data-name="js">

```javascript
new SchedulerPro({
    // other configs
    resources : [
        { id : 1, name : 'Dan Stevenson' },
        { id : 2, name : 'Talisha Babin' }
    ],

    events : [
        { id : 1, startDate : '2025-01-01', duration : 3, durationUnit : 'd', name : 'Interview' },
        { id : 2, duration : 4, durationUnit : 'd', name : 'Press Conference' }
    ],

    assignments : [
        { event : 1, resource : 1 },
        { event : 2, resource : 2 }
    ],

    dependencies : [
        { fromEvent : 1, toEvent : 2 }
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
        { id : 1, startDate : '2025-01-01', duration : 3, durationUnit : 'd', name : 'Interview' },
        { id : 2, duration : 4, durationUnit : 'd', name : 'Press Conference' }
    ]);
    const [assignments, setAssignments] = useState([
        { event : 1, resource : 1 },
        { event : 2, resource : 2 }
    ]);
    const [dependencies, setDependencies] = useState([
        { fromEvent : 1, toEvent : 2 }
    ]);

    return <BryntumSchedulerPro resources={resources} events={events} />
}
```

</div>
<div data-name="vue">

```html
<bryntum-schedulerpro :resources="resources" :events="events" :assignments="assignments" :dependencies="dependencies" />
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
        { id : 1, startDate : '2025-01-01', duration : 3, durationUnit : 'd', name : 'Interview' },
        { id : 2, duration : 4, durationUnit : 'd', name : 'Press Conference' }
    ]),
    assignments = reactive([
        { event : 1, resource : 1 },
        { event : 2, resource : 2 }
    ]),
    dependencies = reactive([
        { fromEvent : 1, toEvent : 2 }
    ])

</setup>
```

</div>
<div data-name="angular">

```html
<bryntum-schedulerpro [resources]="resources" [dependencies]="dependencies" [assignments]="assignments" [events]="events"></bryntum-schedulerpro>
```

```typescript
@Component()
export class AppComponent {
    resources = [
        { id : 1, name : 'Dan Stevenson' },
        { id : 2, name : 'Talisha Babin' }
    ];
    events = [
        { id : 1, startDate : '2025-01-01', duration : 3, durationUnit : 'd', name : 'Interview' },
        { id : 2, duration : 4, durationUnit : 'd', name : 'Press Conference' }
    ];
    assignments = [
        { event : 1, resource : 1 },
        { event : 2, resource : 2 }
    ];
    dependencies = [
        { fromEvent : 1, toEvent : 2 }
    ]
}
```

</div>
</div>

The above config results in the following SchedulerPro:

<div class="external-example" data-file="SchedulerPro/guides/readme/basic.js"></div>

## Remote data

Remote data can come from a static `.json` file hosted on a web server (e.g., in the `/public` folder of your project
or on a CDN), or it can be retrieved dynamically from a server through an API call (e.g., `data.php`).

If you have a `/data.php` endpoint, you can access the data as follows:

<div class="framework-tabs">
<div data-name="js">

```javascript
new SchedulerPro({
    project : {
        loadUrl  : '/data.php',
        autoLoad : true // auto load on initialization
    }
})
```

</div>
<div data-name="react">

```javascript
// Config.tsx
import { BryntumSchedulerProProps } from "@bryntum/schedulerpro-react";

const schedulerproProps: BryntumSchedulerProProps = {
    // other config
    project : {
        transport : {
            loadUrl : 'data.json' // can be replaced with an API endpoint (e.g. read.php)
        },
        autoLoad : true // auto load on initialization
    }

};

export { schedulerproProps };
```

```javascript
import { schedulerproProps } from "./Config";
// App.tsx
const App = props => {
    return <BryntumSchedulerPro {...schedulerproProps} />
}
```

</div>
<div data-name="vue">

```html
<script setup lang="ts">
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-vue-3';
import { schedulerproProps } from './AppConfig.ts';
</script>

<template>
  <bryntum-schedulerpro v-bind="schedulerproProps" />
</template>
```

```javascript
import { type BryntumSchedulerProProps } from '@bryntum/schedulerpro-vue-3';

export const schedulerproProps : BryntumSchedulerProProps = {
    // other config
    project : {
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

The `project` approach populates all stores in one request, reducing the API calls when loading the data.
Take a look at the load [request](#SchedulerPro/guides/data/crud_manager_project.md#load-request-structure) or 
[response](#SchedulerPro/guides/data/crud_manager_project.md#load-response-structure) structure to understand how to work with
the `project`.

<div class="external-example" data-file="SchedulerPro/guides/readme/intro.js"></div>

You can also use `axios` or `fetch` API:

```javascript
async function loadData() {
    const response = await fetch('backend/load.php');
    return await response.json();
}

// Extract data from loadData() via `await` or `.then`
// Assuming it has been saved to `data`

const schedulerpro = new SchedulerPro({
    project : {
        inlineData : data
    }
})

// or

schedulerpro.project.inlineData = data;
```

Working with remote data is more complex as it offers multiple ways of interaction. Let's move on to the next topic to
learn more about how stores work.

Continue reading: [Understanding the `Store`](#SchedulerPro/guides/understanding-data/store.md)


<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>