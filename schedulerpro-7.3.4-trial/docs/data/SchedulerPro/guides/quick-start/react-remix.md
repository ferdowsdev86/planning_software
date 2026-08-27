# Quick start guide for Remix integration

<div class="note">

Using an AI coding assistant? Install the <a href="#SchedulerPro/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

This quick start guide will show you how to build a basic Bryntum SchedulerPro in a Remix TypeScript application.

## Version requirements

Bryntum SchedulerPro requires: 

* React `16.0.0` or higher
* TypeScript `3.6.0` or higher (for TypeScript applications)

Remix version `2.15.0` requires a [Node.js LTS version](https://nodejs.org/en).

<div class="note">

Remix 3 is currently in Alpha and is planned to become framework-agnostic, moving away from React as a dependency. 
This guide covers Remix 2 with React. Check the <a href="https://remix.run/">Remix blog</a> for the latest updates.

</div>

## Overview of Remix integration

To demonstrate the integration process, we'll build a simple application that looks like the image below.

<img src="SchedulerPro/getting-started-result.png" class="b-screenshot" alt="Screenshot of a sample 
 Bryntum Scheduler Pro application built using Remix">

Here's a breakdown of the steps we'll follow:

1. [Access the Bryntum npm registry](##access-the-bryntum-npm-registry)
2. [Create a Remix application](##create-a-remix-application)
3. [Install the Bryntum SchedulerPro component](##install-the-bryntum-schedulerpro-component)
4. [Add the Bryntum SchedulerPro component to the application](##add-the-bryntum-schedulerpro-component-to-the-application)
5. [Apply styles](##apply-styles)
6. [Run the application](##run-the-application)

## Access the Bryntum npm registry

Bryntum components are commercial products, hosted in a private Bryntum repository.
Please refer to the [Bryntum npm repository guide](#SchedulerPro/guides/npm-repository.md) for complete access information. 

## Create a Remix application

We'll use the [Remix quick start guide](https://remix.run/docs/en/main/start/quickstart) to create a Remix application.

Create a Remix application by running the following command:

```shell
npx create-remix@latest
```

This command will guide you through setting up the Remix application by asking the following questions:

```bash
- Where should we create your new project?
 my-remix-schedulerpro
- Initialize a new git repository?
 Yes
- Install dependencies with npm?
 Yes
```

When you've answered the questions, `create-remix` will create a folder with your 
project name and install the dependencies. 

Change to the new Remix project directory:

```shell
cd my-remix-schedulerpro
```

## Install the Bryntum SchedulerPro component

Use the commands below to install the Bryntum SchedulerPro package.

Installing the Bryntum SchedulerPro component using npm is the quickest way to use our products. First, get access to the
Bryntum private npm registry by following the [guide in our docs](#SchedulerPro/guides/npm-repository.md#repository-access).
Once you've logged in to the registry, install the Bryntum SchedulerPro component packages:

<div class="docs-tabs" data-name="licensed">
<div>
    <a>Licensed version</a>
    <a>Trial version</a>
</div>
<div>

```shell
npm install @bryntum/schedulerpro @bryntum/schedulerpro-react
```

</div>
<div>

```shell
npm install @bryntum/schedulerpro@npm:@bryntum/schedulerpro-trial @bryntum/schedulerpro-react
```

</div>
</div>

<div class="note">

Note: Make sure npm is properly configured to access the Bryntum packages.
If not, refer to <a href="#SchedulerPro/guides/npm-repository.md">the guide to using the Bryntum npm repository</a>.

</div>

Install `remix-utils` to enable client-side rendering functionality.

```shell
npm install remix-utils
```

### Managing dependencies

The application configuration may add a caret (`^`) as a prefix to dependency versions. 
We recommend avoiding the caret character as a version prefix to maintain full control over upgrades.

Check the generated `package.json` file and remove the caret character if necessary.

## Add the Bryntum SchedulerPro component to the application

First, create a configuration file.

In the `app` folder, create a `components` folder. Create an `app.config.tsx` file in the `components` folder and 
add the following lines of code to it:

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

This file will be used to configure the Bryntum SchedulerPro component.

Now create a Bryntum SchedulerPro React component. 

In the `app/components/` folder, create a `bryntum.client.tsx` file and add the following lines of code to it:

```typescript
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-react';
import { schedulerproProps } from './app.config';

const BryntumClient = () => {
    return (
        <BryntumSchedulerPro
            {...SchedulerProProps}
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

Now we'll create a wrapper component for the Bryntum SchedulerPro React component to ensure it renders 
only on the client side.

Replace the contents of the `app/routes/_index.tsx` file with the following code:

```typescript
import { ClientOnly } from 'remix-utils/client-only';
import BryntumClient from '~/components/bryntum.client';

export default function Index() {
    return (
        <ClientOnly fallback={<h1>Loading Bryntum Scheduler Pro</h1>}>
            {() => <BryntumClient/>}
        </ClientOnly>
    );
}
```

## Apply styles

To style the Bryntum SchedulerPro, create an `app/styles/` folder and add an `index.css` file to it. 
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
import "@bryntum/schedulerpro/fontawesome/css/fontawesome.css";
import "@bryntum/schedulerpro/fontawesome/css/solid.css";
/* Import the structural CSS for schedulerpro */
import "@bryntum/schedulerpro/schedulerpro.css";
/* Import a Bryntum theme */
import "@bryntum/schedulerpro/svalbard-light.css";
import "../styles/index.css";
```

This stylesheet imports the Bryntum SchedulerPro structural CSS, the Svalbard theme, and gives the page a two-panel layout, with the scheduler above the utilization view. Bryntum provides five themes with light and dark variants that can be customized.

Learn more about styling your Bryntum SchedulerPro in our [style guide](#SchedulerPro/guides/customization/styling.md).

## Run the application

Start the local development server:

```shell
npm run dev
```

You can access the Bryntum SchedulerPro app in your browser at `http://localhost:5173/`.

## Troubleshooting

If you run into any issues, refer to the [troubleshooting guide](#SchedulerPro/guides/integration/react/troubleshooting.md).

## What to do next?

### Advanced integration with React

Explore our [comprehensive React guide](#SchedulerPro/guides/integration/react/guide.md) to learn more about 
how Bryntum Scheduler Pro integrates with React and start customizing your application.

### Working with data in Bryntum Scheduler Pro

Our [guide to data binding](#SchedulerPro/guides/integration/react/data-binding.md) explains how data can be 
bound to the component.

Bryntum components often use multiple data collections and entities. 

For a detailed explanation of how these elements 
interact, see our [guide to displaying data in Bryntum Scheduler Pro](#SchedulerPro/guides/data/displayingdata.md).



<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>