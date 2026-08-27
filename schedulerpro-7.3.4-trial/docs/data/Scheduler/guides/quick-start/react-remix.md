# Quick start guide for Remix integration

<div class="note">

Using an AI coding assistant? Install the <a href="#Scheduler/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

This quick start guide will show you how to build a basic Bryntum Scheduler in a Remix TypeScript application.

## Version requirements

Bryntum Scheduler requires: 

* React `16.0.0` or higher
* TypeScript `3.6.0` or higher (for TypeScript applications)

Remix version `2.15.0` requires a [Node.js LTS version](https://nodejs.org/en).

<div class="note">

Remix 3 is currently in Alpha and is planned to become framework-agnostic, moving away from React as a dependency. 
This guide covers Remix 2 with React. Check the <a href="https://remix.run/">Remix blog</a> for the latest updates.

</div>

## Overview of Remix integration

To demonstrate the integration process, we'll build a simple application that looks like the image below.

<img src="Scheduler/getting-started-result.png" class="b-screenshot" alt="Screenshot of a sample 
 Bryntum Scheduler application built using Remix">

Here's a breakdown of the steps we'll follow:

1. [Access the Bryntum npm registry](##access-the-bryntum-npm-registry)
2. [Create a Remix application](##create-a-remix-application)
3. [Install the Bryntum Scheduler component](##install-the-bryntum-scheduler-component)
4. [Add the Bryntum Scheduler component to the application](##add-the-bryntum-scheduler-component-to-the-application)
5. [Apply styles](##apply-styles)
6. [Run the application](##run-the-application)

## Access the Bryntum npm registry

Bryntum components are commercial products, hosted in a private Bryntum repository.
Please refer to the [Bryntum npm repository guide](#Scheduler/guides/npm-repository.md) for complete access information. 

## Create a Remix application

We'll use the [Remix quick start guide](https://remix.run/docs/en/main/start/quickstart) to create a Remix application.

Create a Remix application by running the following command:

```shell
npx create-remix@latest
```

This command will guide you through setting up the Remix application by asking the following questions:

```bash
- Where should we create your new project?
 my-remix-scheduler
- Initialize a new git repository?
 Yes
- Install dependencies with npm?
 Yes
```

When you've answered the questions, `create-remix` will create a folder with your 
project name and install the dependencies. 

Change to the new Remix project directory:

```shell
cd my-remix-scheduler
```

## Install the Bryntum Scheduler component

Use the commands below to install the Bryntum Scheduler package.

Installing the Bryntum Scheduler component using npm is the quickest way to use our products. First, get access to the
Bryntum private npm registry by following the [guide in our docs](#Scheduler/guides/npm-repository.md#repository-access).
Once you've logged in to the registry, install the Bryntum Scheduler component packages:

<div class="docs-tabs" data-name="licensed">
<div>
    <a>Licensed version</a>
    <a>Trial version</a>
</div>
<div>

```shell
npm install @bryntum/scheduler @bryntum/scheduler-react
```

</div>
<div>

```shell
npm install @bryntum/scheduler@npm:@bryntum/scheduler-trial @bryntum/scheduler-react
```

</div>
</div>

<div class="note">

Note: Make sure npm is properly configured to access the Bryntum packages.
If not, refer to <a href="#Scheduler/guides/npm-repository.md">the guide to using the Bryntum npm repository</a>.

</div>

Install `remix-utils` to enable client-side rendering functionality.

```shell
npm install remix-utils
```

### Managing dependencies

The application configuration may add a caret (`^`) as a prefix to dependency versions. 
We recommend avoiding the caret character as a version prefix to maintain full control over upgrades.

Check the generated `package.json` file and remove the caret character if necessary.

## Add the Bryntum Scheduler component to the application

First, create a configuration file.

In the `app` folder, create a `components` folder. Create an `app.config.tsx` file in the `components` folder and 
add the following lines of code to it:

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

This file will be used to configure the Bryntum Scheduler component.

Now create a Bryntum Scheduler React component. 

In the `app/components/` folder, create a `bryntum.client.tsx` file and add the following lines of code to it:

```typescript
import { BryntumScheduler } from '@bryntum/scheduler-react';
import { schedulerProps } from './app.config';

const BryntumClient = () => {
    return (
        <BryntumScheduler
            {...SchedulerProps}
        />
    );
};

export default BryntumClient;
```

The file extension is `.client.tsx` because Bryntum components are rendered on the **client-side** only 
and Remix uses `.client.tsx` for client-side files.

Let's create a file for example data. 

In the `public` folder, create a folder called `data`. In the `data` folder,
create a file called `data.json` and add the following JSON object to it:

```json
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

Now we'll create a wrapper component for the Bryntum Scheduler React component to ensure it renders 
only on the client side.

Replace the contents of the `app/routes/_index.tsx` file with the following code:

```typescript
import { ClientOnly } from 'remix-utils/client-only';
import BryntumClient from '~/components/bryntum.client';

export default function Index() {
    return (
        <ClientOnly fallback={<h1>Loading Bryntum Scheduler</h1>}>
            {() => <BryntumClient/>}
        </ClientOnly>
    );
}
```

## Apply styles

To style the Bryntum Scheduler, create an `app/styles/` folder and add an `index.css` file to it. 
Paste the following code into `index.css`:

```css
body,
html {
    margin         : 0;
    display        : flex;
    flex-direction : column;
    height         : 100vh;
    font-family    : Poppins, "Open Sans", Helvetica, Arial, sans-serif;
    font-size      : 14px;
}
```

Import the `index.css` file and a Bryntum theme in `Bryntum.client.tsx`:

```typescript
/* FontAwesome is used for icons */
import "@bryntum/scheduler/fontawesome/css/fontawesome.css";
import "@bryntum/scheduler/fontawesome/css/solid.css";
/* Import the structural CSS for scheduler */
import "@bryntum/scheduler/scheduler.css";
/* Import a Bryntum theme */
import "@bryntum/scheduler/svalbard-light.css";
import "../styles/index.css";
```

This stylesheet imports the Bryntum Scheduler structural CSS, the Svalbard theme, and gives the page a two-panel layout, with the scheduler above the utilization view. Bryntum provides five themes with light and dark variants that can be customized.

Learn more about styling your Bryntum Scheduler in our [style guide](#Scheduler/guides/customization/styling.md).

## Run the application

Start the local development server:

```shell
npm run dev
```

You can access the Bryntum Scheduler app in your browser at `http://localhost:5173/`.

## Troubleshooting

If you run into any issues, refer to the [troubleshooting guide](#Scheduler/guides/integration/react/troubleshooting.md).

## What to do next?

### Tutorial

Take a look at this [tutorial on building a Bryntum Scheduler app with React](#Scheduler/guides/tutorial/tutorial-react.md) to familiarize yourself 
with common developer tasks.

### Advanced integration with React

Explore our [comprehensive React guide](#Scheduler/guides/integration/react/guide.md) to learn more about 
how Bryntum Scheduler integrates with React and start customizing your application.

### Working with data in Bryntum Scheduler

Bryntum components often use multiple data collections and entities. 

For a detailed explanation of how these elements 
interact, see our [guide to displaying data in Bryntum Scheduler](#Scheduler/guides/data/displayingdata.md).



<p class="last-modified">Last modified on 2026-07-22 10:51:34</p>