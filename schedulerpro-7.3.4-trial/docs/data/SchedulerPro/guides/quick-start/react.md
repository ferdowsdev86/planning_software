# Quick start guide for React integration

<div class="note">

Using an AI coding assistant? Install the <a href="#SchedulerPro/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

## Try React demos

Bryntum Scheduler Pro ships with several demo React applications that showcase its functionality. 
Each demo has been tested and confirmed to be compatible with Node.js 20.

<div class="b-card-group-2">
<a href="https://bryntum.com/products/schedulerpro/examples/?framework=react" class="b-card"><i class="fas fa-globe"></i>View online React demos</a>
<a href="#SchedulerPro/guides/integration/react/guide.md#build-and-run-local-demos" class="b-card"><i class="fab fa-react">
</i>Build and run React demos</a>
</div>

## Version requirements

Minimum supported:

 * React: `16.0.0` or higher
 * TypeScript: `3.6.0` or higher (for TypeScript application)
 * Vite: `4.0.0` or higher (for Vite application)

Recommended:

 * React: `18.0.0` or higher
 * TypeScript: `4.0.0` or higher (for TypeScript application)
 * Vite: `5.0.0` or higher (for Vite application)

## Overview of React integration

This quick start guide will show you how to integrate Bryntum Scheduler Pro into your React applications.

To illustrate the integration process, we'll build a simple application that looks like the image below.

<img src="SchedulerPro/getting-started-result.png" class="b-screenshot" alt="Getting Started on Bryntum Scheduler Pro with React Result">

Here's a breakdown of the process we'll follow:

1. [Access the Bryntum npm registry](##access-to-npm-registry)
2. [Create a React application](##create-a-react-application)
3. [Install the SchedulerPro component](##install-the-component)
4. [Add the component to the application](##add-the-component-to-the-application)
5. [Apply styles](##apply-styles)
6. [Run the application](##run-the-application)

## Access to npm registry

You can try out Bryntum components for free using our public Bryntum trial packages.
If you have a Bryntum license, please refer to our [Npm Repository Guide](#SchedulerPro/guides/npm/repository/private-repository-access.md) to access the private Bryntum repository.

## Create a React application

There are many ways to create and build React applications. In this guide, we’ll use the
[React Vite guide](https://vitejs.dev/guide), which is known for its efficiency and performance benefits in
development.

If you’re using **JavaScript only** (without TypeScript), enter the following command:

```shell
npm create vite@latest bryntum-schedulerpro-app -- --template react
```

Alternatively, if you prefer using **TypeScript**, use the following command:

```shell
npm create vite@latest bryntum-schedulerpro-app -- --template react-ts
```

You can replace `bryntum-schedulerpro-app` with your preferred application name.

After creating the template, install the Node.js modules:

```shell
cd bryntum-schedulerpro-app
npm install && npm install sass
```

## Install the component

From your terminal, update project dependencies using the following commands:

<div class="docs-tabs" data-name="licensed">
<div>
    <a>Trial version</a>
    <a>Licensed version</a>
</div>
<div>

```shell
npm install @bryntum/schedulerpro@npm:@bryntum/schedulerpro-trial@7.3.4 @bryntum/schedulerpro-react@7.3.4
```

</div>
<div>

```shell
npm install @bryntum/schedulerpro@7.3.4 @bryntum/schedulerpro-react@7.3.4
```
</div>
</div>

<div class="note">

If you're using the licensed Bryntum version, ensure that you have configured your npm properly to get access to the Bryntum packages. If not, refer to <a href="#SchedulerPro/guides/npm-repository.md">this guide</a>.

</div>

### Managing dependencies and versions

The application configuration may add a caret (`^`) as a prefix to dependency versions. 
We recommend avoiding the caret character as a version prefix to maintain full control over upgrades. 

Check the generated `package.json` file and, if necessary, replace `dependencies` and `devDependencies` 
with the following:

<div class="docs-tabs" data-name="licensed">
<div>
    <a>Trial version</a>
    <a>Licensed version</a>
</div>
<div>

```json
"dependencies": {
  "@bryntum/schedulerpro": "npm:@bryntum/schedulerpro-trial@7.3.4",
  "@bryntum/schedulerpro-react": "7.3.4",
  ...
},
...
```

</div>
<div>

```json
"dependencies": {
  "@bryntum/schedulerpro": "7.3.4",
  "@bryntum/schedulerpro-react": "7.3.4",
  ...
},
...
```
</div>
</div>

### Vite Configuration

If you're using Vite to run Bryntum Scheduler Pro in development mode, include the package in 
the [`optimizeDeps`](https://vitejs.dev/config/dep-optimization-options.html) section of 
the `vite.config.js` file to prevent bundles from loading multiple times.

Find instructions for optimizing dependencies in Vite applications 
[here](#SchedulerPro/guides/integration/react/troubleshooting.md#vite-application).

## Add the component to the application

First, create a configuration file in `src`. This file will contain the SchedulerPro settings.

<div class="docs-tabs" data-name="SchedulerPro">
<div>
    <a>Config.js</a>
    <a>Config.ts</a>
</div>
<div>

```javascript
const schedulerproProps = {

    startDate  : new Date(2026, 0, 1),
    endDate    : new Date(2026, 1, 10),
    rowHeight  : 60,
    barMargin  : 15,
    eventStyle : 'colored',
    viewPreset : 'hourAndDay',

    columns : [
        { type : 'resourceInfo', width : 150 }
    ],

    project : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data.json'
            }
        }
    }

};

export { schedulerproProps };
```

</div>
<div>

```typescript
import { BryntumSchedulerProProps } from '@bryntum/schedulerpro-react';

export const schedulerproProps: BryntumSchedulerProProps = {

    startDate  : new Date(2026, 0, 1),
    endDate    : new Date(2026, 1, 10),
    rowHeight  : 60,
    barMargin  : 15,
    eventStyle : 'colored',
    viewPreset : 'hourAndDay',

    columns : [
        { type : 'resourceInfo', width : 150 }
    ],

    project : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data.json'
            }
        }
    }

};

```
</div>
</div>

### Add component data

Now add the following content to `public/data.json`.
```javascript
{
  "success": true,
  "resources": {
    "rows": [
      { "id": 1, "name": "Dan Stevenson"     },
      { "id": 2, "name": "Talisha Babin"     },
      { "id": 3, "name": "Michael Chen"      },
      { "id": 4, "name": "Sophia Rodriguez"  },
      { "id": 5, "name": "Arjun Mehta"       }
    ]
  },
  "events": {
    "rows": [
      { "id": 1,  "startDate": "2026-01-01", "duration": 3, "durationUnit": "d", "name": "Project Kickoff"        },
      { "id": 2,  "startDate": "2026-01-04", "duration": 4, "durationUnit": "d", "name": "Requirement Gathering"  },
      { "id": 3,  "startDate": "2026-01-08", "duration": 5, "durationUnit": "d", "name": "UI/UX Design"           },
      { "id": 4,  "startDate": "2026-01-13", "duration": 7, "durationUnit": "d", "name": "Backend Development"    },
      { "id": 5,  "startDate": "2026-01-20", "duration": 6, "durationUnit": "d", "name": "Frontend Development"   },
      { "id": 6,  "startDate": "2026-01-26", "duration": 4, "durationUnit": "d", "name": "API Integration"        },
      { "id": 7,  "startDate": "2026-01-30", "duration": 3, "durationUnit": "d", "name": "Testing & QA"           },
      { "id": 8,  "startDate": "2026-02-02", "duration": 2, "durationUnit": "d", "name": "Client Review"          },
      { "id": 9,  "startDate": "2026-02-04", "duration": 3, "durationUnit": "d", "name": "Bug Fixing"             },
      { "id": 10, "startDate": "2026-02-07", "duration": 2, "durationUnit": "d", "name": "Final Deployment"       }
    ]
  },
  "assignments": {
    "rows": [
      { "event": 1,  "resource": 1 },
      { "event": 2,  "resource": 2 },
      { "event": 3,  "resource": 3 },
      { "event": 4,  "resource": 4 },
      { "event": 5,  "resource": 5 },
      { "event": 6,  "resource": 3 },
      { "event": 7,  "resource": 2 },
      { "event": 8,  "resource": 1 },
      { "event": 9,  "resource": 4 },
      { "event": 10, "resource": 5 }
    ]
  },
  "dependencies": {
    "rows": [
      { "fromEvent": 1, "toEvent": 2  },
      { "fromEvent": 2, "toEvent": 3  },
      { "fromEvent": 3, "toEvent": 4  },
      { "fromEvent": 4, "toEvent": 5  },
      { "fromEvent": 5, "toEvent": 6  },
      { "fromEvent": 6, "toEvent": 7  },
      { "fromEvent": 7, "toEvent": 8  },
      { "fromEvent": 8, "toEvent": 9  },
      { "fromEvent": 9, "toEvent": 10 }
    ]
  }
}
```

Next, replace the code in the `App.jsx` or `App.tsx` file with the following:

<div class="docs-tabs" data-name="App">
<div>
    <a>App.jsx</a>
    <a>App.tsx</a>
</div>
<div>

```javascript
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-react';
import { schedulerproProps } from './Config';
import './App.scss';

function App() {
    return (
        <BryntumSchedulerPro {...schedulerproProps} />
    );
}

export default App;
```

</div>
<div>

```typescript
import React, { FunctionComponent, useRef } from 'react';
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-react';
import { schedulerproProps } from './Config';
import './App.scss';

const App: FunctionComponent = () => {

    const schedulerpro = useRef<BryntumSchedulerPro>(null);

    return (
        <BryntumSchedulerPro
            ref = {schedulerpro}
            {...schedulerproProps}
        />
    );
};

export default App;
```
</div>
</div>

If you plan to use stateful React collections for data binding, please refer to 
[this guide](#SchedulerPro/guides/integration/react/data-binding.md).

## Apply styles

Now you can apply styles to the Bryntum Scheduler Pro component.

First, delete the `index.css` file and remove its import from the `main.jsx` or `main.tsx`. 
This will ensure that no unintended styles are applied.

Next, rename `App.css` to `App.scss` and replace its contents with the following:

```scss
// FontAwesome is used for icons
@import "@bryntum/schedulerpro/fontawesome/css/fontawesome.css";
@import "@bryntum/schedulerpro/fontawesome/css/solid.css";
// Import schedulerpro's structural CSS
@import "@bryntum/schedulerpro/schedulerpro.css";
// Import your preferred Bryntum theme
@import "@bryntum/schedulerpro/svalbard-light.css";

// Giving our schedulerpro some height
#root {
  height: 100vh;
}
```

This stylesheet imports the Bryntum SchedulerPro structural CSS, the Svalbard theme, and gives the page a two-panel layout, with the scheduler above the utilization view. Bryntum provides five themes with light and dark variants that can be customized.

Learn more about styling your Bryntum SchedulerPro in our [style guide](#SchedulerPro/guides/customization/styling.md).

## Run the application

Start the application development server:

```shell
npm run dev
```

You can now access the application in your browser at `http://localhost:5173`.

## Troubleshooting

If you run into issues while setting up your Bryntum Scheduler Pro component, refer to our 
[troubleshooting guide for Bryntum Scheduler Pro with React](#SchedulerPro/guides/integration/react/troubleshooting.md).

## What to do next?

Make the most of Bryntum Scheduler Pro in your application by learning more about advanced customization options and data management techniques.

### Advanced integration with React

Explore our [comprehensive React guide](#SchedulerPro/guides/integration/react/guide.md) to learn more about how 
Bryntum Scheduler Pro integrates with React and start customizing your application.

### Working with data in Bryntum Scheduler Pro

Our [guide to data binding](#SchedulerPro/guides/integration/react/data-binding.md) explains how data can be bound to the component.

Bryntum components often use multiple data collections and entities. 

For a detailed explanation of how these elements 
interact, see our [guide to displaying data in Bryntum Scheduler Pro](#SchedulerPro/guides/data/displayingdata.md).



<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>