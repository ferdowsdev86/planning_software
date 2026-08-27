# Interacting with the server

Now that we've reviewed the general concepts of working with data in Bryntum components, let's explore server 
interactions in more detail. There are multiple ways to interact with the server.

For Bryntum Scheduler, you can either use `loadUrl` to interact with all stores collectively:

```js
crudManager : {
    loadUrl : '/data.php'
}
```

or use `createUrl`,  `readUrl`, `updateUrl`, and `deleteUrl` to define an endpoint for each store individually.
For example:

<div class="framework-tabs">
<div data-name="js">

```javascript
const scheduler = new Scheduler({
  // other config
  resourceStore : {
    createUrl : 'resource/create.js',
    readUrl   : 'resource/read.js',
    updateUrl : 'resource/update.js',
    deleteUrl : 'resource/delete.js'
  }
});
```

</div>
<div data-name="react">

```javascript
// Config.tsx
import { type BryntumSchedulerProps } from "@bryntum/scheduler-react";

export const schedulerProps: BryntumSchedulerProps = {
  // other config
  resourceStore : {
    createUrl : 'resource/create.js',
    readUrl   : 'resource/read.js',
    updateUrl : 'resource/update.js',
    deleteUrl : 'resource/delete.js'
  }
};
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
  resourceStore : {
    createUrl : 'resource/create.js',
    readUrl   : 'resource/read.js',
    updateUrl : 'resource/update.js',
    deleteUrl : 'resource/delete.js'
  }
};
```

</div>
<div data-name="angular">

```html
<bryntum-scheduler
    #scheduler
    [crudManager]="schedulerProps.crudManager!"
></bryntum-scheduler>
```

```typescript
// app.config.ts
import { type BryntumSchedulerProps } from '@bryntum/scheduler-angular';

export const schedulerProps: BryntumSchedulerProps = {
  // other config
  resourceStore : {
    createUrl : 'resource/create.js',
    readUrl   : 'resource/read.js',
    updateUrl : 'resource/update.js',
    deleteUrl : 'resource/delete.js'
  }
};
```

```typescript
// app.component.ts

export class AppComponent implements AfterViewInit {

    // other config
    schedulerProps = schedulerProps;
}
```

</div>
</div>

<div class="note">

We don't recommend interacting with a store separately. The best is to use the <strong>Crud Manager</strong> for store 
interactions.

</div>

The `ResourceStore` then uses the URLs for AJAX requests for the different CRUD operations. 
You'll learn more about the `ResourceStore` in the
[store interaction](#Scheduler/guides/understanding-data/server-interaction.md#store-interaction) section below.

The `crudManager` is a top-level entity that holds multiple stores together.

You can pass `autoLoad : true`, if you want the data to be loaded automatically after a store has been initialized.

```javascript
const scheduler = new Scheduler({
  // other config
  resourceStore : {
    autoLoad  : true,
    createUrl : 'resource/create.php',
    readUrl   : 'resource/read.php',
    updateUrl : 'resource/update.php',
    deleteUrl : 'resource/delete.php'
  }
});
```

## Using Fetch

You can use the JavaScript Fetch API to fetch the data and feed it into the Bryntum Scheduler:

```javascript
const response = await fetch('resource/load.php');
const data = await response.json();

// feed it to Scheduler like this:
const scheduler = new Scheduler({
    resourceStore : {
        data : data
    }
})

// or this:
scheduler.resourceStore.data = data;
```

## Understanding Crud Manager

<img src="Scheduler/crudmanager-and-store.png" class="b-screenshot" alt="Types of data">

The Crud Manager provides an easy way to define endpoints for server interactions. It accepts only two endpoints,
one for loading data (`loadUrl`) and another for creating, updating, and deleting data (`syncUrl`).

<div class="framework-tabs">
<div data-name="js">

```javascript
const scheduler = new Scheduler({
  // other config
  crudManager : {
    loadUrl : 'read.js',
    syncUrl : 'sync.js'
  },
})
```

</div>
<div data-name="react">

```javascript
// Config.tsx
import { type BryntumSchedulerProps } from "@bryntum/scheduler-react";

export const schedulerProps: BryntumSchedulerProps = {
  // other config
  crudManager : {
    loadUrl : 'read.js',
    syncUrl : 'sync.js'
  }

};
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
      loadUrl : 'read.js',
      syncUrl : 'sync.js'
    }
};
```

</div>
<div data-name="angular">

```html
<bryntum-scheduler
    #scheduler
    [crudManager]="schedulerProps.crudManager!"
></bryntum-scheduler>
```

```typescript
// app.config.ts
import { type BryntumSchedulerProps } from '@bryntum/scheduler-angular';

export const schedulerProps: BryntumSchedulerProps = {
  // other config
  crudManager : {
    loadUrl : 'read.js',
    syncUrl : 'sync.js'
  }
};
```

```typescript
// app.component.ts

export class AppComponent implements AfterViewInit {

    // other config
    schedulerProps = schedulerProps;
}
```

</div>
</div>

Check out the 
<a href="../examples/booking/" target="_blank">Scheduler demo</a>
that uses the Crud Manager.

The Bryntum component then uses the `crudManager` to handle CRUD operations for you.
Whenever changes are made to tasks, assignments, resources, or anything else, a request is sent to the `syncUrl` path.

On the backend, you can see the type of change (Create, Update, or Delete) by looking at the request body. Then, based
on the operation type, it sends the relevant data.

The following examples use the `loadUrl` to load the Scheduler data with a fake API call
using `crudManager`.
<div class="external-example" data-file="Scheduler/guides/readme/crud.js"></div>

## Store interactions

You can use one of the stores, such as `AssignmentStore` or `ResourceStore`, to handle a specific type of store data.
For example:

```javascript
const customAssignmentStore = new AssignmentStore({
  createUrl : "assignment/create.php",
  readUrl   : "assignment/read.php",
  updateUrl : "assignment/update.php",
  deleteUrl : "assignment/delete.php"
});

new Scheduler({
  assignmentStore : customAssignmentStore
})
```

We recommend you use this approach when you have API endpoints for a specific store, like `AssignmentStore`.
The Bryntum Scheduler will then use these endpoints to interact with the server for assignment-related data.

This means you can have multiple data-specific stores:

```javascript
new Scheduler({
  assignmentStore : {
      createUrl : "assignment/create.php",
      readUrl   : "assignment/read.php",
      updateUrl : "assignment/update.php",
      deleteUrl : "assignment/delete.php"
  },
  resourceStore   : {
    createUrl : "resource/create.php",
    readUrl   : "resource/read.php",
    updateUrl : "resource/update.php",
    deleteUrl : "resource/delete.php"
  }
});
```

This is useful for managing a single store, but management becomes more difficult when you use all your stores this way.
Therefore, we encourage you to use the **Crud Manager** to manage your data.

## Headers

You can use the `headers` config to configure requests and send custom HTTP headers to the server:

```javascript
crudManager : {
  transport : {
    sync : {
        url : 'http://mycool-server.com/sync.php',
        // specify Content-Type for requests
        headers : {
            'Content-Type' : 'application/json'
        }
    }
  }
}
```

If you want send headers in a separate store :

```javascript
// Configuring headers for each request
const resourceStore = new ResourceStore({
  readUrl : "resource/read.php",
  headers : {
    "Content-Type"   : "text/xml",
    "Accept-Charset" : "utf-8",
  },
});
```

Next, let's learn how data is structured for different requests.

Continue reading: [Understanding structure](#Scheduler/guides/understanding-data/understanding-structure.md).


<p class="last-modified">Last modified on 2026-07-22 10:51:35</p>