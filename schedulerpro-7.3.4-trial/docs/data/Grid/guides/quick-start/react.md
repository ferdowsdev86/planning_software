# Quick start guide for React integration

<div class="note">

Using an AI coding assistant? Install the <a href="#Grid/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

## Try React demos

Bryntum Grid ships with several demo React applications that showcase its functionality. 
Each demo has been tested and confirmed to be compatible with Node.js 20.

<div class="b-card-group-2">
<a href="https://bryntum.com/products/grid/examples/?framework=react" class="b-card"><i class="fas fa-globe"></i>View online React demos</a>
<a href="#Grid/guides/integration/react/guide.md#build-and-run-local-demos" class="b-card"><i class="fab fa-react">
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

This quick start guide will show you how to integrate Bryntum Grid into your React applications.

To illustrate the integration process, we'll build a simple application that looks like the image below.

<img src="Grid/getting-started-result.png" class="b-screenshot" alt="Getting Started on Bryntum Grid with React Result">

Here's a breakdown of the process we'll follow:

1. [Access the Bryntum npm registry](##access-to-npm-registry)
2. [Create a React application](##create-a-react-application)
3. [Install the Grid component](##install-the-component)
4. [Add the component to the application](##add-the-component-to-the-application)
5. [Apply styles](##apply-styles)
6. [Run the application](##run-the-application)

## Access to npm registry

You can try out Bryntum components for free using our public Bryntum trial packages.
If you have a Bryntum license, please refer to our [Npm Repository Guide](#Grid/guides/npm/repository/private-repository-access.md) to access the private Bryntum repository.

## Create a React application

There are many ways to create and build React applications. In this guide, we’ll use the
[React Vite guide](https://vitejs.dev/guide), which is known for its efficiency and performance benefits in
development.

If you’re using **JavaScript only** (without TypeScript), enter the following command:

```shell
npm create vite@latest bryntum-grid-app -- --template react
```

Alternatively, if you prefer using **TypeScript**, use the following command:

```shell
npm create vite@latest bryntum-grid-app -- --template react-ts
```

You can replace `bryntum-grid-app` with your preferred application name.

After creating the template, install the Node.js modules:

```shell
cd bryntum-grid-app
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
npm install @bryntum/grid@npm:@bryntum/grid-trial@7.3.4 @bryntum/grid-react@7.3.4
```

</div>
<div>

```shell
npm install @bryntum/grid@7.3.4 @bryntum/grid-react@7.3.4
```
</div>
</div>

<div class="note">

If you're using the licensed Bryntum version, ensure that you have configured your npm properly to get access to the Bryntum packages. If not, refer to <a href="#Grid/guides/npm-repository.md">this guide</a>.

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
  "@bryntum/grid": "npm:@bryntum/grid-trial@7.3.4",
  "@bryntum/grid-react": "7.3.4",
  ...
},
...
```

</div>
<div>

```json
"dependencies": {
  "@bryntum/grid": "7.3.4",
  "@bryntum/grid-react": "7.3.4",
  ...
},
...
```
</div>
</div>

### Vite Configuration

If you're using Vite to run Bryntum Grid in development mode, include the package in 
the [`optimizeDeps`](https://vitejs.dev/config/dep-optimization-options.html) section of 
the `vite.config.js` file to prevent bundles from loading multiple times.

Find instructions for optimizing dependencies in Vite applications 
[here](#Grid/guides/integration/react/troubleshooting.md#vite-application).

## Add the component to the application

First, create a configuration file in `src`. This file will contain the Grid settings.

<div class="docs-tabs" data-name="Grid">
<div>
    <a>Config.js</a>
    <a>Config.ts</a>
</div>
<div>

```javascript
export const gridProps = {
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

</div>
<div>

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
</div>
</div>

Next, replace the code in the `App.jsx` or `App.tsx` file with the following:

<div class="docs-tabs" data-name="App">
<div>
    <a>App.jsx</a>
    <a>App.tsx</a>
</div>
<div>

```javascript
import { BryntumGrid } from '@bryntum/grid-react';
import { gridProps } from './Config';
import './App.scss';

function App() {

    return (
        <BryntumGrid
            {...gridProps}
        />
    );
}

export default App;
```

</div>
<div>

```typescript
import { BryntumGrid } from '@bryntum/grid-react';
import { gridProps } from './Config';
import './App.scss';

function App() {

    return (
        <BryntumGrid
            {...gridProps}
        />
    );
}

export default App;
```
</div>
</div>

## Apply styles

Now you can apply styles to the Bryntum Grid component.

First, delete the `index.css` file and remove its import from the `main.jsx` or `main.tsx`. 
This will ensure that no unintended styles are applied.

Next, rename `App.css` to `App.scss` and replace its contents with the following:

```scss
// FontAwesome is used for icons
@import "@bryntum/grid/fontawesome/css/fontawesome.css";
@import "@bryntum/grid/fontawesome/css/solid.css";
// Import grid's structural CSS
@import "@bryntum/grid/grid.css";
// Import your preferred Bryntum theme
@import "@bryntum/grid/svalbard-light.css";

// Giving our grid some height
#root {
  height: 100vh;
}
```

This stylesheet imports the Bryntum Grid structural CSS, the Svalbard theme, and gives the page a two-panel layout, with the scheduler above the utilization view. Bryntum provides five themes with light and dark variants that can be customized.

Learn more about styling your Bryntum Grid in our [style guide](#Grid/guides/customization/styling.md).

## Run the application

Start the application development server:

```shell
npm run dev
```

You can now access the application in your browser at `http://localhost:5173`.

## Troubleshooting

If you run into issues while setting up your Bryntum Grid component, refer to our 
[troubleshooting guide for Bryntum Grid with React](#Grid/guides/integration/react/troubleshooting.md).

## What to do next?

Make the most of Bryntum Grid in your application by learning more about advanced customization options and data management techniques.

### Advanced integration with React

Explore our [comprehensive React guide](#Grid/guides/integration/react/guide.md) to learn more about how 
Bryntum Grid integrates with React and start customizing your application.

### Working with data in Bryntum Grid

Bryntum components often use multiple data collections and entities. 

For a detailed explanation of how these elements 
interact, see our [guide to displaying data in Bryntum Grid](#Grid/guides/data/displayingdata.md).



<p class="last-modified">Last modified on 2026-07-22 10:46:48</p>