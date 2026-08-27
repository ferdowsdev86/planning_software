# Combining multiple Bryntum products

## Thin packages overview

Bryntum products share the same data model and can be combined to provide different views of the underlying data.

When combining multiple Bryntum products in a single application using JavaScript, you should use thin npm packages.
The main difference between thin packages and regular packages is that thin only contain product specific code and
styling, while regular contain code and styling for all underlying products (for example Scheduler includes Scheduler +
Grid + Core). Thin packages are also valid for building a single product application.

<div class="note">

It is not possible to import several regular (non-thin) Bryntum npm packages like <code>@bryntum/grid</code> and
<code>@bryntum/calendar</code> in one application. Doing this will lead to a runtime console error:

```shell
The Bryntum Scheduler bundle was loaded multiple times by the application.
```

</div>

<div class="note">

Do not mix regular (e.g., <code>@bryntum/scheduler</code>) and thin (e.g., <code>@bryntum/scheduler-thin</code>) packages in the same project.
If using thin packages, remove regular ones and follow this guide to install all
<a href="#Scheduler/guides/integration/javascript/multiple-products.md#package-dependencies">required dependencies</a>.

</div>

## Thin packages list

Bryntum's npm repository contains thin packages for combining multiple Bryntum products in one application.

### Thin limited trial library packages:

| Package                          | Purpose                                            |
|----------------------------------|----------------------------------------------------|
| @bryntum/core-thin-trial         | Bryntum Core data and UI trial components package  |
| @bryntum/grid-thin-trial         | Bryntum Grid trial components package              |
| @bryntum/scheduler-thin-trial    | Bryntum Scheduler trial components package         |
| @bryntum/schedulerpro-thin-trial | Bryntum Scheduler Pro trial components package     |
| @bryntum/gantt-thin-trial        | Bryntum Gantt trial components package             |
| @bryntum/calendar-thin-trial     | Bryntum Calendar trial components package          |
| @bryntum/taskboard-thin-trial    | Bryntum TaskBoard trial components package         |
| @bryntum/engine-thin-trial       | Bryntum Scheduling engine trial components package |

<div class="note">

To use framework wrappers, trial packages listed above require aliasing the <code>@bryntum/*-thin-trial</code> package as
<code>@bryntum/*-thin</code> during installation, as shown below. Once installed, the provided app code samples can be used without
modification

</div>

Example for `@bryntum/scheduler-thin-trial` package:

```shell
npm install @bryntum/scheduler-thin@npm:@bryntum/scheduler-thin-trial@7.3.4
```

Alternatively, you can directly add entries to the `"dependencies"` section of the `package.json` project file as follows:

```json
"dependencies": {
  "@bryntum/scheduler-thin": "npm:@bryntum/scheduler-thin-trial@7.3.4",
}
```

### Thin licensed library packages:

| Package                    | Purpose                                      |
|----------------------------|----------------------------------------------|
| @bryntum/core-thin         | Bryntum Core data and UI components package  |
| @bryntum/grid-thin         | Bryntum Grid components package              |
| @bryntum/scheduler-thin    | Bryntum Scheduler components package         |
| @bryntum/schedulerpro-thin | Bryntum Scheduler Pro components package     |
| @bryntum/gantt-thin        | Bryntum Gantt components package             |
| @bryntum/calendar-thin     | Bryntum Calendar components package          |
| @bryntum/taskboard-thin    | Bryntum TaskBoard components package         |
| @bryntum/engine-thin       | Bryntum Scheduling engine components package |

## Package dependencies

Each package contains code related to the specific product only and requires installing dependency packages for
all underlying products. This is not done automatically to give you full control over the installed packages.

List of required `dependencies` used in `package.json` for JavaScript application:

<div class="docs-tabs" data-name="multiproduct">
<div>
    <a>Grid</a>
    <a>Scheduler</a>
    <a>Scheduler Pro</a>
    <a>Gantt</a>
    <a>Calendar</a>
    <a>TaskBoard</a>
</div>
<div>

```json
{
  "dependencies": {
    "@bryntum/core-thin": "7.3.4",
    "@bryntum/grid-thin": "7.3.4"
  }
}
```

</div>
<div>

```json
{
  "dependencies": {
    "@bryntum/core-thin": "7.3.4",
    "@bryntum/engine-thin": "7.3.4",
    "@bryntum/grid-thin": "7.3.4",
    "@bryntum/scheduler-thin": "7.3.4"
  }
}
```

</div>
<div>

```json
{
  "dependencies": {
    "@bryntum/core-thin": "7.3.4",
    "@bryntum/engine-thin": "7.3.4",
    "@bryntum/grid-thin": "7.3.4",
    "@bryntum/scheduler-thin": "7.3.4",
    "@bryntum/schedulerpro-thin": "7.3.4"
  }
}
```

</div>
<div>

```json
{
  "dependencies": {
    "@bryntum/core-thin": "7.3.4",
    "@bryntum/engine-thin": "7.3.4",
    "@bryntum/gantt-thin": "7.3.4",
    "@bryntum/grid-thin": "7.3.4",
    "@bryntum/scheduler-thin": "7.3.4",
    "@bryntum/schedulerpro-thin": "7.3.4"
  }
}
```

</div>
<div>

```json
{
  "dependencies": {
    "@bryntum/calendar-thin": "7.3.4",
    "@bryntum/core-thin": "7.3.4",
    "@bryntum/engine-thin": "7.3.4",
    "@bryntum/grid-thin": "7.3.4",
    "@bryntum/scheduler-thin": "7.3.4"
  }
}
```

</div>
<div>

```json
{
  "dependencies": {
    "@bryntum/core-thin": "7.3.4",
    "@bryntum/engine-thin": "7.3.4",
    "@bryntum/taskboard-thin": "7.3.4"
  }
}
```
</div>
</div>

## Product styling

List of required styles for JavaScript application `style.css/scss`:

<div class="docs-tabs" data-name="multiproduct">
<div>
    <a>Grid</a>
    <a>Scheduler</a>
    <a>Scheduler Pro</a>
    <a>Gantt</a>
    <a>Calendar</a>
    <a>TaskBoard</a>
</div>
<div>

<strong>SCSS/CSS:</strong>

```css
/* FontAwesome is used for icons */
@import '@bryntum/core-thin/fontawesome/css/fontawesome.css';
@import "@bryntum/core-thin/fontawesome/css/solid.css";
/* Structural CSS */
@import '@bryntum/core-thin/core.css';
@import '@bryntum/grid-thin/grid.css';
/* Theme */
@import '@bryntum/core-thin/svalbard-light.css';
```

</div>
<div>

<strong>SCSS/CSS:</strong>

```css
/* FontAwesome is used for icons */
@import '@bryntum/core-thin/fontawesome/css/fontawesome.css';
@import "@bryntum/core-thin/fontawesome/css/solid.css";
/* Structural CSS */
@import '@bryntum/core-thin/core.css';
@import '@bryntum/grid-thin/grid.css';
@import '@bryntum/scheduler-thin/scheduler.css';
/* Theme */
@import '@bryntum/core-thin/svalbard-light.css';
```

</div>
<div>

<strong>SCSS/CSS:</strong>

```css
/* FontAwesome is used for icons */
@import '@bryntum/core-thin/fontawesome/css/fontawesome.css';
@import "@bryntum/core-thin/fontawesome/css/solid.css";
/* Structural CSS */
@import '@bryntum/core-thin/core.css';
@import '@bryntum/grid-thin/grid.css';
@import '@bryntum/scheduler-thin/scheduler.css';
@import '@bryntum/schedulerpro-thin/schedulerpro.css';
/* Theme */
@import '@bryntum/core-thin/svalbard-light.css';
```

</div>
<div>

<strong>SCSS/CSS:</strong>

```css
/* FontAwesome is used for icons */
@import '@bryntum/core-thin/fontawesome/css/fontawesome.css';
@import "@bryntum/core-thin/fontawesome/css/solid.css";
/* Structural CSS */
@import '@bryntum/core-thin/core.css';
@import '@bryntum/grid-thin/grid.css';
@import '@bryntum/scheduler-thin/scheduler.css';
@import '@bryntum/schedulerpro-thin/schedulerpro.css';
@import '@bryntum/gantt-thin/gantt.css';
/* Theme */
@import '@bryntum/core-thin/svalbard-light.css';
```

</div>
<div>

<strong>SCSS/CSS:</strong>

```css
/* FontAwesome is used for icons */
@import '@bryntum/core-thin/fontawesome/css/fontawesome.css';
@import "@bryntum/core-thin/fontawesome/css/solid.css";
/* Structural CSS */
@import '@bryntum/core-thin/core.css';
@import '@bryntum/grid-thin/grid.css';
@import '@bryntum/scheduler-thin/scheduler.css';
@import '@bryntum/calendar-thin/calendar.css';
/* Theme */
@import '@bryntum/core-thin/svalbard-light.css';
```

</div>
<div>

<strong>SCSS/CSS:</strong>

```css
/* FontAwesome is used for icons */
@import '@bryntum/core-thin/fontawesome/css/fontawesome.css';
@import "@bryntum/core-thin/fontawesome/css/solid.css";
/* Structural CSS */
@import '@bryntum/core-thin/core.css';
@import '@bryntum/taskboard-thin/taskboard.css';
/* Theme */
@import '@bryntum/core-thin/svalbard-light.css';
```
</div>
</div>

## Product template

Example of configuring product template for JavaScript application `main.js`:

<div class="note">

This guide assumes that you're using Vite to set up your project. Otherwise, to render the styles correctly, 
you must have a <code>div</code> container with <code>id="app"</code> in your <code>index.html</code>.

</div>

<div class="docs-tabs" data-name="multiproduct">
<div>
    <a>Grid</a>
    <a>Scheduler</a>
    <a>Scheduler Pro</a>
    <a>Gantt</a>
    <a>Calendar</a>
    <a>TaskBoard</a>
</div>
<div>

```typescript
import { Grid } from '@bryntum/grid-thin';
import './style.css';

const grid = new Grid({
    appendTo : 'app',
    columns  : [
        { field : 'name', text : 'Name', width : 200 },
        { field : 'city', text : 'City', flex : 1 }
    ],
    data : [
        { name : 'Dan Stevenson', city : 'Los Angeles' },
        { name : 'Talisha Babin', city : 'Paris' }
    ]
});
```

</div>
<div>

```typescript
import { Scheduler } from '@bryntum/scheduler-thin';
import './style.css';

const scheduler = new Scheduler({
    appendTo  : 'app',
    startDate : new Date(2022, 0, 1),
    endDate   : new Date(2022, 0, 10),
    columns   : [
        { text : 'Name', field : 'name', width : 160 }
    ],
    resources : [
        { id : 1, name : 'Dan Stevenson' },
        { id : 2, name : 'Talisha Babin' }
    ],
    events : [
        { resourceId : 1, startDate : '2022-01-01', endDate : '2022-01-10' },
        { resourceId : 2, startDate : '2022-01-02', endDate : '2022-01-09' }
    ]
});
```

</div>
<div>

```typescript
import { SchedulerPro } from '@bryntum/schedulerpro-thin';
import './style.css';

const schedulerPro = new SchedulerPro({
    appendTo  : 'app',
    startDate : new Date(2022, 0, 1),
    endDate   : new Date(2022, 0, 10),
    columns   : [
        { text : 'Name', field : 'name', width : 160 }
    ],
    project : {

        resources : [
            { id : 1, name : 'Dan Stevenson' },
            { id : 2, name : 'Talisha Babin' }
        ],

        events : [
            { id : 1, startDate : '2022-01-01', duration : 3, durationUnit : 'd', name : 'Event 1' },
            { id : 2, duration : 4, durationUnit : 'd', name : 'Event 2' }
        ],

        assignments : [
            { event : 1, resource : 1 },
            { event : 2, resource : 2 }
        ],

        dependencies : [
            { fromEvent : 1, toEvent : 2 }
        ]
    }
});
```

</div>
<div>

```typescript
import { Gantt } from '@bryntum/gantt-thin';
import './style.css';

const gantt = new Gantt({
    appendTo  : 'app',
    startDate : new Date(2022, 0, 1),
    endDate   : new Date(2022, 0, 10),
    columns   : [
        { type : 'name', width : 160 }
    ],
    project : {

        tasks : [
            {
                id       : 1,
                name     : 'Write docs',
                expanded : true,
                children : [
                    { id : 2, name : 'Proof-read docs', startDate : '2022-01-02', endDate : '2022-01-09' },
                    { id : 3, name : 'Release docs', startDate : '2022-01-09', endDate : '2022-01-10' }
                ]
            }
        ],

        dependencies : [
            { fromTask : 2, toTask : 3 }
        ]
    }
});
```

</div>
<div>

```typescript
import { Calendar } from '@byntum/calendar-thin';

const calendar = new Calendar({

    appendTo : 'app',

    resources : [
        {
            id         : 1,
            name       : 'Default Calendar',
            eventColor : 'green'
        }
    ],
    events : [
        {
            id         : 1,
            name       : 'Meeting',
            startDate  : '2022-01-01T10:00:00',
            endDate    : '2022-01-01T11:00:00',
            resourceId : 1
        }
    ]
});
```

</div>
<div>

```typescript
import { TaskBoard } from '@bryntum/taskboard-thin';
import './style.css';

const taskBoard = new TaskBoard({
    appendTo    : 'app',
    columnField : 'status',
    columns     : [
        'todo',
        'doing',
        'done'
    ],
    project : {
        tasks : [
            { id : 1,  name : 'Design landing page', status : 'doing', description : 'Creating layout for the new landing page' },
            { id : 2,  name : 'Set up database schema', status : 'todo', description : 'Define tables and relationships for user data' },
            { id : 3,  name : 'Write API documentation', status : 'done', description : 'Document the REST endpoints for the project' },
            { id : 4,  name : 'Create login screen', status : 'doing', description : 'Implement authentication UI with validation' },
            { id : 5,  name : 'Integrate payment gateway', status : 'todo', description : 'Connect Stripe API to the backend' },
            { id : 6,  name : 'Fix navigation bugs', status : 'done', description : 'Resolve reported issues with navbar links' },
            { id : 7,  name : 'Build notification system', status : 'doing', description : 'Real-time push notifications for events' },
            { id : 8,  name : 'Add unit tests', status : 'todo', description : 'Write tests for services and components' },
            { id : 9,  name : 'Optimize image loading', status : 'done', description : 'Implement lazy loading for large images' },
            { id : 10, name : 'Deploy staging server', status : 'doing', description : 'Set up CI/CD pipeline for staging environment' },
            { id : 11, name : 'Create user profile page', status : 'todo', description : 'Design and implement profile management UI' },
            { id : 12, name : 'Implement role-based access control', status : 'todo', description : 'Restrict features based on user roles' },
            { id : 13, name : 'Set up error logging', status : 'todo', description : 'Integrate centralized error monitoring tool' },
            { id : 14, name : 'Improve form validation', status : 'todo', description : 'Enhance validation rules for all forms' },
            { id : 15, name : 'Add search functionality', status : 'todo', description : 'Implement search bar with filtering options' }
        ],
        resources : [
            { id : 1, name : 'Angelo' },
            { id : 2, name : 'Celia' },
            { id : 3, name : 'Dave' },
            { id : 4, name : 'Emilia' },
            { id : 5, name : 'Gloria' },
            { id : 6, name : 'Henrik' },
            { id : 7, name : 'Kate' }
        ],
        assignments : [
            { id : 1,  event : 1,  resource : 1 },
            { id : 2,  event : 2,  resource : 2 },
            { id : 3,  event : 3,  resource : 3 },
            { id : 4,  event : 4,  resource : 4 },
            { id : 5,  event : 5,  resource : 5 },
            { id : 6,  event : 6,  resource : 6 },
            { id : 7,  event : 7,  resource : 7 },
            { id : 8,  event : 8,  resource : 1 },
            { id : 9,  event : 9,  resource : 2 },
            { id : 10, event : 10, resource : 3 },
            { id : 11, event : 11, resource : 4 },
            { id : 12, event : 12, resource : 5 },
            { id : 13, event : 1,  resource : 5 },
            { id : 14, event : 2,  resource : 5 },
            { id : 15, event : 3,  resource : 5 },
            { id : 16, event : 4,  resource : 5 },
            { id : 17, event : 6,  resource : 5 },
            { id : 18, event : 7,  resource : 5 }
        ]
    }
});
```
</div>
</div>

### Non-npm packages

If you're not using npm, you can use **module** or **UMD** bundles.

#### Thin module bundle

Similar to npm packages, thin module bundles contain code for one specific product, which means that it has a 
much smaller size, but you have to use multiple bundles to get anything working (Grid for example has to 
pull in the Core bundle to work). Here's an example:

```javascript
// Import 3 classes separately from different thin bundles
import { Store } from 'core.module.thin.js';
import { Grid } from 'grid.module.thin.js';
import { Scheduler } from 'scheduler.module.thin.js';

```

#### UMD bundle

The umd bundle (`scheduler.umd.js` importable as a good old script tag, exposes all classes globally) is to be 
considered legacy. Using it is not something we recommend unless your environment prevents you from using a more modern 
bundle. It will not allow you to combine multiple products very well. Below you find a snippet here for completeness:

```html
<!-- Script tag in your html file -->
<script src="scheduler.umd.js"></script>
```

```javascript
// No imports needed, classes are exposed to window.bryntum.scheduler
const { Store, Grid, Scheduler } = window.bryntum.scheduler;

```

## Combining products

You can combine multiple products and have them on the same page. For example, if you want to combine **Grid** 
and **Scheduler**, you can have them like the following:

```javascript
import { Grid } from "@bryntum/grid-thin";
import { Scheduler } from "@bryntum/scheduler-thin";
import "./style.css"; // import styles

const grid = new Grid({
  appendTo: "app",
  columns: [
    { field: "name", text: "Name", width: 200 },
    { field: "city", text: "City", flex: 1 },
  ],
  data: [
    { name: "Dan Stevenson", city: "Los Angeles" },
    { name: "Talisha Babin", city: "Paris" },
  ],
});

const scheduler = new Scheduler({
  appendTo: "app",
  startDate: new Date(2022, 0, 1),
  endDate: new Date(2022, 0, 10),
  columns: [{ text: "Name", field: "name", width: 160 }],
  resources: [
    { id: 1, name: "Dan Stevenson" },
    { id: 2, name: "Talisha Babin" },
  ],
  events: [
    { resourceId: 1, startDate: "2022-01-01", endDate: "2022-01-10" },
    { resourceId: 2, startDate: "2022-01-02", endDate: "2022-01-09" },
  ],
});
```


<p class="last-modified">Last modified on 2026-07-22 10:51:34</p>