# Getting Started with Bryntum Scheduler in Vue

<div class="note">

Using an AI coding assistant? Install the <a href="#Scheduler/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

Learn how to install the Scheduler via npm and explore its numerous configuration options, such as `columns`,
`viewPreset`, `eventColor` and others. This video also demonstrates how easy it is to load resource and event data.

[@youtube](https://www.youtube.com/embed/Fw52KaIYVvA)

## Try Vue demos

Bryntum Scheduler is delivered with a variety of Vue demo applications showing its functionality.
All demo applications have been verified to be compatible with Node.js 20.

<div class="b-card-group-2">
<a href="https://bryntum.com/products/scheduler/examples/?framework=vue" class="b-card"><i class="fas fa-globe"></i>View online Vue demos</a>
<a href="#Scheduler/guides/integration/vue/guide.md#build-and-run-local-demos" class="b-card"><i class="fab fa-vuejs"></i>Build and run Vue demos</a>
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

<img src="Scheduler/getting-started-result.png" class="b-screenshot" alt="Getting Started on Bryntum Scheduler with Vue Result">

## Access to npm registry

You can try out Bryntum components for free using our public Bryntum trial packages.
If you have a Bryntum license, please refer to our [Npm Repository Guide](#Scheduler/guides/npm/repository/private-repository-access.md) to access the private Bryntum repository.

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

## Install Bryntum Scheduler packages

From your terminal, update project dependencies using the following commands:

<div class="docs-tabs" data-name="licensed">
<div>
    <a>Trial version</a>
    <a>Licensed version</a>
</div>
<div>

```shell
npm install @bryntum/scheduler@npm:@bryntum/scheduler-trial@7.3.4 @bryntum/scheduler-vue-3@7.3.4
```

</div>
<div>

```shell
npm install @bryntum/scheduler@7.3.4 @bryntum/scheduler-vue-3@7.3.4
```
</div>
</div>

<div class="note">

If you're using the licensed Bryntum version, ensure that you have configured your npm properly to get access to the Bryntum packages. If not, refer to <a href="#Scheduler/guides/npm-repository.md">this guide</a>.

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
import { BryntumScheduler } from '@bryntum/scheduler-vue-3';
import { schedulerProps } from './AppConfig.js';
</script>

<template>
  <bryntum-scheduler v-bind=schedulerProps />
</template>

<style lang="scss">
@import './App.scss';
</style>
```

</div>
<div>

```typescript
<script setup lang="ts">
import { BryntumScheduler } from '@bryntum/scheduler-vue-3';
import { schedulerProps } from './AppConfig.ts';
</script>

<template>
  <bryntum-scheduler v-bind="schedulerProps" />
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
export const schedulerProps = {
    startDate        : new Date(2026, 0, 1),
    endDate          : new Date(2026, 1, 10),
    viewPreset       : 'hourAndDay',
    rowHeight        : 50,
    barMargin        : 5,
    multiEventSelect : true,
    // Uncomment the following if you have images in public/users/
    // resourceImagePath : 'users/',
    columns          : [{ text : 'Name', field : 'name', width : 130 }],
    // CrudManager arranges loading and syncing of data in JSON form from/to a web service
    crudManager      : {
        loadUrl : 'data/data.json',
        autoLoad : true
    }
};
```

</div>
<div>

```typescript
import { type BryntumSchedulerProps } from '@bryntum/scheduler-vue-3';

export const schedulerProps : BryntumSchedulerProps = {
    startDate        : new Date(2026, 0, 1),
    endDate          : new Date(2026, 1, 10),
    viewPreset       : 'hourAndDay',
    rowHeight        : 50,
    barMargin        : 5,
    multiEventSelect : true,
    // Uncomment the following if you have images in public/users/
    // resourceImagePath : 'users/',
    columns          : [{ text : 'Name', field : 'name', width : 130 }],
    // CrudManager arranges loading and syncing of data in JSON form from/to a web service
    crudManager      : {
        loadUrl  : 'data/data.json',
        autoLoad : true
    }
};
```
</div>
</div>

<div class="note">

Note that the <code>startDate</code> and <code>endDate</code> configs passed to <code>schedulerProps</code> denote
the currently visible timespan.

</div>

## Add component data

Create a `public/data/data.json` file for example data and add the following JSON data to it:

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

This is the data the Bryntum Scheduler will use.

## Apply styles

### Stylesheets

Remove both `src/assets/main.css` and `src/assets/base.css`, and delete the `main.css` import from `src/main.ts`.

The following CSS files are provided with the Bryntum npm packages or in the `/build` folder of the distribution:

| File                              | Contents                      |
|-----------------------------------|-------------------------------|
| `scheduler.css`                     | Structural CSS                |
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

You'll need to import the structural CSS and the preferred theme into your project for the Bryntum Scheduler to render 
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
@import "@bryntum/scheduler/fontawesome/css/fontawesome.css";
@import "@bryntum/scheduler/fontawesome/css/solid.css";
/* Structural CSS */
@import "@bryntum/scheduler/scheduler.css";
/* Bryntum theme of your choice */
@import "@bryntum/scheduler/svalbard-light.css";
```

You need to change the <code>App.scss</code> to <code>App.css</code> in the <code>App.vue</code>.

</div>
<div>

Create a <code>src/App.scss</code> file and add the following:

```scss
// FontAwesome is used for icons
@import "@bryntum/scheduler/fontawesome/css/fontawesome.css";
@import "@bryntum/scheduler/fontawesome/css/solid.css";
// Structural CSS
@import "@bryntum/scheduler/scheduler.css";
// Bryntum theme
@import "@bryntum/scheduler/svalbard-light.css";
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

By default, the Bryntum Scheduler component is configured to occupy 100% of the parent DOM element 
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

## Customizations

Now that your app is up and running, it is time to try to customize some of the commonly used built-in features. 

### Customizing context menus

The Scheduler shows context menus when right-clicking the empty space in the schedule, as well as the event bars. In 
this video we walk you through how to customize the existing menu items, and adding new items. For an in-depth guide on 
this topic, please see [this guide](#Scheduler/guides/customization/contextmenu.md).

[@youtube](https://www.youtube.com/embed/nXMaClkkKdQ)

### Customizing the event editor

The Scheduler ships with a fully customizable event editor. In this video we walk you through the basic customizations,
such as adding new fields or modifying the default fields. For an in-depth guide on this topic, please see 
[this guide](#Scheduler/guides/customization/eventedit.md).

[@youtube](https://www.youtube.com/embed/o7xQ6B_Y04w)

## Full tutorial

To get familiar with the most common tasks developers perform, we have
created an [engaging tutorial](#Scheduler/guides/tutorial/tutorial-vue3.md) for you to follow.

## Further on integration with Vue

Do you want to know more about how Bryntum Scheduler integrates with Vue and starts to customize your application? We
provide you with a [complete Vue guide here](#Scheduler/guides/integration/vue/guide.md).

## Troubleshooting

Stuck somewhere? Please refer to this [Troubleshooting guide](#Scheduler/guides/integration/vue/troubleshooting.md). If
you find errors in our docs and/or onboarding guides, please report them in [our forums](https://forum.bryntum.com).

### Learn about Data

Bryntum components often use multiple data collections and entities. 

For a detailed explanation of how these elements 
interact, see our [guide to displaying data in Bryntum Scheduler](#Scheduler/guides/data/displayingdata.md).



<p class="last-modified">Last modified on 2026-07-22 10:51:35</p>