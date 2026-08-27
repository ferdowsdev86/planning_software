# Combining multiple Bryntum products

## Thin packages overview

Bryntum's products share the same data model and can be combined to provide different views of the underlying data.

When combining multiple Bryntum products in a single application using Vue, you should use thin npm packages. This
avoids runtime errors and also reduces the amount of code and CSS that has to be downloaded.

The main difference between thin packages and regular packages is that thin only contain product specific code and
styling, while regular contain code and styling for all underlying products (for example Scheduler includes Scheduler +
Grid + Core). Thin packages are valid for building a single product application.

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
<a href="#Scheduler/guides/integration/vue/multiple-products.md#package-dependencies">required dependencies</a>.

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

### Thin Vue 3 wrapper packages:

| Package                                         | Purpose                                                   |
|-------------------------------------------------|-----------------------------------------------------------|
| @bryntum/core-vue-3-thin         | Bryntum Core UI widgets Vue 3 wrappers package |
| @bryntum/grid-vue-3-thin         | Bryntum Grid Vue 3 wrapper package             |
| @bryntum/scheduler-vue-3-thin    | Bryntum Scheduler Vue 3 wrapper package        |
| @bryntum/schedulerpro-vue-3-thin | Bryntum Scheduler Pro Vue 3 wrapper package    |
| @bryntum/gantt-vue-3-thin        | Bryntum Gantt Vue 3 wrapper package            |
| @bryntum/calendar-vue-3-thin     | Bryntum Calendar Vue 3 wrapper package         |
| @bryntum/taskboard-vue-3-thin    | Bryntum TaskBoard Vue 3 wrapper package        |

## Package dependencies

Each package contains code related to the specific product only and requires installing a dependency packages for
all underlying products. This is not done automatically to give you full control over the installed packages.

List of required `dependencies` used in **package.json** for Vue 3 application:

<div class="note">

<code>@bryntum/core-vue-3-thin</code> is listed among the available framework wrapper packages, but you only need to
install it if you use Bryntum Core UI widgets in your app (e.g., <code>BryntumButton</code>, <code>BryntumCombo</code> etc.).
It's not needed otherwise.
<br>
However, you should always install all API packages as they are required for the proper functioning.
<br><br>
Please note that you need an active license for each product to use it in the UI.

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

API packages:

```json
{
  "dependencies": {
    "@bryntum/core-thin": "7.3.4",
    "@bryntum/grid-thin": "7.3.4"
  }
}
```

Framework wrapper packages:

```json
{
  "dependencies": {
    "@bryntum/core-vue-3-thin": "7.3.4",
    "@bryntum/grid-vue-3-thin": "7.3.4"
  }
}
```

</div>
<div>

API packages:

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

Framework wrapper packages:

```json
{
  "dependencies": {
    "@bryntum/core-vue-3-thin": "7.3.4",
    "@bryntum/scheduler-vue-3-thin": "7.3.4"
  }
}
```

</div>
<div>

API packages:

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

Framework wrapper packages:

```json
{
  "dependencies": {
    "@bryntum/core-vue-3-thin": "7.3.4",
    "@bryntum/schedulerpro-vue-3-thin": "7.3.4"
  }
}
```

</div>
<div>

API packages:

```json
{
  "dependencies": {
    "@bryntum/core-thin": "7.3.4",
    "@bryntum/engine-thin": "7.3.4",
    "@bryntum/grid-thin": "7.3.4",
    "@bryntum/scheduler-thin": "7.3.4",
    "@bryntum/schedulerpro-thin": "7.3.4",
    "@bryntum/gantt-thin": "7.3.4"
  }
}
```

Framework wrapper packages:

```json
{
  "dependencies": {
    "@bryntum/core-vue-3-thin": "7.3.4",
    "@bryntum/gantt-vue-3-thin": "7.3.4"
  }
}
```

</div>
<div>

API packages:

```json
{
  "dependencies": {
    "@bryntum/core-thin": "7.3.4",
    "@bryntum/engine-thin": "7.3.4",
    "@bryntum/grid-thin": "7.3.4",
    "@bryntum/scheduler-thin": "7.3.4",
    "@bryntum/calendar-thin": "7.3.4"
  }
}
```

Framework wrapper packages:

```json
{
  "dependencies": {
    "@bryntum/core-vue-3-thin": "7.3.4",
    "@bryntum/calendar-vue-3-thin": "7.3.4"
  }
}
```

</div>
<div>

API packages:

```json
{
  "dependencies": {
    "@bryntum/core-thin": "7.3.4",
    "@bryntum/engine-thin": "7.3.4",
    "@bryntum/taskboard-thin": "7.3.4"
  }
}
```

Framework wrapper packages:

```json
{
  "dependencies": {
    "@bryntum/core-vue-3-thin": "7.3.4",
    "@bryntum/taskboard-vue-3-thin": "7.3.4"
  }
}
```

</div>
</div>

## Product configuration

Importing product configuration for Vue 3 application **app.config.tsx**:

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
import { BryntumGridProps } from '@bryntum/grid-vue-3-thin';

const gridProps : BryntumGridProps = {
    // Grid configuration
};
```

</div>
<div>

```typescript
import { BryntumSchedulerProps } from '@bryntum/scheduler-vue-3-thin';

const schedulerProps : BryntumSchedulerProps = {
    // Scheduler configuration
};
```

</div>
<div>

```typescript
import { BryntumSchedulerProProps } from '@bryntum/schedulerpro-vue-3-thin';

const schedulerProProps : BryntumSchedulerProProps = {
    // Scheduler Pro configuration
};
```

</div>
<div>

```typescript
import { BryntumGanttProps } from '@bryntum/gantt-vue-3-thin';

const ganttProps : BryntumGanttProps = {
    // Gantt configuration
};
```

</div>
<div>

```typescript
import { BryntumCalendarProps } from '@bryntum/calendar-vue-3-thin';

const calendarProps : BryntumCalendarProps = {
    // Calendar configuration
};
```

</div>
<div>

```typescript
import { BryntumTaskBoardProps } from '@bryntum/taskboard-vue-3-thin';

const taskBoardProps : BryntumTaskBoardProps = {
    // TaskBoard configuration
};
```
</div>
</div>

## Product localization

For a complete localization information please check [localization guide](#Grid/guides/customization/localization.md).

Localization can be done using these two methods:

### Using source code

Import product locale from a thin package in your application

Example for German `De` locale:

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

```javascript
import '@bryntum/grid-thin/lib/localization/De.js'
```

</div>
<div>

```javascript
import '@bryntum/scheduler-thin/lib/localization/De.js'
```

</div>
<div>

```javascript
import '@bryntum/schedulerpro-thin/lib/localization/De.js'
```

</div>
<div>

```javascript
import '@bryntum/gantt-thin/lib/localization/De.js'
```

</div>
<div>

```javascript
import '@bryntum/calendar-thin/lib/localization/De.js'
```

</div>
<div>

```javascript
import '@bryntum/taskboard-thin/lib/localization/De.js'
```
</div>
</div>

### Using prebuilt full locale

Import full UMD locale from the installed `@bryntum` package.

Example for `De` locale:

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

```javascript
import '@bryntum/grid-thin/lib/locales/grid.locale.De.js'
```

</div>
<div>

```javascript
import '@bryntum/scheduler-thin/lib/locales/scheduler.locale.De.js'
```

</div>
<div>

```javascript
import '@bryntum/schedulerpro-thin/lib/locales/schedulerpro.locale.De.js'
```

</div>
<div>

```javascript
import '@bryntum/gantt-thin/lib/locales/gantt.locale.De.js'
```

</div>
<div>

```javascript
import '@bryntum/calendar-thin/lib/locales/calendar.locale.De.js'
```

</div>
<div>

```javascript
import '@bryntum/taskboard-thin/lib/locales/taskboard.locale.De.js'
```
</div>
</div>

Full locale can also be added to the `index.html` file of your application.
You need to copy locales from the installed @bryntum package to a folder located at `PATH_TO_LOCALE` first, and then
add this script to the application's home page.

Example for Grid product and German `De` locale:

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

```html
<script src="PATH_TO_LOCALE/locales/grid.locale.De.js"></script>
```

</div>
<div>

```html
<script src="PATH_TO_LOCALE/locales/scheduler.locale.De.js"></script>
```

</div>
<div>

```html
<script src="PATH_TO_LOCALE/locales/schedulerpro.locale.De.js"></script>
```

</div>
<div>

```html
<script src="PATH_TO_LOCALE/locales/gantt.locale.De.js"></script>
```

</div>
<div>

```html
<script src="PATH_TO_LOCALE/locales/calendar.locale.De.js"></script>
```

</div>
<div>

```html
<script src="PATH_TO_LOCALE/locales/taskboard.locale.De.js"></script>
```
</div>
</div>

## Product styling

List of required styles for Vue application **App.scss**:

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

Example of configuring product template for Vue application **App.vue**:

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
<script setup>
import { createApp, ref } from 'vue';

import { BryntumGrid } from '@bryntum/grid-vue-3-thin';
import { gridProps } from './AppConfig';

import './App.scss';

createApp({
});
</script>

<template>
    <bryntum-grid
        v-bind=gridProps
    />
</template>

<style lang="scss">
</style>
```

</div>
<div>

```typescript
<script setup>
import { createApp, ref } from 'vue';

import { BryntumScheduler } from '@bryntum/scheduler-vue-3-thin';
import { schedulerProps } from './AppConfig';

import './App.scss';

createApp({
});
</script>

<template>
    <bryntum-scheduler
        v-bind=schedulerProps
    />
</template>

<style lang="scss">
</style>
```

</div>
<div>

```typescript
<script setup>
import { createApp, ref } from 'vue';

import { BryntumSchedulerPro, BryntumSchedulerProProjectModel } from '@bryntum/schedulerpro-vue-3-thin';
import { schedulerProProjectProps, schedulerProProps } from './AppConfig';

import './App.scss';

const schedulerProProject = ref(null);

createApp({
    setup() {
        return {
            schedulerProProject
        };
    }
});
</script>

<template>
    <bryntum-scheduler-pro-project-model
        ref="schedulerProProject"
        v-bind=schedulerProProjectProps
    />
    <bryntum-scheduler-pro
        :project="schedulerProProject"
        v-bind="schedulerProProps"
    />
</template>

<style lang="scss">
</style>
```

<p>
Using <code>bryntum-scheduler-pro-project-model</code> is not obligatory, you can also configure the project by supplying a
configuration object to the <code>project</code> prop, or leave it out fully and supply data in other ways. Using the project
component is only required when you want to share the full project between multiple products.
</p>

</div>
<div>

```typescript
<script setup>
import { createApp, ref } from 'vue';

import { BryntumGantt, BryntumGanttProjectModel } from '@bryntum/gantt-vue-3-thin';
import { ganttProps, ganttProjectProps } from './AppConfig';

import './App.scss';

const ganttProject = ref(null);

createApp({
    setup() {
        return {
            ganttProject
        };
    }
});
</script>

<template>
    <bryntum-gantt-project-model
        ref="ganttProject"
        v-bind=ganttProjectProps
    />
    <bryntum-gantt
        :project="ganttProject"
        v-bind="ganttProps"
    />
</template>

<style lang="scss">
</style>
```

<p>
Using <code>bryntum-gantt-pro-project-model</code> is not obligatory, you can also configure the project by supplying a
configuration object to the <code>project</code> prop, or leave it out fully and supply data in other ways. Using the project
component is only required when you want to share the full project between multiple products.
</p>

</div>
<div>

```typescript
<script setup>
import { createApp, ref } from 'vue';

import { BryntumCalendar } from '@bryntum/calendar-vue-3-thin';
import { calendarProps } from './AppConfig';

import './App.scss';

createApp({
});
</script>

<template>
    <bryntum-calendar
        v-bind=calendarProps
    />
</template>

<style lang="scss">
</style>
```

</div>
<div>

```typescript
<script setup>
import { createApp, ref } from 'vue';

import { BryntumTaskBoard, BryntumTaskBoardProjectModel } from '@bryntum/taskboard-vue-3-thin';
import { taskBoardProjectProps,taskBoardProps } from './AppConfig';

import './App.scss';

const taskBoardProject = ref(null);

createApp({
    setup() {
        return {
            taskBoardProject
        };
    }
});
</script>

<template>
    <bryntum-task-board-project-model
        ref="taskBoardProject"
        v-bind=taskBoardProjectProps
    />
    <bryntum-task-board
        :project="taskBoardProject"
        v-bind=taskBoardProps
    />

</template>

<style lang="scss">
</style>
```

<p>
Using <code>bryntum-task-board-pro-project-model</code> is not obligatory, you can also configure the project by supplying a
configuration object to the <code>project</code> prop, or leave it out fully and supply data in other ways. Using the project
component is only required when you want to share the full project between multiple products.
</p>
</div>
</div>

## Technical demo

Technical demo showing all products in one application can be seen
[here](https://bryntum.com/products/grid/examples/frameworks/vue-3-vite/multiple-products-thin/).
You may download source there clicking on Download header icon.


<p class="last-modified">Last modified on 2026-07-22 10:51:34</p>