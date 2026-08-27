[//]: # "Links in this document only work when viewed in the documentation browser, surf to ./docs"

# Bryntum Scheduler Pro

## What is Bryntum Scheduler Pro?

The most advanced scheduler component built with vanilla JavaScript and TypeScript, Bryntum Scheduler Pro supercharges Bryntum
Scheduler with the powerful Bryntum Gantt scheduling engine to deliver an unparalleled experience.

Bryntum Scheduler Pro is the ideal choice for applications needing more than just effective visualization. Bryntum Scheduler Pro
supports:

- **Complex scheduling scenarios**, such as Gantt-like project scheduling with task dependencies
- **Resource-based planning systems**, enabling efficient allocation based on availability

Bryntum Scheduler Pro is well suited for **manufacturing execution system (MES)** applications designed for production
facility workflows.

An extension of [Bryntum Scheduler](https://bryntum.com/products/scheduler), **Bryntum Scheduler Pro** understands Gantt
project data, making the component capable of managing:

- **Dependencies:** Define relationships between tasks for accurate scheduling
- **Resources:** Allocate and track resources efficiently
- **Assignments:** Link resources to specific tasks for detailed planning
- **Calendars:** Manage working hours, holidays, and schedules

The easiest way to start using Bryntum Scheduler Pro is by installing it using npm.

Get up and running quickly with a step-by-step guide:

<div class="framework-logos">
<a href="#SchedulerPro/guides/quick-start/react.md"><img src="Core/logo/react.svg" alt="React"><span>React quick start</span></a>
<a href="#SchedulerPro/guides/quick-start/angular.md"><img src="Core/logo/angular.svg" alt="Angular"><span>Angular quick start</span></a>
<a href="#SchedulerPro/guides/quick-start/vue-3.md"><img src="Core/logo/vue.svg" alt="Vue"><span>Vue quick start</span></a>
<a href="#SchedulerPro/guides/quick-start/javascript.md"><img src="Core/logo/js.svg" alt="Vanilla JS"><span>Vanilla JS quick start</span></a>
<a href="#SchedulerPro/guides/quick-start/salesforce.md"><img src="Core/logo/salesforce.svg" alt="Salesforce"><span>Salesforce quick start</span></a>
</div>

### Use cases

Bryntum Scheduler Pro is an excellent choice for applications needing more than just a good visualisation, a few examples:

- Complex scheduling scenarios where tasks are dependent on other tasks (such as a Gantt project)
- Planning systems based on resource availability
- Manufacturing Execution System (MES) apps for production facilities

Bryntum Scheduler Pro is an extension of the [Scheduler](https://bryntum.com/products/scheduler) that can understand Gantt project data,
making the component capable of managing _dependencies_, _resources_, _assignments_ and _calendars_.

## Live demo

Explore Bryntum Scheduler Pro and test some of its features in the live demo.

<div class="external-example" data-file="SchedulerPro/guides/readme/intro.js"></div>

For a complete overview of Bryntum Scheduler Pro capabilities, explore the topic-specific guides in the menu, visit our [API documentation](#SchedulerPro/view/SchedulerPro), and browse [Bryntum Scheduler Pro examples](../examples/).

## Continuous evolution and improvement

Maintenance releases with bug fixes are released on average every two weeks, with minor releases every quarter. See
[the public change log](https://bryntum.com/products/schedulerpro/changelog/)

Keep up to date with developments on [our blog](https://bryntum.com/blog/)

## Integration

Bryntum Scheduler Pro is compatible with all modern browsers – including Chrome, Firefox, Safari, and the latest version of
Edge – regardless of your target technology.

Before integrating Bryntum Scheduler Pro with any framework, ensure that your environment meets the following version
requirements:

* [NodeJS](https://nodejs.org/en): `>= 20.0.0`
* [TypeScript](https://www.typescriptlang.org/): `>= 3.6.0`
* [Angular](https://angularjs.org/): `>= 9.0.0`
* [React](https://react.dev/): `>= 16.0.0`
* [Vue](https://vuejs.org/): `>= 3.0.0`
* [Vite](https://vite.dev/): `>= 4.0.0`
* [Webpack](https://webpack.js.org/): `>= 4.0.0`

Use Bryntum Scheduler Pro out of the box or integrate it with your framework of your choice and many third-party solutions.

- <a href="#SchedulerPro/guides/integration/react/guide.md">Using Bryntum Scheduler Pro with React
  <img style="height: 1em;width: 1em;margin-top:0;" src="Core/logo/react.svg" alt="React"></a>
- <a href="#SchedulerPro/guides/integration/angular/guide.md">Using Bryntum Scheduler Pro with Angular
  <img style="height: 1em;width: 1em;margin-top:0;" src="Core/logo/angular.svg" alt="Angular"></a>
- <a href="#SchedulerPro/guides/integration/vue/guide.md">Using Bryntum Scheduler Pro with Vue
  <img style="height: 1em;width: 1em;margin-top:0;" src="Core/logo/vue.svg" alt="Vue"></a>
- <a href="#SchedulerPro/guides/integration/salesforce/readme.md">Using Bryntum Scheduler Pro with Salesforce
  <img style="height: 1em;width: 1em;margin-top:0;" src="Core/logo/salesforce.svg" alt="Salesforce"></a>

- <a href="#SchedulerPro/guides/integration/nodejs.md">Node.JS
  <img style="height: 1em;width: 1em;margin-top:0;" src="Core/logo/nodejs.svg" alt="Node.js"></a> 

<div class="note">
If you have already downloaded Bryntum Scheduler Pro, you'll find framework examples in the <code>examples/frameworks</code>
folder. If you haven't downloaded Bryntum Scheduler Pro yet, you can get a free trial
<a href="https://bryntum.com/download/">here</a>.
You can get started using the <a href="#SchedulerPro/guides/npm/repository/public-repository-access.md">Bryntum trial npm packages</a>, which are public.
</div>

## How does it work?

Here's how Bryntum Scheduler Pro differs from [Bryntum Scheduler](https://bryntum.com/products/scheduler/examples/):

- Bryntum Scheduler Pro always uses an AssignmentStore to manage event assignments, whereas Scheduler uses an EventStore,
  ResourceStore, and **optionally** an AssignmentStore and a DependencyStore.
- Bryntum Scheduler Pro uses the same data model as Bryntum Gantt, allowing you to display a project alongside the Gantt chart
  for a comprehensive view.
- In Bryntum Scheduler Pro, adding a dependency between two tasks adjusts the scheduling of the successor task. Scheduler
  represents dependencies as visual elements only that do not impact scheduling.

Bryntum Scheduler Pro's advanced data model enables it to display additional project-related information, including:

- **Task completion progress bars** for clear visual representation of task statuses.
- **Timeline and Resource Histogram widgets** for efficient project planning and resource management.
- and more...

### Comprehensive project data management

Bryntum Scheduler Pro is one of a kind. Built on top of [ChronoGraph](https://github.com/bryntum/chronograph), an open-source
reactive computational engine developed by Bryntum, its scheduling engine matches Microsoft Project logic and supports
projects of any size.

<img src="SchedulerPro/chronograph.png" class="b-screenshot" alt="Scheduling engine">

The scheduling engine is self-contained and headless, designed to be compatible with a server-side Node.js environment.
As a built-in dependency, it needs no additional installation or configuration.

Read more about the Bryntum Scheduling Engine in the [API documentation](engine/).

### User interface and data visualization

The Bryntum Scheduler Pro user interface is based on Bryntum Scheduler, which itself is based on Bryntum Grid, and implemented
in plain JavaScript, allowing you to use many Scheduler and Grid features, too. For more information about Bryntum Grid
capabilities, see the [Bryntum Grid documentation](https://bryntum.com/products/grid/docs/).

A traditional Bryntum Scheduler Pro setup uses **frozen grid** columns on the left with the **Gantt timeline**, a specialized
grid, occupying the remaining available space. A horizontal scrollbar allows users to scroll the timeline. You can
connect additional grids to the Scheduler to enhance the user experience.

<img src="SchedulerPro/schedulerpro-layout.png" class="b-screenshot" alt="Bryntum Scheduler Pro layout">

[//]: # "do not change the title of the last section unless you adapt GA Tag tutorial_complete"

## Next steps

The best way to get started with SchedulerPro is by following one of our quick start guides, which provides step-by-step
instructions. Once you're familiar with the [basics](#guides-basics), continue with the in-depth tutorial to explore
advanced features. Choose your preferred technology below to begin:

<div class="framework-logos">
<a href="#SchedulerPro/guides/quick-start/react.md"><img src="Core/logo/react.svg" alt="React"><span>React</span></a>
<a href="#SchedulerPro/guides/quick-start/angular.md"><img src="Core/logo/angular.svg" alt="Angular"><span>Angular</span></a>
<a href="#SchedulerPro/guides/quick-start/vue-3.md"><img src="Core/logo/vue.svg" alt="Vue"><span>Vue</span></a>
<a href="#SchedulerPro/guides/quick-start/javascript.md"><img src="Core/logo/js.svg" alt="Vanilla JS"><span>Vanilla JS</span></a>
</div>

## Professional Services

Need help implementing or customizing Bryntum Scheduler Pro? Don’t hesitate to request support from our
[Professional Services team](https://bryntum.com/services/).

## Copyright and license

Copyright © 2009 - 2026, Bryntum

All rights reserved.

[License](https://bryntum.com/products/schedulerpro/license/)



<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>