# Getting Started with Bryntum Scheduler in JavaScript with npm package manager

<div class="note">

Using an AI coding assistant? Install the <a href="#Scheduler/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

## Try JavaScript demos

Bryntum Scheduler is delivered with a variety of JavaScript demo applications showing its functionality.

<div class="b-card-group-2">
<a href="https://bryntum.com/products/scheduler/examples/" class="b-card"><i class="fas fa-globe"></i>View online JS demos</a>
<a href="#Scheduler/guides/download.md#javascript-demos" class="b-card"><i class="fab fa-js"></i>View local JS demos</a>
</div>

## Create JavaScript application

In this guide we will explain how to get started using the npm CLI. If you prefer to not use
npm, please visit the dedicated [Quick Start here](#Scheduler/guides/quick-start/javascript.md).

To get started, the broad steps are as follows:

1. [Access to npm registry](##access-to-npm-registry)
2. [Create Application](##create-application)
3. [Bryntum bundles](##bryntum-bundles)
4. [Install component](##install-component)
5. [Add component to Application](##add-component-to-application)
6. [Apply styles](##apply-styles)
7. [Run the application](##run-the-application)

The application we are about to build together is pretty simple, and will look 
like the live demo below:
<div class="external-example" data-file="Scheduler/guides/readme/basic.js"></div>

## Access to npm registry

You can try out Bryntum components for free using our public Bryntum trial packages.
If you have a Bryntum license, please refer to our [Npm Repository Guide](#Scheduler/guides/npm/repository/private-repository-access.md) to access the private Bryntum repository.

## Create Application

To create an application, we will use [Vitejs](https://vitejs.dev/guide) and 
choose vanilla JavaScript.

First, execute the vite command:

```shell
npm create vite@latest my-scheduler-app -- --template vanilla
```

<div class="note">

For npm 7+, extra double-dash is needed.

</div>

It will generate a vanilla JavaScript boilerplate. Next, install dependencies:

```shell
cd my-scheduler-app
npm install
```

Open the project folder and delete `counter.js`, we don't need it in our case.

## Install component

From your terminal, update project dependencies using the following commands:

<div class="docs-tabs" data-name="licensed">
<div>
    <a>Trial version</a>
    <a>Licensed version</a>
</div>
<div>

```shell
npm install @bryntum/scheduler@npm:@bryntum/scheduler-trial@7.3.4
```

</div>
<div>

```shell
npm install @bryntum/scheduler@7.3.4 
```
</div>
</div>

<div class="note">

If you're using the licensed Bryntum version, ensure that you have configured your npm properly to get access to the Bryntum packages. If not, refer to <a href="#Scheduler/guides/npm-repository.md">this guide</a>.

</div>

## Add component to Application

Once you have project set up, you can proceed with configuring your Scheduler.

Delete the `counter.js` and replace your `main.js` with the following code:

```javascript
import { Scheduler } from '@bryntum/scheduler';
import './style.css';

const scheduler = new Scheduler({
    appendTo         : 'app',
    startDate        : new Date(2026, 0, 1),
    endDate          : new Date(2026, 0, 30),
    autoHeight       : true,
    rowHeight        : 50,
    barMargin        : 5,
    multiEventSelect : true,

    columns : [
        { text : 'Name', field : 'name', width : 160 }
    ],

    resources : [
        { id : 1,  name : 'Dan Stevenson'  },
        { id : 2,  name : 'Talisha Babin'  },
        { id : 3,  name : 'Ravi Kumar'     },
        { id : 4,  name : 'Aisha Khan'     },
        { id : 5,  name : 'Michael Chen'   },
        { id : 6,  name : 'Sofia Lopez'    },
        { id : 7,  name : 'James Anderson' },
        { id : 8,  name : 'Eddie Johnson'  },
        { id : 9,  name : 'Ethan Wright'   },
        { id : 10, name : 'Liu Wei'        }
    ],
    events : [
        { resourceId : 1,  startDate : '2026-01-01', endDate : '2026-01-05', name : 'Kickoff Meeting' },
        { resourceId : 1,  startDate : '2026-01-06', endDate : '2026-01-10', name : 'Scope Definition' },
        { resourceId : 1,  startDate : '2026-01-12', endDate : '2026-01-29', name : 'Project Plan Review' },
        { resourceId : 2,  startDate : '2026-01-02', endDate : '2026-01-06', name : 'Requirement Gathering' },
        { resourceId : 2,  startDate : '2026-01-07', endDate : '2026-01-21', name : 'Stakeholder Interviews' },
        { resourceId : 2,  startDate : '2026-01-22', endDate : '2026-01-27', name : 'Requirement Signoff' },
        { resourceId : 3,  startDate : '2026-01-05', endDate : '2026-01-14', name : 'System Design' },
        { resourceId : 3,  startDate : '2026-01-10', endDate : '2026-01-20', name : 'Database Modeling' },
        { resourceId : 3,  startDate : '2026-01-23', endDate : '2026-01-28', name : 'API Design' },
        { resourceId : 4,  startDate : '2026-01-08', endDate : '2026-01-15', name : 'Backend Setup' },
        { resourceId : 4,  startDate : '2026-01-15', endDate : '2026-01-22', name : 'Authentication Module' },
        { resourceId : 4,  startDate : '2026-01-21', endDate : '2026-01-27', name : 'Data Services' },
        { resourceId : 5,  startDate : '2026-01-02', endDate : '2026-01-14', name : 'UI Wireframes' },
        { resourceId : 5,  startDate : '2026-01-15', endDate : '2026-01-19', name : 'Frontend Components' },
        { resourceId : 5,  startDate : '2026-01-20', endDate : '2026-01-27', name : 'Styling & Theme' },
        { resourceId : 6,  startDate : '2026-01-12', endDate : '2026-01-16', name : 'API Integration' },
        { resourceId : 6,  startDate : '2026-01-17', endDate : '2026-01-21', name : 'GraphQL Setup' },
        { resourceId : 6,  startDate : '2026-01-22', endDate : '2026-01-25', name : 'Integration Testing' },
        { resourceId : 7,  startDate : '2026-01-05', endDate : '2026-01-10', name : 'Unit Testing' },
        { resourceId : 7,  startDate : '2026-01-12', endDate : '2026-01-19', name : 'Automation Scripts' },
        { resourceId : 7,  startDate : '2026-01-18', endDate : '2026-01-27', name : 'Performance Testing' },
        { resourceId : 8,  startDate : '2026-01-10', endDate : '2026-01-22', name : 'Bug Fix Round 1' },
        { resourceId : 8,  startDate : '2026-01-23', endDate : '2026-01-26', name : 'UI Fixes' },
        { resourceId : 8,  startDate : '2026-01-27', endDate : '2026-01-30', name : 'Regression Testing' },
        { resourceId : 9,  startDate : '2026-01-03', endDate : '2026-01-14', name : 'Client Demo Prep' },
        { resourceId : 9,  startDate : '2026-01-15', endDate : '2026-01-19', name : 'Client Review' },
        { resourceId : 9,  startDate : '2026-01-20', endDate : '2026-01-24', name : 'Feedback Implementation' },
        { resourceId : 10, startDate : '2026-01-02', endDate : '2026-01-16', name : 'Deployment Setup' },
        { resourceId : 10, startDate : '2026-01-19', endDate : '2026-01-22', name : 'Go-Live' },
        { resourceId : 10, startDate : '2026-01-23', endDate : '2026-01-27', name : 'Post-Deployment Support' }
    ]
});
```

Here we are providing inline data, you can learn more about how we manage 
data using Store [in this guide](#Core/guides/data/storebasics.md).

<div class="note">

Note that the <code>startDate</code> and <code>endDate</code> configs passed to the <code>Scheduler</code> instance denote the currently accessible 
timespan.

</div>

Learn more about how to use EcmaScript modules [here](#Scheduler/guides/gettingstarted/es6bundle.md).

If you want to discover how flexible the Bryntum Scheduler Component is, please explore 
the [API documentation](#Scheduler/view/Scheduler).

## Apply styles

### Stylesheets

The following CSS files are provided with the Bryntum npm packages:

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
correctly, and if you are not replacing the icons used by the component, you will also need to include Font Awesome.

Remove the content of `style.css` and replace it with the following:

```css
/* FontAwesome is used for icons */
@import "@bryntum/scheduler/fontawesome/css/fontawesome.css";
@import "@bryntum/scheduler/fontawesome/css/solid.css";
/* Structural CSS */
@import "@bryntum/scheduler/scheduler.css";
/* Bryntum theme of your choice */
@import "@bryntum/scheduler/svalbard-light.css";
```

<div class="note">

We have referenced the CSS file directly from the <code>node_modules</code> folder for simplicity in this code example.
Consider using your preferred build tool instead.

</div>

### Sizing the component

By default, the Bryntum Scheduler component is configured to occupy 100% of the parent DOM element 
with a `min-height` of `10em`.

To display the component at the appropriate size, you can, for example, set parent components to 
take up the full height of the screen.

```css
#app {
    margin         : 0;
    display        : flex;
    flex-direction : column;
    height         : 100vh;
    font-size      : 14px;
}
```

There are many other solutions depending on the situation. Feel free to adapt the code above regarding your 
application layout. For more information on the topic, see this guide
[Sizing the component](https://bryntum.com/products/grid/docs/guide/Grid/basics/sizing).

## Run the application

Run the application by executing:

```shell
npm run dev
```

## What to do next?

### Tutorial

Now it is time to customize your application. To get familiar with the most common tasks developers perform, we have
designed an [engaging tutorial](#Scheduler/guides/tutorial/tutorial.md) that we are excited 
to see you follow.

### Learn about Data

Bryntum components often use multiple data collections and entities. 

For a detailed explanation of how these elements 
interact, see our [guide to displaying data in Bryntum Scheduler](#Scheduler/guides/data/displayingdata.md).

### Enabling features

Please refer to the
[enabling extra features guide](#Scheduler/guides/basics/features.md) 
to learn how to enhance your Scheduler chart with additional functionality (such as displaying labels for the tasks).

### Responsiveness

Scheduler can be configured to work well on many different screen sizes. This is achieved by specifying different
responsive "levels" (breakpoints) on Scheduler and then having per level configurations on the columns. 

If this is a
concern now, visit the  [responsive guide](#Scheduler/guides/customization/responsive.md) 
 to learn how to configure responsiveness.

### Localization

Bryntum Scheduler uses locales for translations of texts, date formats and such. This
[localization guide](#Scheduler/guides/customization/localization.md) 
shows you how to use one of the locales that Bryntum Scheduler ships with and how to create your own.



<p class="last-modified">Last modified on 2026-07-22 10:51:34</p>