# Getting started with Bryntum Scheduler Pro in Next.js

<div class="note">

Using an AI coding assistant? Install the <a href="#SchedulerPro/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

This quick start guide will show you how to build a basic Bryntum Scheduler Pro in a Next.js TypeScript application using the
[Next.js getting started guide](https://nextjs.org/docs/getting-started/installation) as a starting point.

You can also take a shortcut and start with our
[Bryntum Scheduler Pro Next.js with TypeScript starter template](https://github.com/bryntum/bryntum-schedulerpro-nextjs-quick-start)
that we will create in this guide.

## Requirements

Next.js version 15 requires [Node.js 18.18](https://nodejs.org/) or higher. Bryntum Scheduler Pro requires React `16.0.0`
or higher and TypeScript `3.6.0` or higher for applications written in TypeScript.

## Version requirements

Minimum supported:

 * React: `16.0.0` or higher
 * TypeScript: `3.6.0` or higher (for TypeScript application)

Recommended:

 * React: `18.0.0` or higher
 * TypeScript: `4.0.0` or higher (for TypeScript application)

## Getting started

To get started, we'll follow these steps to create a basic Bryntum Scheduler Pro Next.js app:

1. Setup a Next.js application.
2. Install the Bryntum Scheduler Pro component.
3. Create a Bryntum Scheduler Pro component.
4. Run the application.

The basic Bryntum Scheduler Pro starter template that we'll build will look like this:

<img src="SchedulerPro/getting-started-result.png" class="b-screenshot" alt="Getting Started on Bryntum Scheduler Pro with Next.js Result">

## Setup a Next.js application

We will use the [Next.js getting started guide](https://nextjs.org/docs/getting-started/installation) to create a
Next.js application. Next.js recommends using `create-next-app` to create a new Next.js app as it sets everything up
for you, automatically. Create a Next.js application by running the following command:

```shell
npx create-next-app@latest
```

You'll see multiple prompts. To follow along with this guide, choose the following options:

```shell
What is your project named? bryntum-schedulerpro
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
cd bryntum-schedulerpro
```

## Install the Bryntum Scheduler Pro component

Installing the Bryntum Scheduler Pro component using npm is the quickest way to use our products. You can try out Bryntum components for free using our public Bryntum trial packages.
If you have a Bryntum license, please refer to our [Npm Repository Guide](#SchedulerPro/guides/npm/repository/private-repository-access.md#repository-access) to access the private Bryntum repository.

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

### Dependencies

The application configuration may add a caret `^` as a prefix of the dependencies version in your `package.json` file.
We recommend removing the caret character as a version prefix so that you have full control over package updates.

## Create a Bryntum Scheduler Pro component

Create a config file called `Config.ts` in the `app/` folder. Add the following lines of code to it:

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

Create a file called `SchedulerPro.tsx` in the `app/components/` folder. Add the following lines of code to it:

```typescript
"use client";

import { BryntumSchedulerPro } from "@bryntum/schedulerpro-react";
import { useEffect, useRef } from "react";

export default function SchedulerPro({ ...props }) {
  const schedulerproRef = useRef<BryntumSchedulerPro>(null);

  useEffect(() => {
    // Bryntum Scheduler Pro instance
    const schedulerpro = schedulerproRef?.current?.instance;
  }, []);

  return <BryntumSchedulerPro {...props} ref={schedulerproRef} />;
}
```

The SchedulerPro component is a React
[client component](https://nextjs.org/docs/app/building-your-application/rendering/client-components) as it uses the
`"use client"` directive at the top of the file.

The code in the useEffect hook setup function shows you how to access the Bryntum Scheduler Pro instance.

### Add component data

Create a `public/data/data.json` file for example data and add the following JSON data to it:

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

We need to create a wrapper component for the Bryntum Scheduler Pro React component to render on the client only.
In the `components` folder, create a file called `SchedulerProWrapper.tsx` and add the following lines of code to it:

```typescript
'use client';

import dynamic from "next/dynamic";
import { schedulerproProps } from "../Config";

const SchedulerPro = dynamic(() => import("./SchedulerPro"), {
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

const SchedulerProWrapper = () => {
    return <SchedulerPro {...schedulerproProps} />
};
export { SchedulerProWrapper };
```

The Bryntum Scheduler Pro React component is
[dynamically imported](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#nextdynamic)
with server-side rendering (`ssr`) set to `false`. This is done to prevent the Bryntum Scheduler Pro React client component
from being pre-rendered on the server as Bryntum components are client-side only.

<div class="note">

If the above throws an error, replace the <code>ssr: false,</code> with <code>ssr: !!false,</code>.

</div>

Next, replace the code in the `app/page.tsx` file with the following lines of code:

```typescript
import { SchedulerProWrapper } from "@/app/components/SchedulerProWrapper";
/* FontAwesome is used for icons */
import "@bryntum/schedulerpro/fontawesome/css/fontawesome.css";
import "@bryntum/schedulerpro/fontawesome/css/solid.css";
/* Importing SchedulerPro's structural CSS and a theme */
import "@bryntum/schedulerpro/schedulerpro.css";
import "@bryntum/schedulerpro/svalbard-light.css";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <SchedulerProWrapper />
    </main>
  );
}
```

We imported the CSS styles for the Bryntum Scheduler Pro Svalbard Light theme, which is one of five available themes.

## Styling

To style the Bryntum Scheduler Pro so that it takes up the whole page, replace the styles in the `app/globals.css`
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
Visit [Creating a custom theme](#SchedulerPro/guides/customization/styling.md#creating-a-custom-theme) section for more info.

You can learn more about styling your Bryntum Scheduler Pro in our [style guide](#SchedulerPro/guides/customization/styling.md).

## Using ref outside SchedulerPro Component

To access the Bryntum Scheduler Pro instance outside of `SchedulerPro.tsx`, you can use React’s `useRef` hook. Typically,
you would use `forwardRef`; however, in this case, the SchedulerPro component is lazy-loaded, so the ref needs to be
passed as a regular prop. To implement this, make the `SchedulerProWrapper.tsx` a client component, create a ref in the
`SchedulerProWrapper` function and pass it as a prop to the SchedulerPro:

```typescript
"use client"; // make it a client component

import { useEffect, useRef } from "react";
import { BryntumSchedulerPro } from "@bryntum/schedulerpro-react";

const SchedulerProWrapper = () => {
  const schedulerproRef = useRef<BryntumSchedulerPro>(null);

  useEffect(() => {
    // For testing purposes, since SchedulerPro is lazy loaded, schedulerproRef is null initially
    setTimeout(() => {
      console.log(schedulerproRef);
    }, 2000);
  });

  return <SchedulerPro schedulerproRef={schedulerproRef} {...schedulerproProps} />;
};
```

In `SchedulerPro.tsx`, define the `Props` type:

```typescript
type Props = {
  schedulerproRef: React.Ref<BryntumSchedulerPro>;
} & BryntumSchedulerProProps;
```

Next, pass and apply the `schedulerproRef` within the `SchedulerPro` function and remove any existing ref used for
`BryntumSchedulerPro`.

```typescript
export default function SchedulerPro({ schedulerproRef, ...props }: Props) {
  return (
    <BryntumSchedulerPro
      {...props}
      ref={schedulerproRef}
      // additional config
    />
  );
}
```

SchedulerPro can now be accessed from `SchedulerPro`, letting you access SchedulerPro's events and configs.

## Run the application

Run the local development server:

```shell
npm run dev
```

You'll see the Bryntum Scheduler Pro app at the URL `http://localhost:3000/`.


<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>