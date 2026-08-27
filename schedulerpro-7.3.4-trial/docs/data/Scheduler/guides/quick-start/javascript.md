# Getting Started with Bryntum Scheduler in JavaScript

<div class="note">

Using an AI coding assistant? Install the <a href="#Scheduler/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

[@youtube](https://youtube.com/embed/IZTYC9bhbF8)

## Try JavaScript demos

Bryntum Scheduler is delivered with a variety of JavaScript demo applications showing its functionality.

<div class="b-card-group-2">
<a href="https://bryntum.com/products/scheduler/examples/" class="b-card"><i class="fas fa-globe"></i>View online JS demos</a>
<a href="#Scheduler/guides/download.md#javascript-demos" class="b-card"><i class="fab fa-js"></i>View local JS demos</a>
</div>

## Create JavaScript application

In this guide we will explain how to get started if you are not using npm. If you prefer to use npm,
[please visit the dedicated Quick Start here](#Scheduler/guides/quick-start/javascript-npm.md).

To get started, the broad steps are as follows:

1. [Download Bryntum Scheduler](##download)
2. [Create Application](##create-application)
3. [Bryntum bundles](##bryntum-bundles)
4. [Add component to Application](##add-component-to-application)
5. [Apply styles](##apply-styles)
6. [Run the Application](##run-the-application)

The application we are about to build together is pretty simple, and will look like the live demo below:
<div class="external-example" data-file="Scheduler/guides/readme/basic.js"></div>

## Download

Bryntum Scheduler is a commercial product, but you can access our free trial archive with bundles and examples by
[downloading it here](https://bryntum.com/download/?product=scheduler).

## Create Application

You can proceed as usual. The Bryntum Scheduler Component is compliant with the most popular Javascript Standards.

To create an application, create a new folder and add the following to `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bryntum Scheduler App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

## Bryntum bundles

The Bryntum Scheduler distribution provides pre-build JavaScript bundles.
All bundles are transpiled with `chrome: 88` babel preset.

In distribution zip they are located under the `/build` folder.

| File                    | Contents                                                        |
|-------------------------|-----------------------------------------------------------------|
| `scheduler.module.js`     | Modules format bundle without WebComponents                     |
| `scheduler.lwc.module.js` | Modules format bundle with Lightning WebComponents (Salesforce) |
| `scheduler.wc.module.js`  | Modules format bundle with WebComponents                        |
| `scheduler.umd.js`        | UMD format bundle with WebComponents                            |

Typings for TypeScripts can be found in files with a `.d.ts` file extension.

Minified bundles are available for Licensed product version and delivered with `.min.js` suffix.

### Using EcmaScript module bundles

If you choose this option, **copy** the selected module file onto your application, in the root folder, for instance.

Create a `main.js` file, you can import the scheduler JavaScript.

```javascript
import { Scheduler } from './scheduler.module.js';

const scheduler = new Scheduler({/*...*/ });
```

<div class="note">

We have copied the module directly from the <code>build</code> folder for simplicity in this code example. Consider
using your preferred build tool instead.

</div>

Learn more about how to use EcmaScript modules [here](#Scheduler/guides/gettingstarted/es6bundle.md).

### Using `<script>` tag and UMD files

Please consider this solution as legacy and use it only for compatibility. If you choose this option, **copy** the
selected UMD file onto your application, in the root folder, for instance.

To include Bryntum Scheduler on your page using a plain old script tag, add a `<script>` tag pointing to the UMD bundle
file in the `<HEAD>` of your `index.html` page. Example:

```html
<script src="scheduler.umd.js"></script>
```

In the `main.js`, you will be able to access Scheduler classes in the global `bryntum` namespace as
follows:

```javascript
const scheduler = new bryntum.scheduler.Scheduler({/*...*/ });
```

<div class="note">

We also recommend you to copy onto your application the <code>.js.map</code> file paired with the umd file you selected.

</div>

<div class="note">

We have copied the module directly from the <code>build</code> folder for simplicity in this code example. Consider
using your preferred build tool instead.

</div>

Read more on [script tag and UMD modules...](#Scheduler/guides/gettingstarted/scripttag.md)

## Add component to Application

Assuming the use of an EcmaScript module bundle:

```javascript
import { Scheduler } from './scheduler.module.js';

const scheduler = new Scheduler({
    appendTo : 'app',

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

If you want to discover how flexible the Bryntum Scheduler Component is, please explore 
the [API documentation](#Scheduler/view/Scheduler).

## Apply styles

### Stylesheets

You'll find a complete list of available CSS files in the `/build` folder of the distribution:

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

You'll need to copy and import the structural CSS and the preferred theme into your project for the Bryntum Scheduler to 
render correctly, and if you are not replacing the icons used by the component, you will also need to include Font 
Awesome. Below we assume they are in the root folder.

<div class="note">

We also recommend you to copy onto your application the <code>.css.map</code> file paired with the css file you selected.

</div>

Add link tags for the structural CSS and a theme to your `index.html` in the `<head>...</head>` section:

```html
<!-- Structural CSS -->
<link rel="stylesheet" href="scheduler.css">
<!-- Bryntum theme of your choice -->    
<link rel="stylesheet" href="svalbard-light.css" data-bryntum-theme>
```

Make sure to copy the `fonts/` folder located in the `/build` right next to the `.css` theme.

```bash
- my-scheduler-app/
  - fonts/
  - scheduler.css
  - svalbard-light.css
```

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

There are many other solutions depending on the situation. Feel free to adapt the code above regarding your application
layout. For more information on the topic, see this guide
[Sizing the component](https://bryntum.com/products/grid/docs/guide/Grid/basics/sizing).

## Run the application

To see the preview, start a live-server (if you are using one) or 
open the `index.html` file in your browser from your local web server.

<div class="note">

A local web server is required, viewing the app page directly from the local file system won't work.

</div>

## Customizations

Now that your app is up and running, it is time to try to customize some of the commonly used built-in features.

### Customizing context menus

The Scheduler shows context menus when right-clicking the empty space in the schedule, as well as the event bars. In
this video we walk you through how to customize the existing menu items, and adding new items. For an in-depth guide on
this topic, please see [this guide](#Scheduler/guides/customization/contextmenu.md).

[@youtube](https://youtube.com/embed/dEnpeZvC4Rc)

### Customizing the event editor

The Scheduler ships with a fully customizable event editor. In this video we walk you through the basic customizations,
such as adding new fields or modifying the default fields. For an in-depth guide on this topic, please see 
[this guide](#Scheduler/guides/customization/eventedit.md).

[@youtube](https://youtube.com/embed/a0ikJn1tCmw)

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