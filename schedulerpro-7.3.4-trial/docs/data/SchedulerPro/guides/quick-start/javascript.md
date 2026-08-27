# Getting Started with Bryntum Scheduler Pro in JavaScript

<div class="note">

Using an AI coding assistant? Install the <a href="#SchedulerPro/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

## Try JavaScript demos

Bryntum Scheduler Pro is delivered with a variety of JavaScript demo applications showing its functionality.

<div class="b-card-group-2">
<a href="https://bryntum.com/products/schedulerpro/examples/" class="b-card"><i class="fas fa-globe"></i>View online JS demos</a>
<a href="#SchedulerPro/guides/download.md#javascript-demos" class="b-card"><i class="fab fa-js"></i>View local JS demos</a>
</div>

## Create JavaScript application

In this guide we will explain how to get started if you are not using npm. If you prefer to use npm,
[please visit the dedicated Quick Start here](#SchedulerPro/guides/quick-start/javascript-npm.md).

To get started, the broad steps are as follows:

1. [Download Bryntum Scheduler Pro](##download)
2. [Create Application](##create-application)
3. [Bryntum bundles](##bryntum-bundles)
4. [Add component to Application](##add-component-to-application)
5. [Apply styles](##apply-styles)
6. [Run the Application](##run-the-application)

The application we are about to build together is pretty simple, and will look like the live demo below:
<div class="external-example" data-file="SchedulerPro/guides/readme/basic.js"></div>

## Download

Bryntum Scheduler Pro is a commercial product, but you can access our free trial archive with bundles and examples by
[downloading it here](https://bryntum.com/download/?product=schedulerpro).

## Create Application

You can proceed as usual. The Bryntum Scheduler Pro Component is compliant with the most popular Javascript Standards.

To create an application, create a new folder and add the following to `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bryntum Scheduler Pro App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

## Bryntum bundles

The Bryntum Scheduler Pro distribution provides pre-build JavaScript bundles.
All bundles are transpiled with `chrome: 88` babel preset.

In distribution zip they are located under the `/build` folder.

| File                    | Contents                                                        |
|-------------------------|-----------------------------------------------------------------|
| `schedulerpro.module.js`     | Modules format bundle without WebComponents                     |
| `schedulerpro.lwc.module.js` | Modules format bundle with Lightning WebComponents (Salesforce) |
| `schedulerpro.wc.module.js`  | Modules format bundle with WebComponents                        |
| `schedulerpro.umd.js`        | UMD format bundle with WebComponents                            |

Bryntum Scheduler Pro also contains Non-UI bundles for usage with Node.JS.

| File                    | Contents                         |
|-------------------------|----------------------------------|
| `schedulerpro.node.cjs`      | Non-UI bundle in CommonJS format |
| `schedulerpro.node.mjs`      | Non-UI bundle in Modules format  |

Typings for TypeScripts can be found in files with a `.d.ts` file extension.

Minified bundles are available for Licensed product version and delivered with `.min.js` suffix.

### Using EcmaScript module bundles

If you choose this option, **copy** the selected module file onto your application, in the root folder, for instance.

Create a `main.js` file, you can import the schedulerpro JavaScript.

```javascript
import { SchedulerPro } from './schedulerpro.module.js';

const schedulerPro = new SchedulerPro({/*...*/ });
```

<div class="note">

We have copied the module directly from the <code>build</code> folder for simplicity in this code example. Consider
using your preferred build tool instead.

</div>

Learn more about how to use EcmaScript modules [here](#SchedulerPro/guides/gettingstarted/es6bundle.md).

### Using `<script>` tag and UMD files

Please consider this solution as legacy and use it only for compatibility. If you choose this option, **copy** the
selected UMD file onto your application, in the root folder, for instance.

To include Bryntum Scheduler Pro on your page using a plain old script tag, add a `<script>` tag pointing to the UMD bundle
file in the `<HEAD>` of your `index.html` page. Example:

```html
<script src="schedulerpro.umd.js"></script>
```

In the `main.js`, you will be able to access SchedulerPro classes in the global `bryntum` namespace as
follows:

```javascript
const schedulerPro = new bryntum.schedulerpro.SchedulerPro({/*...*/ });
```

<div class="note">

We also recommend you to copy onto your application the <code>.js.map</code> file paired with the umd file you selected.

</div>

<div class="note">

We have copied the module directly from the <code>build</code> folder for simplicity in this code example. Consider
using your preferred build tool instead.

</div>

Read more on [script tag and UMD modules...](#SchedulerPro/guides/gettingstarted/scripttag.md)

## Add component to Application

Assuming the use of an EcmaScript module bundle:

```javascript
import { SchedulerPro } from './schedulerpro.module.js';

const schedulerPro = new SchedulerPro({
    appendTo   : 'app',
    startDate  : new Date(2026, 0, 1),
    endDate    : new Date(2026, 1, 10),
    rowHeight  : 60,
    barMargin  : 15,
    eventStyle : 'colored',
    viewPreset : 'hourAndDay',
    columns    : [
        { text : 'Name', field : 'name', width : 160 }
    ],
    project : {

        resources : [
            { id : 1, name : 'Dan Stevenson' },
            { id : 2, name : 'Talisha Babin' },
            { id : 3, name : 'Michael Chen' },
            { id : 4, name : 'Sophia Rodriguez' },
            { id : 5, name : 'Arjun Mehta' }
        ],
        events : [
            { id : 1,  startDate : '2026-01-01', duration : 3, durationUnit : 'd', name : 'Project Kickoff' },
            { id : 2,  startDate : '2026-01-04', duration : 4, durationUnit : 'd', name : 'Requirement Gathering' },
            { id : 3,  startDate : '2026-01-08', duration : 5, durationUnit : 'd', name : 'UI/UX Design' },
            { id : 4,  startDate : '2026-01-13', duration : 7, durationUnit : 'd', name : 'Backend Development' },
            { id : 5,  startDate : '2026-01-20', duration : 6, durationUnit : 'd', name : 'Frontend Development' },
            { id : 6,  startDate : '2026-01-26', duration : 4, durationUnit : 'd', name : 'API Integration' },
            { id : 7,  startDate : '2026-01-30', duration : 3, durationUnit : 'd', name : 'Testing & QA' },
            { id : 8,  startDate : '2026-02-02', duration : 2, durationUnit : 'd', name : 'Client Review' },
            { id : 9,  startDate : '2026-02-04', duration : 3, durationUnit : 'd', name : 'Bug Fixing' },
            { id : 10, startDate : '2026-02-07', duration : 2, durationUnit : 'd', name : 'Final Deployment' }
        ],
        assignments : [
            { event : 1,  resource : 1 },
            { event : 2,  resource : 2 },
            { event : 3,  resource : 3 },
            { event : 4,  resource : 4 },
            { event : 5,  resource : 5 },
            { event : 6,  resource : 3 },
            { event : 7,  resource : 2 },
            { event : 8,  resource : 1 },
            { event : 9,  resource : 4 },
            { event : 10, resource : 5 }
        ],
        dependencies : [
            { fromEvent : 1, toEvent : 2 },
            { fromEvent : 2, toEvent : 3 },
            { fromEvent : 3, toEvent : 4 },
            { fromEvent : 4, toEvent : 5 },
            { fromEvent : 5, toEvent : 6 },
            { fromEvent : 6, toEvent : 7 },
            { fromEvent : 7, toEvent : 8 },
            { fromEvent : 8, toEvent : 9 },
            { fromEvent : 9, toEvent : 10 }
        ]
    }
});
```

Here we are providing inline data, you can learn more about how we manage 
data using Store [in this guide](#Core/guides/data/storebasics.md).

In the code sample above:

- A simple project is created with a few resources and linked events.
- Assignments store details on which resources are assigned to specific events.
- Since `Event 2` lacks a start date, the [scheduling engine](engine) calculates it based on the start date and duration
  of `Event 1`.

Learn more in our [guide to displaying data in Bryntum Scheduler Pro](#Scheduler/guides/data/displayingdata.md).

<div class="note">

Note that the <code>startDate</code> and <code>endDate</code> configs passed to the <code>SchedulerPro</code> instance denote the currently accessible 
timespan.

</div>

If you want to discover how flexible the Bryntum Scheduler Pro Component is, please explore 
the [API documentation](#SchedulerPro/view/SchedulerPro).

## Apply styles

### Stylesheets

You'll find a complete list of available CSS files in the `/build` folder of the distribution:

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

You'll need to copy and import the structural CSS and the preferred theme into your project for the Bryntum Scheduler Pro to 
render correctly, and if you are not replacing the icons used by the component, you will also need to include Font 
Awesome. Below we assume they are in the root folder.

<div class="note">

We also recommend you to copy onto your application the <code>.css.map</code> file paired with the css file you selected.

</div>

Add link tags for the structural CSS and a theme to your `index.html` in the `<head>...</head>` section:

```html
<!-- Structural CSS -->
<link rel="stylesheet" href="schedulerpro.css">
<!-- Bryntum theme of your choice -->    
<link rel="stylesheet" href="svalbard-light.css" data-bryntum-theme>
```

Make sure to copy the `fonts/` folder located in the `/build` right next to the `.css` theme.

```bash
- my-schedulerpro-app/
  - fonts/
  - schedulerpro.css
  - svalbard-light.css
```

### Sizing the component

By default, the Bryntum Scheduler Pro component is configured to occupy 100% of the parent DOM element 
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

There are many other solutions depending on the situation. Feel free to adapt the code above regarding your application
layout. For more information on the topic, see this guide
[Sizing the component](https://bryntum.com/products/grid/docs/guide/Grid/basics/sizing).

## Run the application

To see the preview, start a live-server (if you are using one) or 
open the `index.html` file in your browser from your local web server.

<div class="note">

A local web server is required, viewing the app page directly from the local file system won't work.

</div>

## What to do next?

### Tutorial

Now it is time to customize your application. To get familiar with the most common tasks developers perform, we have
designed an [engaging tutorial](#SchedulerPro/guides/tutorial.md) that we are excited 
to see you follow.

### Learn about Data

Bryntum components often use multiple data collections and entities. 

For a detailed explanation of how these elements 
interact, see our [guide to displaying data in Bryntum Scheduler Pro](#SchedulerPro/guides/data/displayingdata.md).

### Enabling features

Please refer to the
[enabling extra features guide](#SchedulerPro/guides/basics/features.md) 
to learn how to enhance your SchedulerPro chart with additional functionality (such as displaying labels for the tasks).

### Responsiveness

SchedulerPro can be configured to work well on many different screen sizes. This is achieved by specifying different
responsive "levels" (breakpoints) on SchedulerPro and then having per level configurations on the columns. 

If this is a
concern now, visit the 
[responsive guide](#Scheduler/guides/customization/responsive.md) 
 to learn how to configure responsiveness.

### Localization

Bryntum Scheduler Pro uses locales for translations of texts, date formats and such. This
[localization guide](#SchedulerPro/guides/customization/localization.md) 
shows you how to use one of the locales that Bryntum Scheduler Pro ships with and how to create your own.



<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>