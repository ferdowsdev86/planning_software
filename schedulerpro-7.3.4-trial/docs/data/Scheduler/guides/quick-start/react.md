# Quick start guide for React integration

<div class="note">

Using an AI coding assistant? Install the <a href="#Scheduler/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

[@youtube](https://www.youtube.com/embed/vDbsQQjJpXo)

## Try React demos

Bryntum Scheduler ships with several demo React applications that showcase its functionality. 
Each demo has been tested and confirmed to be compatible with Node.js 20.

<div class="b-card-group-2">
<a href="https://bryntum.com/products/scheduler/examples/?framework=react" class="b-card"><i class="fas fa-globe"></i>View online React demos</a>
<a href="#Scheduler/guides/integration/react/guide.md#build-and-run-local-demos" class="b-card"><i class="fab fa-react">
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

This quick start guide will show you how to integrate Bryntum Scheduler into your React applications.

To illustrate the integration process, we'll build a simple application that looks like the image below.

<img src="Scheduler/getting-started-result.png" class="b-screenshot" alt="Getting Started on Bryntum Scheduler with React Result">

Here's a breakdown of the process we'll follow:

1. [Access the Bryntum npm registry](##access-to-npm-registry)
2. [Create a React application](##create-a-react-application)
3. [Install the Scheduler component](##install-the-component)
4. [Add the component to the application](##add-the-component-to-the-application)
5. [Apply styles](##apply-styles)
6. [Run the application](##run-the-application)

## Access to npm registry

You can try out Bryntum components for free using our public Bryntum trial packages.
If you have a Bryntum license, please refer to our [Npm Repository Guide](#Scheduler/guides/npm/repository/private-repository-access.md) to access the private Bryntum repository.

## Create a React application

There are many ways to create and build React applications. In this guide, we’ll use the
[React Vite guide](https://vitejs.dev/guide), which is known for its efficiency and performance benefits in
development.

If you’re using **JavaScript only** (without TypeScript), enter the following command:

```shell
npm create vite@latest bryntum-scheduler-app -- --template react
```

Alternatively, if you prefer using **TypeScript**, use the following command:

```shell
npm create vite@latest bryntum-scheduler-app -- --template react-ts
```

You can replace `bryntum-scheduler-app` with your preferred application name.

After creating the template, install the Node.js modules:

```shell
cd bryntum-scheduler-app
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
npm install @bryntum/scheduler@npm:@bryntum/scheduler-trial@7.3.4 @bryntum/scheduler-react@7.3.4
```

</div>
<div>

```shell
npm install @bryntum/scheduler@7.3.4 @bryntum/scheduler-react@7.3.4
```
</div>
</div>

<div class="note">

If you're using the licensed Bryntum version, ensure that you have configured your npm properly to get access to the Bryntum packages. If not, refer to <a href="#Scheduler/guides/npm-repository.md">this guide</a>.

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
  "@bryntum/scheduler": "npm:@bryntum/scheduler-trial@7.3.4",
  "@bryntum/scheduler-react": "7.3.4",
  ...
},
...
```

</div>
<div>

```json
"dependencies": {
  "@bryntum/scheduler": "7.3.4",
  "@bryntum/scheduler-react": "7.3.4",
  ...
},
...
```
</div>
</div>

### Vite Configuration

If you're using Vite to run Bryntum Scheduler in development mode, include the package in 
the [`optimizeDeps`](https://vitejs.dev/config/dep-optimization-options.html) section of 
the `vite.config.js` file to prevent bundles from loading multiple times.

Find instructions for optimizing dependencies in Vite applications 
[here](#Scheduler/guides/integration/react/troubleshooting.md#vite-application).

## Add the component to the application

First, create a configuration file in `src`. This file will contain the Scheduler settings.

<div class="docs-tabs" data-name="Scheduler">
<div>
    <a>Config.js</a>
    <a>Config.ts</a>
</div>
<div>

```javascript
const schedulerProps = {
    startDate        : new Date(2026, 0, 1),
    endDate          : new Date(2026, 1, 10),
    rowHeight        : 50,
    barMargin        : 5,
    multiEventSelect : true,

    columns : [{ text : 'Name', field : 'name', width : 130 }],

    crudManager : {
        transport : {
            load : {
                url : 'data.json'
            }
        },
        autoLoad : true
    }
};

export { schedulerProps };
```

</div>
<div>

```typescript
import { BryntumSchedulerProps } from '@bryntum/scheduler-react';

const schedulerProps: BryntumSchedulerProps = {

    startDate        : new Date(2026, 0, 1),
    endDate          : new Date(2026, 1, 10),
    viewPreset       : 'hourAndDay',
    rowHeight        : 50,
    barMargin        : 5,
    multiEventSelect : true,

    columns : [
        { text : 'Name', field : 'name', width : 130 }
    ],

    crudManager : {
        transport : {
            load : {
                url : 'data.json'
            }
        },
        autoLoad : true
    }
};

export { schedulerProps };
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
      { "id": 1,  "name": "Dan Stevenson"   },
      { "id": 2,  "name": "Talisha Babin"   },
      { "id": 3,  "name": "Ravi Kumar"      },
      { "id": 4,  "name": "Aisha Khan"      },
      { "id": 5,  "name": "Michael Chen"    },
      { "id": 6,  "name": "Sofia Lopez"     },
      { "id": 7,  "name": "James Anderson"  },
      { "id": 8,  "name": "Eddie Johnson"   },
      { "id": 9,  "name": "Ethan Wright"    },
      { "id": 10, "name": "Liu Wei"         }
    ]
  },
  "events": {
    "rows": [
      { "resourceId": 1,  "startDate": "2026-01-01", "endDate": "2026-01-05", "name": "Kickoff Meeting"          },
      { "resourceId": 1,  "startDate": "2026-01-06", "endDate": "2026-01-10", "name": "Scope Definition"        },
      { "resourceId": 1,  "startDate": "2026-01-12", "endDate": "2026-01-29", "name": "Project Plan Review"     },
      { "resourceId": 2,  "startDate": "2026-01-02", "endDate": "2026-01-06", "name": "Requirement Gathering"   },
      { "resourceId": 2,  "startDate": "2026-01-07", "endDate": "2026-01-21", "name": "Stakeholder Interviews"  },
      { "resourceId": 2,  "startDate": "2026-01-22", "endDate": "2026-01-27", "name": "Requirement Signoff"     },
      { "resourceId": 3,  "startDate": "2026-01-05", "endDate": "2026-01-14", "name": "System Design"           },
      { "resourceId": 3,  "startDate": "2026-01-10", "endDate": "2026-01-20", "name": "Database Modeling"       },
      { "resourceId": 3,  "startDate": "2026-01-23", "endDate": "2026-01-28", "name": "API Design"              },
      { "resourceId": 4,  "startDate": "2026-01-08", "endDate": "2026-01-15", "name": "Backend Setup"           },
      { "resourceId": 4,  "startDate": "2026-01-15", "endDate": "2026-01-22", "name": "Authentication Module"   },
      { "resourceId": 4,  "startDate": "2026-01-21", "endDate": "2026-01-27", "name": "Data Services"           },
      { "resourceId": 5,  "startDate": "2026-01-02", "endDate": "2026-01-14", "name": "UI Wireframes"           },
      { "resourceId": 5,  "startDate": "2026-01-15", "endDate": "2026-01-19", "name": "Frontend Components"     },
      { "resourceId": 5,  "startDate": "2026-01-20", "endDate": "2026-01-27", "name": "Styling & Theme"         },
      { "resourceId": 6,  "startDate": "2026-01-12", "endDate": "2026-01-16", "name": "API Integration"         },
      { "resourceId": 6,  "startDate": "2026-01-17", "endDate": "2026-01-21", "name": "GraphQL Setup"           },
      { "resourceId": 6,  "startDate": "2026-01-22", "endDate": "2026-01-25", "name": "Integration Testing"     },
      { "resourceId": 7,  "startDate": "2026-01-05", "endDate": "2026-01-10", "name": "Unit Testing"            },
      { "resourceId": 7,  "startDate": "2026-01-12", "endDate": "2026-01-19", "name": "Automation Scripts"      },
      { "resourceId": 7,  "startDate": "2026-01-18", "endDate": "2026-01-27", "name": "Performance Testing"     },
      { "resourceId": 8,  "startDate": "2026-01-10", "endDate": "2026-01-22", "name": "Bug Fix Round 1"         },
      { "resourceId": 8,  "startDate": "2026-01-23", "endDate": "2026-01-26", "name": "UI Fixes"                },
      { "resourceId": 8,  "startDate": "2026-01-27", "endDate": "2026-01-30", "name": "Regression Testing"      },
      { "resourceId": 9,  "startDate": "2026-01-03", "endDate": "2026-01-14", "name": "Client Demo Prep"        },
      { "resourceId": 9,  "startDate": "2026-01-15", "endDate": "2026-01-19", "name": "Client Review"           },
      { "resourceId": 9,  "startDate": "2026-01-20", "endDate": "2026-01-24", "name": "Feedback Implementation" },
      { "resourceId": 10, "startDate": "2026-01-02", "endDate": "2026-01-16", "name": "Deployment Setup"        },
      { "resourceId": 10, "startDate": "2026-01-19", "endDate": "2026-01-22", "name": "Go-Live"                 },
      { "resourceId": 10, "startDate": "2026-01-23", "endDate": "2026-01-27", "name": "Post-Deployment Support" }
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
import { BryntumScheduler } from '@bryntum/scheduler-react';
import { schedulerProps } from './Config';
import './App.scss';

function App() {
  return <BryntumScheduler {...schedulerProps} />;
}

export default App;
```

</div>
<div>

```typescript
import React, { FunctionComponent, useRef } from 'react';
import { BryntumScheduler } from '@bryntum/scheduler-react';
import { schedulerProps } from './Config';
import './App.scss';

const App: FunctionComponent = () => {

    const scheduler = useRef<BryntumScheduler>(null);

    return (
        <BryntumScheduler
            ref = {scheduler}
            {...schedulerProps}
        />
    );
};

export default App;
```
</div>
</div>

If you plan to use stateful React collections for data binding, please refer to 
[this guide](#Scheduler/guides/integration/react/data-binding.md).

## Apply styles

Now you can apply styles to the Bryntum Scheduler component.

First, delete the `index.css` file and remove its import from the `main.jsx` or `main.tsx`. 
This will ensure that no unintended styles are applied.

Next, rename `App.css` to `App.scss` and replace its contents with the following:

```scss
// FontAwesome is used for icons
@import "@bryntum/scheduler/fontawesome/css/fontawesome.css";
@import "@bryntum/scheduler/fontawesome/css/solid.css";
// Import scheduler's structural CSS
@import "@bryntum/scheduler/scheduler.css";
// Import your preferred Bryntum theme
@import "@bryntum/scheduler/svalbard-light.css";

// Giving our scheduler some height
#root {
  height: 100vh;
}
```

This stylesheet imports the Bryntum Scheduler structural CSS, the Svalbard theme, and gives the page a two-panel layout, with the scheduler above the utilization view. Bryntum provides five themes with light and dark variants that can be customized.

Learn more about styling your Bryntum Scheduler in our [style guide](#Scheduler/guides/customization/styling.md).

## Run the application

Start the application development server:

```shell
npm run dev
```

You can now access the application in your browser at `http://localhost:5173`.

## Customizations

With your app up and running, it's time to customize some commonly used built-in features.

### Customizing context menus

The Scheduler displays context menus when you right-click either the empty space in the schedule or the event bars. 

The video below shows you how to customize existing menu items and add new items. 

[@youtube](https://www.youtube.com/embed/HAq12QUBMx8)

Take a look at this in-depth [guide to customizing the context menu](#Scheduler/guides/customization/contextmenu.md) 
for more information.

### Customizing the event editor

The Scheduler event editor is fully customizable.

The video below demonstrates basic customizations like adding new fields or modifying the default fields.

[@youtube](https://www.youtube.com/embed/ghWLmifpO_4)

Refer to this in-depth [guide to customizing the event editor](#Scheduler/guides/customization/eventedit.md) 
for more.

## Full tutorial

Take a look at this [tutorial on building a Bryntum Scheduler app with React](#Scheduler/guides/tutorial/tutorial-react.md) 
to familiarize yourself with common developer tasks.

## Troubleshooting

If you run into issues while setting up your Bryntum Scheduler component, refer to our 
[troubleshooting guide for Bryntum Scheduler with React](#Scheduler/guides/integration/react/troubleshooting.md).

## What to do next?

Make the most of Bryntum Scheduler in your application by learning more about advanced customization options and data management techniques.

### Tutorial

Take a look at this [tutorial on building a Bryntum Scheduler app with React](#Scheduler/guides/tutorial/tutorial-react.md) to familiarize yourself 
with common developer tasks.

### Advanced integration with React

Explore our [comprehensive React guide](#Scheduler/guides/integration/react/guide.md) to learn more about how 
Bryntum Scheduler integrates with React and start customizing your application.

### Working with data in Bryntum Scheduler

Bryntum components often use multiple data collections and entities. 

For a detailed explanation of how these elements 
interact, see our [guide to displaying data in Bryntum Scheduler](#Scheduler/guides/data/displayingdata.md).



<p class="last-modified">Last modified on 2026-07-22 10:51:34</p>