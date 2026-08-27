# Interacting with the server

Now that we've reviewed the general concepts of working with data in Bryntum components, let's explore server 
interactions in more detail. There are multiple ways to interact with the server.

For Bryntum Grid, the only way to interact with the server is to use `AjaxStore`, which is extended
from `Store` class:

<div class="framework-tabs">
<div data-name="js">

```javascript
const grid = new Grid({
  // other config
  store : {
    createUrl : 'backend/create.js',
    readUrl   : 'backend/read.js',
    updateUrl : 'backend/update.js',
    deleteUrl : 'backend/delete.js'
  }
});
```

</div>
<div data-name="react">

```javascript
// Config.tsx
import { type BryntumGridProps } from "@bryntum/grid-react";

export const gridProps: BryntumGridProps = {
  // other config
  store : {
    createUrl : 'resource/create.js',
    readUrl   : 'resource/read.js',
    updateUrl : 'resource/update.js',
    deleteUrl : 'resource/delete.js'
  }

};
```

```javascript
import { gridProps } from "./Config";
// App.tsx
const App = props => {

    return <BryntumGrid {...gridProps} />
}
```

</div>
<div data-name="vue">

```html
<script setup lang="ts">
import { BryntumGrid } from '@bryntum/grid-vue-3';
import { gridProps } from './AppConfig.ts';
</script>

<template>
  <bryntum-grid v-bind="gridProps" />
</template>
```

```javascript
import { type BryntumGridProps } from '@bryntum/grid-vue-3';

export const gridProps : BryntumGridProps = {
  // other config
  store : {
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
<bryntum-grid
    #grid
    [store]="gridProps.store!"
></bryntum-grid>
```

```typescript
// app.config.ts
import { type BryntumGridProps } from '@bryntum/grid-angular';

export const gridProps: BryntumGridProps = {
  // other config
  store : {
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
    gridProps = gridProps;
}
```

</div>
</div>

<div class="note">

We don't recommend interacting with a store separately. The best is to use the <strong>Crud Manager</strong> for store 
interactions.

</div>

The `AjaxStore` then uses the URLs for AJAX requests for the different CRUD operations. 

You can pass `autoLoad : true`, if you want the data to be loaded automatically after a store has been initialized.

```javascript
const grid = new Grid({
  // other config
  store : {
    autoLoad  : true, 
    createUrl : 'backend/create.php',
    readUrl   : 'backend/read.php',
    updateUrl : 'backend/update.php',
    deleteUrl : 'backend/delete.php'
  }
})
```

The following example uses the `readUrl` to load the Grid data with a fake API call.
<div class="external-example" data-file="Grid/guides/readme/crud.js"></div>

## Using Fetch

You can use the JavaScript Fetch API to fetch the data and feed it into the Bryntum Grid:

```javascript
const response = await fetch('backend/load.php');
const data = await response.json();

// feed it to Grid like this:
const grid = new Grid({
    store : {
        data : data
    }
})

// or this:
grid.store.data = data;
```

## Headers

You can use the `headers` config to configure requests and send custom HTTP headers to the server:

```javascript
// Configuring headers for each request
const store = new AjaxStore({
  readUrl : "backend/read.php",
  headers : {
    "Content-Type"   : "text/xml",
    "Accept-Charset" : "utf-8",
  },
});
```

Next, let's learn how data is structured for different requests.

Continue reading: [Understanding structure](#Grid/guides/understanding-data/understanding-structure.md).


<p class="last-modified">Last modified on 2026-07-22 10:46:48</p>