# Bryntum Scheduler: Quick start guide for Angular integration

<div class="note">

Using an AI coding assistant? Install the <a href="#Scheduler/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

[@youtube](https://www.youtube.com/embed/Hz45xuxP5Gk)

## Try Angular demos

Bryntum Scheduler ships with several demo Angular applications that showcase its functionality. Each demo has been tested
and confirmed to be compatible with Node.js 20.

<div class="b-card-group-2">
<a href="https://bryntum.com/products/scheduler/examples/?framework=angular" class="b-card"><i class="fas fa-globe"></i>View online Angular demos</a>
<a href="#Scheduler/guides/integration/angular/guide.md#build-and-run-local-demos" class="b-card"><i class="fab fa-angular"></i>Build and run Angular demos</a>
</div>

## Version requirements

Minimum supported:

 * Angular: `9.0.0` or higher
 * TypeScript: `3.6.0` or higher (for TypeScript application)

Recommended:

 * Angular: `12.0.0` or higher
 * TypeScript: `4.0.0` or higher (for TypeScript application)

## Create Angular application

This quick start guide will show you how to integrate Bryntum Scheduler into your Angular applications.

To illustrate the integration process, we'll build a simple application that looks like the image below.

<img src="Scheduler/getting-started-result.png" class="b-screenshot" alt="Screenshot showing example Bryntum Scheduler in an Angular application">

Here's a breakdown of the process we'll follow:

1. [Access the Bryntum npm registry](##access-to-npm-registry)
2. [Create an Angular application](##create-application)
3. [Install the Bryntum Scheduler component](##install-component)
4. [Add the component to the application](##add-component-to-application)
5. [Apply styles](##apply-styles)
6. [Run the application](##run-the-application)

## Access to npm registry

You can try out Bryntum components for free using our public Bryntum trial packages. If you have a Bryntum license,
please refer to our [Npm Repository Guide](#Scheduler/guides/npm/repository/private-repository-access.md) to access the
private Bryntum repository.

## Create application

As with all the examples included in the distribution, we will use the [Angular CLI](https://cli.angular.io/) to build
Angular applications.

Install the Angular CLI with the following command:

```shell
npm install -g @angular/cli
```

Use the Angular CLI to create a basic application using Typescript:

```shell
ng new scheduler-app --no-standalone --no-routing --ssr=false
```

You can replace `scheduler-app` with your preferred application name.

<div class="note">
 Bryntum components render on the client side. We use <code>--ssr=false</code> to indicate that server-side rendering is not
required. 
</div>

You will be prompted to select a stylesheet format. We recommend choosing either **CSS** or **SCSS**. This guide covers
both options.

Now move to your application folder:

```shell
cd scheduler-app
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
npm install @bryntum/scheduler@npm:@bryntum/scheduler-trial@7.3.4 @bryntum/scheduler-angular@7.3.4
```

</div>
<div>

```shell
npm install @bryntum/scheduler@7.3.4 @bryntum/scheduler-angular@7.3.4
```
</div>
</div>

<div class="note">

If you're using the licensed Bryntum version, ensure that you have configured your npm properly to get access to the Bryntum packages. If not, refer to <a href="#Scheduler/guides/npm-repository.md">this guide</a>.

</div>

## Add the component to the application

<div class="note">
 Starting from Angular v20, file naming conventions have changed.

<ul>
<li><code>app.module.ts</code> → <code>app-module.ts</code></li>
<li><code>app.component.ts</code> → <code>app.ts</code></li>
<li><code>app.component.html</code> → <code>app.html</code></li>
<li><code>Class AppComponent</code> → <code>Class App</code></li>
</ul>
If you are on earlier version, please adjust the filenames and class names accordingly.

</div>

Edit the `src/app/app-module.ts` file and add the following import:

```typescript
import { BryntumSchedulerModule } from "@bryntum/scheduler-angular";
```

Next, add `BryntumSchedulerModule` to `imports[]` :

```typescript
@NgModule({
    imports : [
        BryntumSchedulerModule
    ]
})
```

Next, edit the `src/app/app.ts` file and replace its content with the following:

```typescript
import { Component, ViewChild } from '@angular/core';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { schedulerProps } from './app.config';

@Component({
    selector    : 'app-root',
    standalone  : false,
    templateUrl : './app.html',
    styleUrl    : './app.css'
})
export class App {

    schedulerProps = schedulerProps;

    @ViewChild('scheduler') schedulerComponent!: BryntumSchedulerComponent;
}
```

If you're using SCSS styling, replace `'./app.css'` with `'./app.scss'`.

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

The Bryntum Scheduler uses multiple stores to manage its data, with each store dedicated to a specific type. For example,
the Resource Store holds resource data such as people or assets. This separation keeps the data organized, synchronized,
and easier to maintain.

 To learn
more, visit [Displaying data](#Scheduler/guides/data/displayingdata.md) 

Create a `src/app/app.config.ts` file with the following content:

```typescript
import { BryntumSchedulerProps } from '@bryntum/scheduler-angular';

export const schedulerProps: BryntumSchedulerProps = {
    columns : [
        { text : 'Name', field : 'name', width : 160 }
    ],
    startDate   : new Date(2026, 0, 1),
    endDate     : new Date(2026, 1, 10),
    crudManager : {
        autoLoad         : true,
        loadUrl          : 'data/data.json',
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    }
};

```

 <div class="note">
 Note that the <code>startDate</code> and <code>endDate</code> configs passed to
<code>schedulerProps</code> denote the currently visible timespan. 
</div>

Finally, edit the `src/app/app.html` file and replace its content with the following:

```html
<bryntum-scheduler
    #scheduler
    [crudManager] = 'schedulerProps.crudManager!'
    [columns] = "schedulerProps.columns!"
    [startDate] = "schedulerProps.startDate!"
    [endDate] = "schedulerProps.endDate!"
></bryntum-scheduler>
```

## Apply styles

Bryntum Scheduler needs a theme and structural CSS to render correctly. If you are not replacing the icons used by the
component, you will also need to include Font Awesome.

The following CSS files are provided in the Bryntum npm packages or in the `/build` folder of the distribution:

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

You need to reference the selected CSS file in your project.

<div class="docs-tabs" data-name="stylesheet">
<div>
    <a>Build folder</a>
    <a>npm</a>
</div>
<div>
 Copy the CSS file you're using, its paired <code>.css.map</code> file, and the <strong>font</strong>
folder into a folder in your project, such as <code>src/app</code>.

<div class="note">
 We also recommend copying the <code>.css.map</code> file paired with the CSS file you selected. 
</div>

Edit the <code>src/app/app.ts</code> file and add a reference to the CSS file location as follows:

```typescript
styleUrls: [
  "./app.css",
  "./fontawesome/css/fontawesome.css",
  "./fontawesome/css/solid.css",
  "./scheduler.css",
  "./material3-light.css",
];
```

</div>
<div>

Edit the <code>src/styles.css</code> or <code>src/styles.scss</code> file and add the following:

```scss
/* FontAwesome is used for icons */
@import "@bryntum/scheduler/fontawesome/css/fontawesome.css";
@import "@bryntum/scheduler/fontawesome/css/solid.css";
/* Structural CSS */
@import "@bryntum/scheduler/scheduler.css";
/* Bryntum theme of your choice */
@import "@bryntum/scheduler/material3-light.css";
```

If you want to customize the default theme, override the relevant set of CSS variables after the import. Visit the
section on <a href="#Scheduler/guides/customization/styling.md#creating-a-custom-theme">creating a custom theme</a> for more info.
</div>
</div>

<div class="note">
 The Bryntum components expect styling to be available globally, if you move the styling to <code>app.css</code>, it won't
work, until you add the following lines of code to <code>app.ts</code>:

```typescript
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None
})
```

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

In the <code>src/styles.css</code> file, add the following:

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
app-root {
  flex: 1 1 100%;
}
```

</div>
<div>

In the <code>src/styles.scss</code> file, add the following:

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
app-root {
  flex: 1 1 100%;
}
```
</div>
</div>

Various component-sizing solutions are available, so you can adapt the code above to suit your layout needs. For more
information, see our [sizing the component](https://bryntum.com/products/grid/docs/guide/Grid/basics/sizing) documentation.

## Run the application

From your terminal, run:

```shell
ng serve
```

You can now see your application at `http://localhost:4200`.

## Customizations

With your app up and running, it's time to customize some commonly used built-in features.

### Customizing context menus

The Scheduler shows context menus when right-clicking the empty space in the schedule, as well as the event bars. In
this video we walk you through how to customize the existing menu items, and adding new items. For an in-depth guide on
this topic, please see this [this guide](#Scheduler/guides/customization/contextmenu.md).

[@youtube](https://www.youtube.com/embed/0seuhWrIeXc)

### Customizing the event editor

The Scheduler ships with a fully customizable event editor. In this video we walk you through the basic customizations,
such as adding new fields or modifying the default fields. For an in-depth guide on this topic, please see
[this guide](#Scheduler/guides/customization/eventedit.md).

[@youtube](https://www.youtube.com/embed/OuSH7YFndPE)

## Troubleshooting

If you run into issues while setting up your Bryntum Scheduler component, refer to our
[troubleshooting guide for Bryntum Scheduler with Angular](#Scheduler/guides/integration/angular/troubleshooting.md).

## What to do next?

### Tutorial

Now it's time to customize your application! To help you get familiar with common developer tasks, we've created an
[interactive tutorial](#Scheduler/guides/tutorial/tutorial-angular.md) that we're excited for you to explore. 

### Advanced integration with Angular

Visit our [comprehensive Angular guide](#Scheduler/guides/integration/angular/guide.md) to learn more about integrating
Bryntum Scheduler with Angular and customizing your application.

### Working with data in Bryntum Scheduler

Bryntum components often use multiple data collections and entities. 

For a detailed explanation of how these elements 
interact, see our [guide to displaying data in Bryntum Scheduler](#Scheduler/guides/data/displayingdata.md).



<p class="last-modified">Last modified on 2026-07-22 10:51:34</p>