# Introduction

Bryntum components are data-driven by design—data is not just an enhancement, it is a core requirement.
Whether you're rendering a Scheduler, Gantt chart, or Grid, each component depends on well-structured data to
function correctly.

This guide serves as an introduction to Bryntum’s data management concepts, helping you understand the underlying
data structures, loading mechanisms, and integration strategies needed to build functional and efficient applications.

Let's start by exploring the two main sources of data:

* Inline data
* Remote data

<img src="Grid/data-sources.png" class="b-screenshot" alt="Sources of data">

## Inline data

The easiest way to feed data into your Bryntum Grid is by using inline data. Just as HTML allows inline CSS,
you can include the data directly inside the `new Grid({})` instance. Here's how to do it:

<div class="framework-tabs">
<div data-name="js">

```javascript
const grid = new Grid({
    columns : [/*...*/],
    data : [
        { id : 1, name : 'Batman' },
        { id : 2, name : 'Wolverine' },
        /*...*/
    ] 
});
```

</div>
<div data-name="react">

```javascript
const App = props => {
    const [data, setData] = useState([
        { id : 1, name : 'Dan Stevenson', city : 'Los Angeles' },
        { id : 2, name : 'Talisha Babin', city : 'Paris' }
        ...
    ]);

    return <BryntumGrid data={data} />
}
```

</div>
<div data-name="vue">

```html
<bryntum-grid :data="data" />
```

```javascript
export default {
  setup() {
    return {
      data : reactive([
        { id : 1, name : 'Dan Stevenson', city : 'Los Angeles' },
        { id : 2, name : 'Talisha Babin', city : 'Paris' }
        ...
      ])
    };
  }
}
```

</div>
<div data-name="angular">

```html
<bryntum-grid [data]="data"></bryntum-grid>
```

```typescript
@Component()
export class AppComponent {
    data = [
        { id : 1, name : 'Dan Stevenson', city : 'Los Angeles' },
        { id : 2, name : 'Talisha Babin', city : 'Paris' }
        ...
    ]
}
```

</div>
</div>

The above config results in the following Grid:

<div class="external-example" data-file="Grid/guides/readme/basic.js"></div>

## Remote data

Remote data can come from a static `.json` file hosted on a web server (e.g., in the `/public` folder of your project
or on a CDN), or it can be retrieved dynamically from a server through an API call (e.g., `data.php`).

If you have a `/data.php` endpoint, you can access the data as follows:

<div class="framework-tabs">
<div data-name="js">

```javascript
new Grid({
    store : {
        autoLoad : true,
        readUrl  : 'data.json' // can be replaced with an API endpoint (e.g. read.php)
    }
})
```

</div>
<div data-name="react">

```javascript
// Config.tsx
import { BryntumGridProps } from "@bryntum/grid-react";

const gridProps: BryntumGridProps = {
  // other config
  store : {
    autoLoad : true,
    readUrl  : 'data.json' // can be replaced with an API endpoint (e.g. read.php)
  }

};

export { gridProps };
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
import { DataGenerator } from '@bryntum/grid';
import { type BryntumGridProps } from '@bryntum/grid-vue-3';

export const gridProps : BryntumGridProps = {
    // other config
    store : {
        autoLoad : true,
        readUrl  : 'data.json' // can be replaced with an API endpoint (e.g. read.php)
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
    store : {
        readUrl    : 'data.json', // can be replaced with an API endpoint (e.g. read.php)
        autoLoad   : true,
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

The `Store` helps you manage your remote data. We'll talk more about it in the upcoming topic.

<div class="external-example" data-file="Grid/guides/readme/remote.js"></div>

You can also use `axios` or `fetch` API:

```javascript
async function loadData() {
    const response = await fetch('backend/load.php');
    return await response.json();
}

// Extract data from loadData() via `await` or `.then`
// Assuming it has been saved to `data`

const grid = new Grid({
    store : {
        data: data
    }
})

// or

grid.store.data = data;
```

Working with remote data is more complex as it offers multiple ways of interaction. Let's move on to the next topic to
learn more about how stores work.

Continue reading: [Understanding the `Store`](#Grid/guides/understanding-data/store.md)


<p class="last-modified">Last modified on 2026-07-22 10:46:48</p>