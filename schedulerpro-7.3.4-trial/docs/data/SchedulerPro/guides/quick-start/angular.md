# Bryntum Scheduler Pro: Quick start guide for Angular integration

<div class="note">

Using an AI coding assistant? Install the <a href="#SchedulerPro/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

[@youtube](https://www.youtube.com/embed/Hz45xuxP5Gk)

## Try Angular demos

Bryntum Scheduler Pro ships with several demo Angular applications that showcase its functionality. Each demo has been tested
and confirmed to be compatible with Node.js 20.

<div class="b-card-group-2">
<a href="https://bryntum.com/products/schedulerpro/examples/?framework=angular" class="b-card"><i class="fas fa-globe"></i>View online Angular demos</a>
<a href="#SchedulerPro/guides/integration/angular/guide.md#build-and-run-local-demos" class="b-card"><i class="fab fa-angular"></i>Build and run Angular demos</a>
</div>

## Version requirements

Minimum supported:

 * Angular: `9.0.0` or higher
 * TypeScript: `3.6.0` or higher (for TypeScript application)

Recommended:

 * Angular: `12.0.0` or higher
 * TypeScript: `4.0.0` or higher (for TypeScript application)

## Create Angular application

This quick start guide will show you how to integrate Bryntum Scheduler Pro into your Angular applications.

To illustrate the integration process, we'll build a simple application that looks like the image below.

<img src="SchedulerPro/getting-started-result.png" class="b-screenshot" alt="Screenshot showing example Bryntum Scheduler Pro in an Angular application">

Here's a breakdown of the process we'll follow:

1. [Access the Bryntum npm registry](##access-to-npm-registry)
2. [Create an Angular application](##create-application)
3. [Install the Bryntum Scheduler Pro component](##install-component)
4. [Add the component to the application](##add-component-to-application)
5. [Apply styles](##apply-styles)
6. [Run the application](##run-the-application)

## Access to npm registry

You can try out Bryntum components for free using our public Bryntum trial packages. If you have a Bryntum license,
please refer to our [Npm Repository Guide](#SchedulerPro/guides/npm/repository/private-repository-access.md) to access the
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
ng new schedulerpro-app --no-standalone --no-routing --ssr=false
```

You can replace `schedulerpro-app` with your preferred application name.

<div class="note">
 Bryntum components render on the client side. We use <code>--ssr=false</code> to indicate that server-side rendering is not
required. 
</div>

You will be prompted to select a stylesheet format. We recommend choosing either **CSS** or **SCSS**. This guide covers
both options.

Now move to your application folder:

```shell
cd schedulerpro-app
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
npm install @bryntum/schedulerpro@npm:@bryntum/schedulerpro-trial@7.3.4 @bryntum/schedulerpro-angular@7.3.4
```

</div>
<div>

```shell
npm install @bryntum/schedulerpro@7.3.4 @bryntum/schedulerpro-angular@7.3.4
```
</div>
</div>

<div class="note">

If you're using the licensed Bryntum version, ensure that you have configured your npm properly to get access to the Bryntum packages. If not, refer to <a href="#SchedulerPro/guides/npm-repository.md">this guide</a>.

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
import { BryntumSchedulerProModule } from "@bryntum/schedulerpro-angular";
```

Next, add `BryntumSchedulerProModule` to `imports[]` :

```typescript
@NgModule({
    imports : [
        BryntumSchedulerProModule
    ]
})
```

Next, edit the `src/app/app.ts` file and replace its content with the following:

```typescript
import { Component, ViewChild } from '@angular/core';
import { BryntumSchedulerProComponent, BryntumSchedulerProProjectModelComponent } from '@bryntum/schedulerpro-angular';
import { schedulerProProps, projectProps } from './app.config';

@Component({
    selector    : 'app-root',
    standalone  : false,
    templateUrl : './app.html',
    styleUrl    : './app.scss'
})
export class App  {

    schedulerProProps = schedulerProProps;
    projectProps = projectProps;

    @ViewChild('schedulerpro') schedulerProComponent!: BryntumSchedulerProComponent;
    @ViewChild('project') projectComponent!: BryntumSchedulerProProjectModelComponent;
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

The Bryntum Scheduler Pro uses multiple stores to manage its data, with each store dedicated to a specific type. For example,
the Resource Store holds resource data such as people or assets. This separation keeps the data organized, synchronized,
and easier to maintain.

 To learn
more, visit [Displaying data](#SchedulerPro/guides/data/displayingdata.md) 

Create a `src/app/app.config.ts` file with the following content:

```typescript
import { BryntumSchedulerProProps, BryntumSchedulerProProjectModelProps } from '@bryntum/schedulerpro-angular';

export const projectProps: BryntumSchedulerProProjectModelProps = {
    loadUrl  : 'data/data.json',
    autoLoad : true
};

export const schedulerProProps: BryntumSchedulerProProps = {
    columns : [
        { text : 'Name', field : 'name', width : 160 }
    ],
    startDate : new Date(2026, 0, 1),
    endDate   : new Date(2026, 1, 10)
};

```

 <div class="note">
 Note that the <code>startDate</code> and <code>endDate</code> configs passed to
<code>schedulerProProps</code> denote the currently visible timespan. 
</div>

Finally, edit the `src/app/app.html` file and replace its content with the following:

```html
<bryntum-scheduler-pro-project-model
    #project
    [loadUrl] = 'projectProps.loadUrl!'
    [autoLoad] = 'projectProps.autoLoad!'
></bryntum-scheduler-pro-project-model>

<bryntum-scheduler-pro
    #schedulerpro
    [columns] = "schedulerProProps.columns!"
    [startDate] = "schedulerProProps.startDate!"
    [endDate] = "schedulerProProps.endDate!"
    [project] = "project"
></bryntum-scheduler-pro>
```

## Apply styles

Bryntum Scheduler Pro needs a theme and structural CSS to render correctly. If you are not replacing the icons used by the
component, you will also need to include Font Awesome.

The following CSS files are provided in the Bryntum npm packages or in the `/build` folder of the distribution:

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
  "./schedulerpro.css",
  "./material3-light.css",
];
```

</div>
<div>

Edit the <code>src/styles.css</code> or <code>src/styles.scss</code> file and add the following:

```scss
/* FontAwesome is used for icons */
@import "@bryntum/schedulerpro/fontawesome/css/fontawesome.css";
@import "@bryntum/schedulerpro/fontawesome/css/solid.css";
/* Structural CSS */
@import "@bryntum/schedulerpro/schedulerpro.css";
/* Bryntum theme of your choice */
@import "@bryntum/schedulerpro/material3-light.css";
```

If you want to customize the default theme, override the relevant set of CSS variables after the import. Visit the
section on <a href="#SchedulerPro/guides/customization/styling.md#creating-a-custom-theme">creating a custom theme</a> for more info.
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

If you run into issues while setting up your Bryntum Scheduler Pro component, refer to our
[troubleshooting guide for Bryntum Scheduler Pro with Angular](#SchedulerPro/guides/integration/angular/troubleshooting.md).

## What to do next?

### Advanced integration with Angular

Visit our [comprehensive Angular guide](#SchedulerPro/guides/integration/angular/guide.md) to learn more about integrating
Bryntum Scheduler Pro with Angular and customizing your application.

### Working with data in Bryntum Scheduler Pro

Bryntum components often use multiple data collections and entities. 

For a detailed explanation of how these elements 
interact, see our [guide to displaying data in Bryntum Scheduler Pro](#SchedulerPro/guides/data/displayingdata.md).



<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>