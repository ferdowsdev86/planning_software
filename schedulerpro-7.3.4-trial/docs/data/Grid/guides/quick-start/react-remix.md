# Quick start guide for Remix integration

<div class="note">

Using an AI coding assistant? Install the <a href="#Grid/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

This quick start guide will show you how to build a basic Bryntum Grid in a Remix TypeScript application.

## Version requirements

Bryntum Grid requires: 

* React `16.0.0` or higher
* TypeScript `3.6.0` or higher (for TypeScript applications)

Remix version `2.15.0` requires a [Node.js LTS version](https://nodejs.org/en).

<div class="note">

Remix 3 is currently in Alpha and is planned to become framework-agnostic, moving away from React as a dependency. 
This guide covers Remix 2 with React. Check the <a href="https://remix.run/">Remix blog</a> for the latest updates.

</div>

## Overview of Remix integration

To demonstrate the integration process, we'll build a simple application that looks like the image below.

<img src="Grid/getting-started-result.png" class="b-screenshot" alt="Screenshot of a sample 
 Bryntum Grid application built using Remix">

Here's a breakdown of the steps we'll follow:

1. [Access the Bryntum npm registry](##access-the-bryntum-npm-registry)
2. [Create a Remix application](##create-a-remix-application)
3. [Install the Bryntum Grid component](##install-the-bryntum-grid-component)
4. [Add the Bryntum Grid component to the application](##add-the-bryntum-grid-component-to-the-application)
5. [Apply styles](##apply-styles)
6. [Run the application](##run-the-application)

## Access the Bryntum npm registry

Bryntum components are commercial products, hosted in a private Bryntum repository.
Please refer to the [Bryntum npm repository guide](#Grid/guides/npm-repository.md) for complete access information. 

## Create a Remix application

We'll use the [Remix quick start guide](https://remix.run/docs/en/main/start/quickstart) to create a Remix application.

Create a Remix application by running the following command:

```shell
npx create-remix@latest
```

This command will guide you through setting up the Remix application by asking the following questions:

```bash
- Where should we create your new project?
 my-remix-grid
- Initialize a new git repository?
 Yes
- Install dependencies with npm?
 Yes
```

When you've answered the questions, `create-remix` will create a folder with your 
project name and install the dependencies. 

Change to the new Remix project directory:

```shell
cd my-remix-grid
```

## Install the Bryntum Grid component

Use the commands below to install the Bryntum Grid package.

Installing the Bryntum Grid component using npm is the quickest way to use our products. First, get access to the
Bryntum private npm registry by following the [guide in our docs](#Grid/guides/npm-repository.md#repository-access).
Once you've logged in to the registry, install the Bryntum Grid component packages:

<div class="docs-tabs" data-name="licensed">
<div>
    <a>Licensed version</a>
    <a>Trial version</a>
</div>
<div>

```shell
npm install @bryntum/grid @bryntum/grid-react
```

</div>
<div>

```shell
npm install @bryntum/grid@npm:@bryntum/grid-trial @bryntum/grid-react
```

</div>
</div>

<div class="note">

Note: Make sure npm is properly configured to access the Bryntum packages.
If not, refer to <a href="#Grid/guides/npm-repository.md">the guide to using the Bryntum npm repository</a>.

</div>

Install `remix-utils` to enable client-side rendering functionality.

```shell
npm install remix-utils
```

### Managing dependencies

The application configuration may add a caret (`^`) as a prefix to dependency versions. 
We recommend avoiding the caret character as a version prefix to maintain full control over upgrades.

Check the generated `package.json` file and remove the caret character if necessary.

## Add the Bryntum Grid component to the application

First, create a configuration file.

In the `app` folder, create a `components` folder. Create an `app.config.tsx` file in the `components` folder and 
add the following lines of code to it:

```typescript
import { BryntumGridProps } from '@bryntum/grid-react';

export const gridProps: BryntumGridProps = {
    columns : [
        {
            text   : 'Name',
            field  : 'name',
            flex   : 1,
            editor : {
                type     : 'textfield',
                required : true
            }
        }, {
            text  : 'Age',
            field : 'age',
            width : 100,
            type  : 'number'
        }, {
            text  : 'City',
            field : 'city',
            flex  : 1
        }, {
            text  : 'Food',
            field : 'food',
            flex  : 1
        }, {
            text     : 'Color',
            field    : 'color',
            width    : 80,
            type     : 'column',
            renderer : ({ cellElement, value }) => {
                cellElement.style.color = value;
                cellElement.style.fontWeight = '700';
                return value;
            }
        }
    ],

    data : [
        { id : 1, name : 'Don A Taylor', age : 30, city : 'Moscow', food : 'Salad', color : 'Black' },
        { id : 2, name : 'John B Adams', age : 65, city : 'Paris', food : 'Bolognese', color : 'Orange' },
        { id : 3, name : 'John Doe', age : 40, city : 'London', food : 'Fish and Chips', color : 'Blue' },
        { id : 4, name : 'Maria Garcia', age : 28, city : 'Madrid', food : 'Paella', color : 'Green' },
        { id : 5, name : 'Li Wei', age : 35, city : 'Beijing', food : 'Dumplings', color : 'Yellow' },
        { id : 6, name : 'Sara Johnson', age : 32, city : 'Sydney', food : 'Sushi', color : 'Purple' },
        { id : 7, name : 'Lucas Brown', age : 22, city : 'Toronto', food : 'Poutine', color : 'Orange' },
        { id : 8, name : 'Emma Wilson', age : 27, city : 'Paris', food : 'Croissant', color : 'Pink' },
        { id : 9, name : 'Ivan Petrov', age : 45, city : 'St. Petersburg', food : 'Borscht', color : 'Grey' },
        { id : 10, name : 'Zhang Ming', age : 50, city : 'Shanghai', food : 'Hot Pot', color : 'Purple' },
        { id : 11, name : 'Sophia Martinez', age : 20, city : 'Mexico City', food : 'Tacos', color : 'Crimson' },
        { id : 12, name : 'Noah Smith', age : 55, city : 'Cape Town', food : 'Biltong', color : 'Turquoise' },
        { id : 13, name : 'Isabella Jones', age : 33, city : 'Rio de Janeiro', food : 'Feijoada', color : 'Magenta' },
        { id : 14, name : 'Ethan Taylor', age : 29, city : 'Chicago', food : 'Deep-Dish Pizza', color : 'Cyan' },
        { id : 15, name : 'Olivia Brown', age : 37, city : 'Berlin', food : 'Schnitzel', color : 'Maroon' },
        { id : 16, name : 'Mia Wilson', age : 26, city : 'Rome', food : 'Pasta', color : 'Olive' },
        { id : 17, name : 'Jacob Miller', age : 60, city : 'Amsterdam', food : 'Stroopwafel', color : 'Lime' },
        { id : 18, name : 'Chloe Davis', age : 23, city : 'Los Angeles', food : 'Burger', color : 'Teal' },
        { id : 19, name : 'Aiden Martinez', age : 48, city : 'Buenos Aires', food : 'Asado', color : 'Violet' },
        { id : 20, name : 'Liam Lee', age : 38, city : 'Seoul', food : 'Kimchi', color : 'Indigo' },
        { id : 21, name : 'Sophie Kim', age : 21, city : 'Tokyo', food : 'Ramen', color : 'Pink' },
        { id : 22, name : 'Alexander Nguyen', age : 41, city : 'Hanoi', food : 'Pho', color : 'Coral' },
        { id : 23, name : 'Ella Patel', age : 19, city : 'Mumbai', food : 'Curry', color : 'Amber' },
        { id : 24, name : 'James O Connor', age : 34, city : 'Dublin', food : 'Irish Stew', color : 'Green' },
        { id : 25, name : 'Isabelle Chen', age : 31, city : 'Hong Kong', food : 'Dim Sum', color : 'Brown' }
    ]
};
```

This file will be used to configure the Bryntum Grid component.

Now create a Bryntum Grid React component. 

In the `app/components/` folder, create a `bryntum.client.tsx` file and add the following lines of code to it:

```typescript
import { BryntumGrid } from '@bryntum/grid-react';
import { gridProps } from './app.config';

const BryntumClient = () => {
    return (
        <BryntumGrid
            {...GridProps}
        />
    );
};

export default BryntumClient;
```

The file extension is `.client.tsx` because Bryntum components are rendered on the **client-side** only 
and Remix uses `.client.tsx` for client-side files.

Now we'll create a wrapper component for the Bryntum Grid React component to ensure it renders 
only on the client side.

Replace the contents of the `app/routes/_index.tsx` file with the following code:

```typescript
import { ClientOnly } from 'remix-utils/client-only';
import BryntumClient from '~/components/bryntum.client';

export default function Index() {
    return (
        <ClientOnly fallback={<h1>Loading Bryntum Grid</h1>}>
            {() => <BryntumClient/>}
        </ClientOnly>
    );
}
```

## Apply styles

To style the Bryntum Grid, create an `app/styles/` folder and add an `index.css` file to it. 
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
import "@bryntum/grid/fontawesome/css/fontawesome.css";
import "@bryntum/grid/fontawesome/css/solid.css";
/* Import the structural CSS for grid */
import "@bryntum/grid/grid.css";
/* Import a Bryntum theme */
import "@bryntum/grid/svalbard-light.css";
import "../styles/index.css";
```

This stylesheet imports the Bryntum Grid structural CSS, the Svalbard theme, and gives the page a two-panel layout, with the scheduler above the utilization view. Bryntum provides five themes with light and dark variants that can be customized.

Learn more about styling your Bryntum Grid in our [style guide](#Grid/guides/customization/styling.md).

## Run the application

Start the local development server:

```shell
npm run dev
```

You can access the Bryntum Grid app in your browser at `http://localhost:5173/`.

## Troubleshooting

If you run into any issues, refer to the [troubleshooting guide](#Grid/guides/integration/react/troubleshooting.md).

## What to do next?

### Advanced integration with React

Explore our [comprehensive React guide](#Grid/guides/integration/react/guide.md) to learn more about 
how Bryntum Grid integrates with React and start customizing your application.

### Working with data in Bryntum Grid

Bryntum components often use multiple data collections and entities. 

For a detailed explanation of how these elements 
interact, see our [guide to displaying data in Bryntum Grid](#Grid/guides/data/displayingdata.md).



<p class="last-modified">Last modified on 2026-07-22 10:46:48</p>