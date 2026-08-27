# Getting Started with Bryntum Grid in Vue

<div class="note">

Using an AI coding assistant? Install the <a href="#Grid/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

## Try Vue demos

Bryntum Grid is delivered with a variety of Vue demo applications showing its functionality.
All demo applications have been verified to be compatible with Node.js 20.

<div class="b-card-group-2">
<a href="https://bryntum.com/products/grid/examples/?framework=vue" class="b-card"><i class="fas fa-globe"></i>View online Vue demos</a>
<a href="#Grid/guides/integration/vue/guide.md#build-and-run-local-demos" class="b-card"><i class="fab fa-vuejs"></i>Build and run Vue demos</a>
</div>

## Version requirements

Minimum supported:

 * Vue: `3.0.0` or higher
 * TypeScript: `3.6.0` or higher (for TypeScript application)
 * Vite: `4.0.0` or higher (for Vite application)

Recommended:

 * Vue: `3.0.0` or higher
 * TypeScript: `4.0.0` or higher (for TypeScript application)
 * Vite: `5.0.0` or higher (for Vite application)

<div class="note">

Please note that this guide is designed for creating a Vue 3 application. Since Vue 2 has reached end of life, we no
longer maintain guides or components for Vue 2. We recommend upgrading to Vue 3 for continued support and compatibility.

</div>

## Create Vue 3 application

To get started, the broad steps are as follows:

1. [Access to npm registry](##access-to-npm-registry)
2. [Create Application](##create-application)
3. [Install component](##install-component)
4. [Add component to Application](##add-component-to-application)
5. [Apply styles](##apply-styles)
6. [Run the application](##run-the-application)

The application we will be building now should look like the illustration below:

<img src="Grid/getting-started-result.png" class="b-screenshot" alt="Getting Started on Bryntum Grid with Vue Result">

## Access to npm registry

You can try out Bryntum components for free using our public Bryntum trial packages.
If you have a Bryntum license, please refer to our [Npm Repository Guide](#Grid/guides/npm/repository/private-repository-access.md) to access the private Bryntum repository.

## Create Application

Similarly to all the examples shipped with the distribution, we will be using [Vue CLI](https://cli.vuejs.org/) to build
Vue applications.

Type the following command to install Vue CLI:

```shell
npm create vue@latest
```

This command will install and execute create-vue, the official Vue project scaffolding tool.
You will be presented with prompts for several optional features such as TypeScript and testing support:

```shell
✔ Project name: … <your-project-name>
✔ Add TypeScript? … No / Yes✔️
✔ Add JSX Support? … No✔️ / Yes
✔ Add Vue Router for Single Page Application development? … No✔️ / Yes
✔ Add Pinia for state management? … No✔️ / Yes
✔ Add Vitest for Unit testing? … No✔️ / Yes
✔ Add an End-to-End Testing Solution? … No✔️ / Cypress / Nightwatch / Playwright
✔ Add ESLint for code quality? … No✔️ / Yes
✔ Add Prettier for code formatting? … No✔️ / Yes
✔ Add Vue DevTools 7 extension for debugging? (experimental) … No✔️ / Yes

Scaffolding project in ./<your-project-name>...
Done.
```

We are using the above config in this quick start guide but feel free to make any changes.

You can then move to your application folder:

```shell
cd <your-project-name>
```

<div class="note">

Please note some generated files will no longer be needed in your app, you can safely remove 
<code>.src/components/HelloWorld.vue</code> and <code>src/assets/logo.png</code>. Also, remove the <code>assets</code> folder and any links to <code>.css</code>
files in the <code>main.ts</code> or <code>main.js</code>.

</div>

## Install Bryntum Grid packages

From your terminal, update project dependencies using the following commands:

<div class="docs-tabs" data-name="licensed">
<div>
    <a>Trial version</a>
    <a>Licensed version</a>
</div>
<div>

```shell
npm install @bryntum/grid@npm:@bryntum/grid-trial@7.3.4 @bryntum/grid-vue-3@7.3.4
```

</div>
<div>

```shell
npm install @bryntum/grid@7.3.4 @bryntum/grid-vue-3@7.3.4
```
</div>
</div>

<div class="note">

If you're using the licensed Bryntum version, ensure that you have configured your npm properly to get access to the Bryntum packages. If not, refer to <a href="#Grid/guides/npm-repository.md">this guide</a>.

</div>

## Add component to Application

Edit the `src/App.vue` file and replace the content with the following:

<div class="docs-tabs" data-name="AppVue">
<div>
    <a>JavaScript</a>
    <a>TypeScript</a>
</div>
<div>

```javascript
<script setup>
import { BryntumGrid } from '@bryntum/grid-vue-3';
import { gridProps } from './AppConfig.js';
</script>

<template>
  <bryntum-grid v-bind=gridProps />
</template>

<style lang="scss">
@import './App.scss';
</style>
```

</div>
<div>

```typescript
<script setup lang="ts">
import { BryntumGrid } from '@bryntum/grid-vue-3';
import { gridProps } from './AppConfig.ts';
</script>

<template>
  <bryntum-grid v-bind=gridProps />
</template>

<style lang="scss">
@import './App.scss';
</style>
```
</div>
</div>

Create a `AppConfig` file in the `src/` directory with the following content:

<div class="docs-tabs" data-name="AppConfig">
<div>
    <a>JavaScript</a>
    <a>TypeScript</a>
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
            flex     : 1,
            sortable : false,
            type     : 'color'
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
import { BryntumGridProps } from '@bryntum/grid-vue-3';

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
            flex     : 1,
            sortable : false,
            type     : 'color'
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

## Apply styles

### Stylesheets

Remove both `src/assets/main.css` and `src/assets/base.css`, and delete the `main.css` import from `src/main.ts`.

The following CSS files are provided with the Bryntum npm packages or in the `/build` folder of the distribution:

| File                              | Contents                      |
|-----------------------------------|-------------------------------|
| `grid.css`                     | Structural CSS                |
| `svalbard-light.css`              | Svalbard Light theme          |
| `svalbard-dark.css`               | Svalbard Dark theme           |
| `visby-light.css`                 | Visby Light theme             |
| `visby-dark.css`                  | Visby Dark theme              |
| `stockholm-light.css`             | Stockholm Light theme         |
| `stockholm-dark.css`              | Stockholm Dark theme          |
| `material3-light.css`             | Material3 Light theme         |
| `material3-dark.css`              | Material3 Dark theme          |
| `fluent2-light.css`               | Fluent2 Light theme           |
| `fluent2-dark.css`                | Fluent2 Dark theme            |
| `fontawesome/css/fontawesome.css` | Font Awesome Free base CSS    |
| `fontawesome/css/solid.css`       | Font Awesome Free solid icons |

You'll need to import the structural CSS and the preferred theme into your project for the Bryntum Grid to render 
correctly. And if you are not replacing the icons used by the component, you will also need to include Font Awesome.

<div class="docs-tabs" data-name="stylesheet">
<div>
    <a>CSS</a>
    <a>SCSS</a>
</div>
<div>

Create a <code>src/App.css</code> file and add the following:

```css
/* FontAwesome is used for icons */
@import "@bryntum/grid/fontawesome/css/fontawesome.css";
@import "@bryntum/grid/fontawesome/css/solid.css";
/* Structural CSS */
@import "@bryntum/grid/grid.css";
/* Bryntum theme of your choice */
@import "@bryntum/grid/svalbard-light.css";
```

You need to change the <code>App.scss</code> to <code>App.css</code> in the <code>App.vue</code>.

</div>
<div>

Create a <code>src/App.scss</code> file and add the following:

```scss
// FontAwesome is used for icons
@import "@bryntum/grid/fontawesome/css/fontawesome.css";
@import "@bryntum/grid/fontawesome/css/solid.css";
// Structural CSS
@import "@bryntum/grid/grid.css";
// Bryntum theme
@import "@bryntum/grid/svalbard-light.css";
```

For your application to support sass files, you'll need to add additional dependencies to your project.

From the terminal:

```shell
npm install sass@1.42.0 --save-dev --save-prefix=~
```

Visit <a href="#Gantt/guides/customization/styling.md#creating-a-custom-theme">Creating a custom theme</a> section for more info on how to create a custom theme.
</div>
</div>

### Sizing the component

By default, the Bryntum Grid component is configured to occupy 100% of the parent DOM element 
with a `min-height` of `10em`.

To display the component at the appropriate size, you can, for example, set parent components to 
take up the full height of the screen.

<div class="docs-tabs" data-name="stylesheet">
<div>
    <a>CSS</a>
    <a>SCSS</a>
</div>
<div>

In your <code>src/App.css</code> file, add the following:

```css
body,
html {
    margin         : 0;
    display        : flex;
    flex-direction : column;
    height         : 100vh;
    font-family    : sans-serif;
    font-size      : 14px;
}
```

```css
#app {
    flex : 1 1 100%;
}
```

</div>
<div>

In your <code>src/App.scss</code> file, add the following:

```css
body,
html {
    margin         : 0;
    display        : flex;
    flex-direction : column;
    height         : 100vh;
    font-family    : sans-serif;
    font-size      : 14px;
}
```

```css
#app {
    flex : 1 1 100%;
}
```
</div>
</div>

There are many other solutions depending on the situation. Feel free to adapt the code above regarding your application
layout. For more information on the topic, see this guide
[Sizing the component](https://bryntum.com/products/grid/docs/guide/Grid/basics/sizing).

## Run the application

From your terminal:

```shell
npm run dev
```

Your application is now available under `http://localhost:5173`.

## Further on integration with Vue

Do you want to know more about how Bryntum Grid integrates with Vue and starts to customize your application? We
provide you with a [complete Vue guide here](#Grid/guides/integration/vue/guide.md).

## Troubleshooting

Stuck somewhere? Please refer to this [Troubleshooting guide](#Grid/guides/integration/vue/troubleshooting.md). If
you find errors in our docs and/or onboarding guides, please report them in [our forums](https://forum.bryntum.com).

### Learn about Data

Bryntum components often use multiple data collections and entities. 

For a detailed explanation of how these elements 
interact, see our [guide to displaying data in Bryntum Grid](#Grid/guides/data/displayingdata.md).



<p class="last-modified">Last modified on 2026-07-22 10:46:48</p>