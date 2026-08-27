# Getting started with Bryntum Scheduler in Next.js

<div class="note">

Using an AI coding assistant? Install the <a href="#Scheduler/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

This quick start guide will show you how to build a basic Bryntum Scheduler in a Next.js TypeScript application using the
[Next.js getting started guide](https://nextjs.org/docs/getting-started/installation) as a starting point.

You can also take a shortcut and start with our
[Bryntum Scheduler Next.js with TypeScript starter template](https://github.com/bryntum/bryntum-scheduler-nextjs-quick-start)
that we will create in this guide.

## Requirements

Next.js version 15 requires [Node.js 18.18](https://nodejs.org/) or higher. Bryntum Scheduler requires React `16.0.0`
or higher and TypeScript `3.6.0` or higher for applications written in TypeScript.

## Version requirements

Minimum supported:

 * React: `16.0.0` or higher
 * TypeScript: `3.6.0` or higher (for TypeScript application)

Recommended:

 * React: `18.0.0` or higher
 * TypeScript: `4.0.0` or higher (for TypeScript application)

## Getting started

To get started, we'll follow these steps to create a basic Bryntum Scheduler Next.js app:

1. Setup a Next.js application.
2. Install the Bryntum Scheduler component.
3. Create a Bryntum Scheduler component.
4. Run the application.

The basic Bryntum Scheduler starter template that we'll build will look like this:

<img src="Scheduler/getting-started-result.png" class="b-screenshot" alt="Getting Started on Bryntum Scheduler with Next.js Result">

## Setup a Next.js application

We will use the [Next.js getting started guide](https://nextjs.org/docs/getting-started/installation) to create a
Next.js application. Next.js recommends using `create-next-app` to create a new Next.js app as it sets everything up
for you, automatically. Create a Next.js application by running the following command:

```shell
npx create-next-app@latest
```

You'll see multiple prompts. To follow along with this guide, choose the following options:

```shell
What is your project named? bryntum-scheduler
Would you like to use TypeScript? No / Yes ✔️
Would you like to use ESLint? No / Yes ✔️
Would you like to use Tailwind CSS? No ✔️ / Yes
Would you like to use `src/` directory? No ✔️ / Yes 
Would you like to use App Router? (recommended) No / Yes ✔️
Would you like to use Turbopack for `next dev`? No ✔️ / Yes
Would you like to customize the default import alias (@/*)? No ✔️ / Yes
```

After you've selected your answers for the prompt questions, `create-next-app` will create a folder with your
project name and install the dependencies.

Change your current working directory to the new Next.js project directory:

```shell
cd bryntum-scheduler
```

## Install the Bryntum Scheduler component

Installing the Bryntum Scheduler component using npm is the quickest way to use our products. You can try out Bryntum components for free using our public Bryntum trial packages.
If you have a Bryntum license, please refer to our [Npm Repository Guide](#Scheduler/guides/npm/repository/private-repository-access.md#repository-access) to access the private Bryntum repository.

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

### Dependencies

The application configuration may add a caret `^` as a prefix of the dependencies version in your `package.json` file.
We recommend removing the caret character as a version prefix so that you have full control over package updates.

## Create a Bryntum Scheduler component

Create a config file called `Config.ts` in the `app/` folder. Add the following lines of code to it:

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

Create a file called `Scheduler.tsx` in the `app/components/` folder. Add the following lines of code to it:

```typescript
"use client";

import { BryntumScheduler } from "@bryntum/scheduler-react";
import { useEffect, useRef } from "react";

export default function Scheduler({ ...props }) {
  const schedulerRef = useRef<BryntumScheduler>(null);

  useEffect(() => {
    // Bryntum Scheduler instance
    const scheduler = schedulerRef?.current?.instance;
  }, []);

  return <BryntumScheduler {...props} ref={schedulerRef} />;
}
```

The Scheduler component is a React
[client component](https://nextjs.org/docs/app/building-your-application/rendering/client-components) as it uses the
`"use client"` directive at the top of the file.

The code in the useEffect hook setup function shows you how to access the Bryntum Scheduler instance.

### Add component data

Create a `public/data/data.json` file for example data and add the following JSON data to it:

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

We need to create a wrapper component for the Bryntum Scheduler React component to render on the client only.
In the `components` folder, create a file called `SchedulerWrapper.tsx` and add the following lines of code to it:

```typescript
'use client';

import dynamic from "next/dynamic";
import { schedulerProps } from "../Config";

const Scheduler = dynamic(() => import("./Scheduler"), {
  ssr: false,
  loading: () => {
    return (
      <div
        style={{
          display        : "flex",
          alignItems     : "center",
          justifyContent : "center",
          height         : "100vh",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  },
});

const SchedulerWrapper = () => {
    return <Scheduler {...schedulerProps} />
};
export { SchedulerWrapper };
```

The Bryntum Scheduler React component is
[dynamically imported](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#nextdynamic)
with server-side rendering (`ssr`) set to `false`. This is done to prevent the Bryntum Scheduler React client component
from being pre-rendered on the server as Bryntum components are client-side only.

<div class="note">

If the above throws an error, replace the <code>ssr: false,</code> with <code>ssr: !!false,</code>.

</div>

Next, replace the code in the `app/page.tsx` file with the following lines of code:

```typescript
import { SchedulerWrapper } from "@/app/components/SchedulerWrapper";
/* FontAwesome is used for icons */
import "@bryntum/scheduler/fontawesome/css/fontawesome.css";
import "@bryntum/scheduler/fontawesome/css/solid.css";
/* Importing Scheduler's structural CSS and a theme */
import "@bryntum/scheduler/scheduler.css";
import "@bryntum/scheduler/svalbard-light.css";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <SchedulerWrapper />
    </main>
  );
}
```

We imported the CSS styles for the Bryntum Scheduler Svalbard Light theme, which is one of five available themes.

## Styling

To style the Bryntum Scheduler so that it takes up the whole page, replace the styles in the `app/globals.css`
file with the following styles:

```css
body,
html {
  margin: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Poppins, "Open Sans", Helvetica, Arial, sans-serif;
  font-size: 14px;
}
```

Create `src/app/page.module.css` file with the following style for the `<main>` HTML tag:

```css
.main {
  height: 100%;
}
```

If you want to customize the default theme, you can replace the `stockholm.css` with the sass version.
Visit [Creating a custom theme](#Scheduler/guides/customization/styling.md#creating-a-custom-theme) section for more info.

You can learn more about styling your Bryntum Scheduler in our [style guide](#Scheduler/guides/customization/styling.md).

## Using ref outside Scheduler Component

To access the Bryntum Scheduler instance outside of `Scheduler.tsx`, you can use React’s `useRef` hook. Typically,
you would use `forwardRef`; however, in this case, the Scheduler component is lazy-loaded, so the ref needs to be
passed as a regular prop. To implement this, make the `SchedulerWrapper.tsx` a client component, create a ref in the
`SchedulerWrapper` function and pass it as a prop to the Scheduler:

```typescript
"use client"; // make it a client component

import { useEffect, useRef } from "react";
import { BryntumScheduler } from "@bryntum/scheduler-react";

const SchedulerWrapper = () => {
  const schedulerRef = useRef<BryntumScheduler>(null);

  useEffect(() => {
    // For testing purposes, since Scheduler is lazy loaded, schedulerRef is null initially
    setTimeout(() => {
      console.log(schedulerRef);
    }, 2000);
  });

  return <Scheduler schedulerRef={schedulerRef} {...schedulerProps} />;
};
```

In `Scheduler.tsx`, define the `Props` type:

```typescript
type Props = {
  schedulerRef: React.Ref<BryntumScheduler>;
} & BryntumSchedulerProps;
```

Next, pass and apply the `schedulerRef` within the `Scheduler` function and remove any existing ref used for
`BryntumScheduler`.

```typescript
export default function Scheduler({ schedulerRef, ...props }: Props) {
  return (
    <BryntumScheduler
      {...props}
      ref={schedulerRef}
      // additional config
    />
  );
}
```

Scheduler can now be accessed from `Scheduler`, letting you access Scheduler's events and configs.

## Run the application

Run the local development server:

```shell
npm run dev
```

You'll see the Bryntum Scheduler app at the URL `http://localhost:3000/`.


<p class="last-modified">Last modified on 2026-07-22 10:51:34</p>