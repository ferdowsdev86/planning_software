# Getting Started with Bryntum Scheduler Pro in Vue

<div class="note">

Using an AI coding assistant? Install the <a href="#SchedulerPro/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

## Try Vue demos

Bryntum Scheduler Pro is delivered with a variety of Vue demo applications showing its functionality.
All demo applications have been verified to be compatible with Node.js 20.

<div class="b-card-group-2">
<a href="https://bryntum.com/products/schedulerpro/examples/?framework=vue" class="b-card"><i class="fas fa-globe"></i>View online Vue demos</a>
<a href="#SchedulerPro/guides/integration/vue/guide.md#build-and-run-local-demos" class="b-card"><i class="fab fa-vuejs"></i>Build and run Vue demos</a>
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

<img src="SchedulerPro/getting-started-result.png" class="b-screenshot" alt="Getting Started on Bryntum Scheduler Pro with Vue Result">

## Access to npm registry

You can try out Bryntum components for free using our public Bryntum trial packages.
If you have a Bryntum license, please refer to our [Npm Repository Guide](#SchedulerPro/guides/npm/repository/private-repository-access.md) to access the private Bryntum repository.

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

## Install Bryntum Scheduler Pro packages

From your terminal, update project dependencies using the following commands:

<div class="docs-tabs" data-name="licensed">
<div>
    <a>Trial version</a>
    <a>Licensed version</a>
</div>
<div>

```shell
npm install @bryntum/schedulerpro@npm:@bryntum/schedulerpro-trial@7.3.4 @bryntum/schedulerpro-vue-3@7.3.4
```

</div>
<div>

```shell
npm install @bryntum/schedulerpro@7.3.4 @bryntum/schedulerpro-vue-3@7.3.4
```
</div>
</div>

<div class="note">

If you're using the licensed Bryntum version, ensure that you have configured your npm properly to get access to the Bryntum packages. If not, refer to <a href="#SchedulerPro/guides/npm-repository.md">this guide</a>.

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
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-vue-3';
import { schedulerProProps } from './AppConfig.js';
</script>

<template>
  <bryntum-scheduler-pro v-bind="schedulerProProps" />
</template>

<style lang="scss">
@import './App.scss';
</style>
```

</div>
<div>

```typescript
<script setup lang="ts">
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-vue-3';
import { schedulerProProps } from './AppConfig.ts';
</script>

<template>
  <bryntum-scheduler-pro v-bind="schedulerProProps" />
</template>

<style lang="scss">
@import './App.scss';
</style>
```
</div>
</div>

In the code sample above:

- A simple project is created with a few resources and linked events.
- Assignments store details on which resources are assigned to specific events.
- Since `Event 2` lacks a start date, the [scheduling engine](engine) calculates it based on the start date and duration
  of `Event 1`.

Learn more in our [guide to displaying data in Bryntum Scheduler Pro](#Scheduler/guides/data/displayingdata.md).

Create a `AppConfig` file in the `src/` directory with the following content:

<div class="docs-tabs" data-name="AppConfig">
<div>
    <a>JavaScript</a>
    <a>TypeScript</a>
</div>
<div>

```javascript
export const schedulerProProps = {
    startDate        : new Date(2026, 0, 1),
    endDate          : new Date(2026, 1, 10),
    viewPreset       : 'hourAndDay',
    rowHeight        : 50,
    barMargin        : 5,
    multiEventSelect : true,
    // Uncomment this line, if you have a public/users/ path for images
    // resourceImagePath : 'users/',
    columns          : [{ text : 'Name', field : 'name', width : 130 }],
    // Project arranges loading and syncing of data in JSON form from/to a web service
    project          : {
        loadUrl  : 'data/data.json',
        autoLoad : true
    }
};
```

</div>
<div>

```typescript
import { type BryntumSchedulerProProps } from '@bryntum/schedulerpro-vue-3';

export const schedulerProProps : BryntumSchedulerProProps = {
    startDate        : new Date(2026, 0, 1),
    endDate          : new Date(2026, 1, 10),
    viewPreset       : 'hourAndDay',
    rowHeight        : 50,
    barMargin        : 5,
    multiEventSelect : true,
    // Uncomment this line, if you have a public/users/ path for images
    // resourceImagePath : 'users/',
    columns          : [{ text : 'Name', field : 'name', width : 130 }],
    // Project arranges loading and syncing of data in JSON form from/to a web service
    project          : {
        loadUrl  : 'data/data.json',
        autoLoad : true
    }
};
```
</div>
</div>

<div class="note">

Note that the <code>startDate</code> and <code>endDate</code> configs passed to <code>schedulerProProps</code> denote
the currently visible timespan.

</div>

## Add component data

Create a `public/data/data.json` file for example data and add the following JSON data to it:

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

This is the data the Bryntum Scheduler Pro will use.

## Apply styles

### Stylesheets

Remove both `src/assets/main.css` and `src/assets/base.css`, and delete the `main.css` import from `src/main.ts`.

The following CSS files are provided with the Bryntum npm packages or in the `/build` folder of the distribution:

| File                              | Contents                      |
|-----------------------------------|-------------------------------|
| `schedulerpro.css`                     | Structural CSS                |
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

You'll need to import the structural CSS and the preferred theme into your project for the Bryntum Scheduler Pro to render 
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
@import "@bryntum/schedulerpro/fontawesome/css/fontawesome.css";
@import "@bryntum/schedulerpro/fontawesome/css/solid.css";
/* Structural CSS */
@import "@bryntum/schedulerpro/schedulerpro.css";
/* Bryntum theme of your choice */
@import "@bryntum/schedulerpro/svalbard-light.css";
```

You need to change the <code>App.scss</code> to <code>App.css</code> in the <code>App.vue</code>.

</div>
<div>

Create a <code>src/App.scss</code> file and add the following:

```scss
// FontAwesome is used for icons
@import "@bryntum/schedulerpro/fontawesome/css/fontawesome.css";
@import "@bryntum/schedulerpro/fontawesome/css/solid.css";
// Structural CSS
@import "@bryntum/schedulerpro/schedulerpro.css";
// Bryntum theme
@import "@bryntum/schedulerpro/svalbard-light.css";
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

By default, the Bryntum Scheduler Pro component is configured to occupy 100% of the parent DOM element 
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

Do you want to know more about how Bryntum Scheduler Pro integrates with Vue and starts to customize your application? We
provide you with a [complete Vue guide here](#SchedulerPro/guides/integration/vue/guide.md).

## Troubleshooting

Stuck somewhere? Please refer to this [Troubleshooting guide](#SchedulerPro/guides/integration/vue/troubleshooting.md). If
you find errors in our docs and/or onboarding guides, please report them in [our forums](https://forum.bryntum.com).

### Learn about Data

Bryntum components often use multiple data collections and entities. 

For a detailed explanation of how these elements 
interact, see our [guide to displaying data in Bryntum Scheduler Pro](#SchedulerPro/guides/data/displayingdata.md).



<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>