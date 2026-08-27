

var _window$examples;
//The file should be included after examples.js from Scheduler
const proExamples = {
  'Use cases': {
    items: [{
      folder: 'maps',
      title: 'Map integration',
      description: 'This example shows how to integrate the Scheduler with a Mapbox GL JS API',
      version: 'Pro',
      since: '4.0',
      updated: '6.2.2'
    }, {
      folder: 'maps-tanstack',
      title: 'Map integration with TanStack',
      description: 'This demo demonstrates SchedulerPro integration with Mapbox GL JS for location-based task visualization and TanStack Table for rendering a custom sortable unplanned tasks grid with drag-and-drop scheduling functionality',
      version: 'Pro',
      since: '7.3.0'
    }, {
      folder: 'maps-ag-grid',
      title: 'AG Grid + Map integration',
      description: 'This example shows how to integrate the AG Grid with Scheduler and Mapbox GL JS API',
      version: 'Pro',
      since: '7.0.1'
    }, {
      folder: 'flight-dispatch',
      title: 'A custom styled flight dispatch UI',
      description: 'Shows a typical flight dispatch UI implemented with Scheduler Pro',
      version: 'Pro',
      since: '5.5.2',
      updated: '6.0.5'
    }, {
      folder: 'embedded-chart',
      title: 'Embed Chart component into each resource swimlane',
      description: 'Shows how to use a Chart widget as an extra layer inside each row',
      version: 'Pro',
      since: '4.3.0',
      updated: '7.3.1',
      thin: true
    }, {
      folder: 'skill-matching',
      title: 'Skill matching',
      description: 'Define skills for resources and annotate tasks with the skills required to perform the task',
      version: 'Pro',
      since: '6.0.0',
      updated: '7.2.2'
    }, {
      folder: 'table-booking',
      title: 'Restaurant scheduler',
      description: 'Manage table reservations at a restaurant using Scheduler Pro',
      version: 'Pro',
      since: '7.0'
    }, {
      folder: 'planned-vs-actual',
      title: 'Planned vs Actual demo',
      description: 'Toggle between showing planned dates and actual dates',
      version: 'Pro',
      since: '6.0.0'
    }, {
      folder: 'realtime-updates',
      title: 'Realtime updates',
      description: 'Shows changes made by other clients in real time',
      version: 'Pro',
      since: '6.1.8',
      updated: '6.3.0'
    }]
  },
  'Additional widgets': {
    items: [{
      folder: 'resourcehistogram',
      title: 'Resource histogram',
      description: 'Show a Scheduler Pro and a Resource Histogram visualizing resource allocation in sync',
      version: 'Pro',
      updated: '5.6.9'
    }, {
      folder: 'resourceutilization',
      title: 'Resource utilization',
      description: 'Show a Scheduler Pro and a Resource Utilization visualizing resource allocation in sync',
      version: 'Pro',
      since: '5.0',
      updated: '5.6.9'
    }, {
      folder: 'timeline',
      title: 'Scheduler Pro with Timeline widget',
      description: 'Scheduler Pro with Timeline widget',
      version: 'Pro',
      since: '4.0'
    }]
  },
  AI: {
    items: [{
      folder: 'ai-skillmatching',
      title: 'AI-powered Skill matching',
      description: 'Demonstrates the Bryntum AI Assistant integrated into the Scheduler Pro',
      since: '7.2',
      updated: '7.2.2'
    }]
  },
  Features: {
    items: [{
      folder: 'infinite-scroll-crudmanager',
      title: 'Infinite scroll and CrudManager',
      description: 'Shows a SchedulerPro with both infinite timeline scroll and infinite resource scroll, managed by the CrudManager. The backend is made in PHP',
      version: 'Pro',
      since: '6.0.0',
      updated: '6.2.3'
    }, {
      folder: 'nested-events',
      title: 'Nested events with drag-n-drop support',
      description: 'Uses the NestedEvents feature to display nested events with drag-n-drop support',
      version: 'Pro',
      since: '4.0',
      updated: '7.3.0'
    }, {
      folder: 'nested-events-configuration',
      title: 'Nested events configuration options',
      description: 'A more advanced demo using nested events, letting you try out different configuration options for the feature',
      version: 'Pro',
      since: '5.1',
      updated: '7.3.4'
    }, {
      folder: 'nested-events-lazy-load',
      title: 'Lazy loaded nested events',
      description: 'This demo demonstrates nested events using a lazy loaded project',
      version: 'Pro',
      since: '6.1.6'
    }, {
      folder: 'split-events',
      title: 'Split events with drag-n-drop support',
      description: 'Shows the events split to segments that can be dragged and resized individually',
      version: 'Pro',
      since: '5.2',
      updated: '5.6.7'
    }, {
      folder: 'conflicts',
      title: 'Scheduling conflict resolution popup',
      description: 'Shows the conflict resolution popup in action',
      version: 'Pro',
      since: '4.3.0'
    }, {
      folder: 'constraints',
      title: 'Constraints that affect scheduling',
      description: 'Using constraints on events to affect their scheduling',
      version: 'Pro'
    }, {
      folder: 'effort',
      title: 'Provided effort value distributed across duration',
      description: 'Show events that distribute their effort across their duration. Scheduler Pro and a Resource Utilization visualize effort allocation in sync',
      version: 'Pro',
      since: '5.3.0'
    }, {
      folder: 'dependencies',
      title: 'Dependencies affecting scheduling',
      description: 'Shows a basic Scheduler Pro setup with dependencies affecting scheduling',
      version: 'Pro',
      updated: '6.2.4'
    }, {
      folder: 'nested-events-dependencies',
      title: 'Dependencies between nested events',
      description: 'Shows using dependencies between nested events, that affects the scheduling',
      version: 'Pro',
      since: '5.6.0'
    }, {
      folder: 'grouping',
      title: 'Group resources by any field',
      description: 'Shows a Scheduler Pro with resources / machines grouped separately but assigned to same tasks',
      version: 'Pro'
    }, {
      folder: 'non-working-time',
      title: 'Visualize and filter out non-working time',
      description: 'Shows a Scheduler Pro setup with a working hours calendar and time axis filtering',
      version: 'Pro',
      updated: '5.0'
    }, {
      folder: 'percent-done',
      title: 'Event progress using percent done',
      description: 'Scheduler Pro using the percentBar feature to visualize percentDone',
      version: 'Pro'
    }, {
      folder: 'event-non-working-time',
      title: 'Using and visualizing event calendars',
      description: 'Shows Scheduler Pro using and visualizing per event calendars',
      version: 'Pro',
      since: '5.2.0'
    }, {
      folder: 'recurrence',
      title: 'Recurring events',
      description: 'Shows a Scheduler Pro with recurring events',
      version: 'Pro',
      since: '5.3.0'
    }, {
      folder: 'calendar-editor',
      title: 'Using calendar editor',
      description: 'Shows Calendar editor allowing to modify resource working hours',
      version: 'Pro',
      since: '6.0.2'
    }, {
      folder: 'resource-non-working-time',
      title: 'Using resource calendars',
      description: 'Shows a Scheduler Pro setup with a working hour calendars per resource',
      version: 'Pro',
      updated: '5.3.3'
    }, {
      folder: 'weekends',
      title: 'Showing and respecting weekends',
      description: 'Shows a Scheduler Pro with a weekend calendar, visualized in the UI and respected when scheduling',
      version: 'Pro'
    }, {
      folder: 'timezone',
      title: 'Time zone support',
      description: 'Shows how time zone support can be implemented',
      version: 'Pro',
      since: '5.3.0',
      updated: '5.6.11'
    }, {
      folder: 'travel-time',
      title: 'Travel time',
      description: 'This demo shows how to visualize travel time before/after an event',
      version: 'Pro',
      since: '5.0.0',
      updated: '5.5.5'
    }, {
      folder: 'tree-summary-heatmap',
      title: 'Tree summary heatmap',
      description: 'This demo shows how to summarize the number of events per date and group with a heat map',
      version: 'Pro',
      since: '6.2.0',
      updated: '6.2.1'
    }]
  },
  Customization: {
    items: [{
      folder: 'custom-layouts',
      title: 'Grouping events',
      description: 'Grouping events inside the resource row',
      version: 'Pro',
      since: '4.3.0'
    }, {
      folder: 'localization',
      title: 'Localization',
      description: 'Shows how to preload a specific locale and localize the application',
      version: 'Pro',
      since: '5.3.0',
      updated: '6.1.8'
    }, {
      folder: 'taskeditor',
      title: 'Task editor customization',
      description: 'Scheduler Pro with task editor customizations',
      version: 'Pro',
      updated: '5.0'
    }]
  },
  Highlighting: {
    items: [{
      folder: 'highlight-event-calendars',
      title: 'Highlight task calendars',
      description: 'Help end users understand the scheduling logic by visualizing event calendars',
      version: 'Pro',
      since: '5.0',
      updated: '6.0.5'
    }, {
      folder: 'highlight-resource-calendars',
      title: 'Highlight resource calendars',
      description: 'Help end users understand the scheduling logic by visualizing resource calendars',
      version: 'Pro',
      since: '5.0',
      updated: '6.0.5'
    }, {
      folder: 'highlight-time-spans',
      title: 'Highlight time spans',
      description: 'Help end users understand the scheduling rules by visualizing the event scheduling boundaries',
      version: 'Pro',
      since: '5.0',
      updated: '6.0.5'
    }]
  },
  'Drag drop': {
    items: [{
      folder: 'drag-from-grid',
      title: 'Drag tasks from a grid',
      description: 'Drag tasks from a list onto Scheduler to schedule them or onto other tasks connect them with dependencies ',
      version: 'Pro',
      updated: '5.4.0'
    }, {
      folder: 'drag-unplanned-tasks',
      title: 'Drag unplanned tasks from a grid',
      description: 'Drag unplanned tasks from a list onto the Scheduler component',
      version: 'Pro',
      since: '5.0',
      updated: '7.0.1'
    }, {
      folder: 'drag-batches',
      title: 'Drag orders to schedule batches of tasks',
      description: 'Create orders and drag onto the Scheduler to schedule',
      version: 'Pro',
      since: '4.0.8',
      updated: '6.0.5'
    }, {
      folder: 'nested-events-drag-from-grid',
      title: 'Drag events from a grid to nest them in a parent event',
      description: 'A more advanced demo using nested events, letting you drag and drop events from a grid to assign to a parent event',
      version: 'Pro',
      since: '5.1',
      updated: '6.2.0'
    }]
  },
  Misc: {
    items: [{
      folder: 'bigdataset',
      title: 'Big data set (pro-version)',
      description: 'Demonstrates Scheduler Pro using a big project',
      version: 'Pro',
      updated: '4.3.1'
    }, {
      folder: 'inline-data',
      title: 'Using inline data',
      description: 'Shows using inline data for Scheduler Pro',
      version: 'Pro',
      since: '5.0.3',
      updated: '5.6.7'
    }, {
      folder: 'nested-events-deep',
      title: 'Deeper nesting of events',
      description: 'A demo that shows how to handle two levels of nesting of events',
      version: 'Pro',
      since: '5.4.0',
      updated: '7.3.0'
    }, {
      folder: 'kitchen-sink',
      title: 'Kitchen sink',
      description: 'Comprehensive showcase of all the widgets included in the Bryntum package. Browse through text fields, date pickers, buttons, layouts, and more',
      since: '7.1',
      thin: true
    }]
  },
  Integration: {
    items: [{
      folder: 'extjsmodern',
      title: 'ExtJS Modern App integration',
      description: 'Example of a Bryntum Scheduler Pro embedded in an ExtJS Modern application. Read more about ExtJS here: <a href="https://www.sencha.com/products/extjs" style="color: white; font-weight: bold">https://www.sencha.com</a>',
      version: 'ExtJS 7.2.0',
      overlay: 'extjs',
      since: '4.0'
    }, {
      folder: 'salesforce',
      title: 'Integrate with Salesforce Lightning',
      description: 'This demo shows how to embed Bryntum Scheduler Pro into the Lightning Web Component to use in your salesforce org',
      globalUrl: 'https://bryntum-dev-ed.develop.my.site.com/demo/schedulerpro',
      overlay: 'salesforce',
      since: '4.0',
      updated: '6.3.3'
    }, {
      folder: 'webcomponents',
      title: 'Use as web component',
      description: 'This example shows how to use the Custom elements version of the Scheduler Pro',
      version: 'Pro'
    }, {
      folder: 'frameworks/webpack/basic',
      title: 'Custom build using WebPack',
      description: 'This very basic demo shows how to use SchedulerProBase and webpack to do a custom build from our sources',
      version: 'WebPack 5',
      overlay: 'webpack',
      offline: true,
      since: '2.3',
      updated: '6.1.4'
    }, {
      folder: 'frameworks/webpack/basic-thin',
      title: 'Custom thin build using WebPack',
      description: 'This very basic demo shows how to use SchedulerProBase and webpack to do a custom build from our thin packages',
      version: 'WebPack 5',
      overlay: 'webpack',
      since: '6.1.4',
      thin: true
    }]
  },
  Angular: {
    overlay: 'angular',
    tab: 'angular',
    build: true,
    items: [{
      folder: 'frameworks/angular/angular-11',
      title: 'Inline data for Angular View Engine',
      description: 'Shows how to bind inline data to the Angular Scheduler Pro component',
      version: 'Angular 13 + TypeScript 4',
      since: '5.3.3',
      updated: '7.3.0'
    }, {
      folder: 'frameworks/angular/conflicts',
      title: 'Scheduling conflict resolution popup',
      description: 'Shows the conflict resolution popup in action',
      version: 'Angular 13 + TypeScript 4',
      since: '5.1',
      updated: '7.3.0'
    }, {
      folder: 'frameworks/angular/basic-thin',
      title: 'Basic thin setup',
      description: 'This example shows basic thin setup of the Bryntum Scheduler Pro',
      version: 'Angular 19 + TypeScript 5',
      since: '6.1.4',
      updated: '7.3.0',
      thin: true
    }, {
      folder: 'frameworks/angular/drag-unplanned-tasks',
      title: 'Drag unplanned tasks',
      description: 'Drag unplanned tasks from a list onto the Scheduler component',
      version: 'Angular 16 + TypeScript 5',
      since: '5.5.0',
      updated: '7.3.0'
    }, {
      folder: 'frameworks/angular/flight-dispatch',
      title: 'Flight dispatch',
      description: 'Shows a typical flight dispatch UI implemented with Scheduler Pro',
      version: 'Angular 19 + TypeScript 5',
      since: '7.0.0',
      updated: '7.3.0'
    }, {
      folder: 'frameworks/angular/highlight-event-calendars',
      title: 'Highlight task calendars',
      description: 'Help end users understand the scheduling logic by visualizing event calendars',
      version: 'Angular 19 + TypeScript 5',
      since: '5.6.9',
      updated: '7.3.0'
    }, {
      folder: 'frameworks/angular/highlight-resource-calendars',
      title: 'Highlight resource calendars',
      description: 'Help end users understand the scheduling logic by visualizing resource calendars',
      version: 'Angular 19 + TypeScript 5',
      since: '5.6.9',
      updated: '7.3.0'
    }, {
      folder: 'frameworks/angular/inline-data',
      title: 'Inline data',
      description: 'This demo shows using inline data for Scheduler Pro',
      version: 'Angular 19 + TypeScript 5',
      since: '5.6.9',
      updated: '7.3.0'
    }, {
      folder: 'frameworks/angular/maps',
      title: 'Map integration',
      description: 'This example shows how to integrate the Scheduler with a Mapbox GL JS API in Angular',
      version: 'Angular 19 + TypeScript 5',
      since: '6.1.8',
      updated: '7.3.0'
    }, {
      folder: 'frameworks/angular/nested-events-configuration',
      title: 'Nested events configuration options',
      description: 'A more advanced demo using nested events, letting you try out different configuration options for the feature',
      version: 'Angular 15 + TypeScript 4',
      since: '5.3.0',
      updated: '7.3.0'
    }, {
      folder: 'frameworks/angular/nested-events-lazy-load',
      title: 'Lazy loaded nested events',
      description: 'This demo demonstrates nested events using lazy loaded stores',
      version: 'Angular 21 + TypeScript 5',
      since: '7.1.2',
      updated: '7.3.0'
    }, {
      folder: 'frameworks/angular/non-working-time',
      title: 'Non-working time',
      description: 'Shows a Scheduler Pro setup with a working hours calendar and time axis filtering',
      version: 'Angular 13 + TypeScript 4',
      since: '5.1',
      updated: '7.3.0'
    }, {
      folder: 'frameworks/angular/resource-histogram',
      title: 'Resource histogram',
      description: 'This demo shows how to use Resource Histogram which is part of Angular Scheduler Pro',
      version: 'Angular 13 + TypeScript 4',
      updated: '7.3.0'
    }, {
      folder: 'frameworks/angular/resource-utilization',
      title: 'Resource utilization',
      description: 'Show a Scheduler Pro and a Resource Utilization visualizing resource allocation in sync',
      version: 'Angular 16 + TypeScript 4',
      since: '5.6.3',
      updated: '7.3.0'
    }, {
      folder: 'frameworks/angular/taskeditor',
      title: 'Task editor customization',
      description: 'Scheduler Pro with task editor customizations',
      version: 'Angular 15 + TypeScript 4',
      since: '5.3.4',
      updated: '7.3.0'
    }, {
      folder: 'frameworks/angular/timezone',
      title: 'Time zone support',
      description: 'Shows how time zone support can be implemented',
      version: 'Angular 13 + TypeScript 4',
      since: '5.3.0',
      updated: '7.3.0'
    }, {
      folder: 'frameworks/angular/travel-time',
      title: 'Travel time',
      description: 'This demo shows how to visualize travel time before/after an event',
      version: 'Angular 19 + TypeScript 5',
      since: '5.6.9',
      updated: '7.3.0'
    }]
  },
  'React + Vite': {
    overlay: 'react',
    tab: 'react',
    build: true,
    items: [{
      folder: 'frameworks/react-vite/basic-thin',
      title: 'Basic thin setup',
      description: 'This example shows basic thin setup of the Bryntum Scheduler Pro',
      version: 'React 18 + Vite 5 + TypeScript 5',
      since: '6.1.4',
      updated: '7.2.2',
      thin: true
    }, {
      folder: 'frameworks/react-vite/drag-batches',
      title: 'Scheduling orders',
      description: 'This is an advanced demo showing creation of orders from a template. When you drag an order onto the schedule, its template tasks are added',
      version: 'React 18 + Vite 5 + TypeScript 5',
      since: '4.2.3',
      updated: '6.2.1'
    }, {
      folder: 'frameworks/react-vite/drag-unplanned-tasks',
      title: 'Drag unplanned tasks',
      description: 'Drag unplanned tasks from a list onto the Scheduler component',
      version: 'React 18 + Vite 4 + TypeScript 5',
      since: '5.5.0',
      updated: '5.6.0'
    }, {
      folder: 'frameworks/react-vite/effort',
      title: 'Pro Event effort',
      description: 'Show events that distribute their effort across their duration. Scheduler Pro and a Resource Utilization visualize effort allocation in sync',
      version: 'React 19 + Vite 7 + TypeScript 5',
      since: '5.6.1',
      updated: '6.3.2'
    }, {
      folder: 'frameworks/react-vite/highlight-event-calendars',
      title: 'Highlight event calendars',
      description: 'Help end users understand the scheduling logic by visualizing event calendars',
      version: 'React 18 + Vite 5 + TypeScript 5',
      since: '5.6.9',
      updated: '6.0.5'
    }, {
      folder: 'frameworks/react-vite/highlight-resource-calendars',
      title: 'Highlight resource calendars',
      description: 'Help end users understand the scheduling logic by visualizing resource calendars',
      version: 'React 18 + Vite 5 + TypeScript 5',
      since: '5.6.9',
      updated: '6.0.5'
    }, {
      folder: 'frameworks/react-vite/highlight-time-spans',
      title: 'Highlighting time spans',
      description: 'Help end users understand the scheduling rules by visualizing the event scheduling boundaries',
      version: 'React 18 + Vite 5 + TypeScript 5',
      since: '5.3.2',
      updated: '6.1.6'
    }, {
      folder: 'frameworks/react-vite/inline-data',
      title: 'Inline data',
      description: 'This demo shows using inline data for Scheduler Pro',
      version: 'React 18 + Vite 5 + TypeScript 5',
      since: '6.0.0',
      updated: '6.2.1'
    }, {
      folder: 'frameworks/react-vite/maps',
      title: 'Map integration',
      description: 'This example shows how to integrate the Scheduler with a Mapbox GL JS API in React',
      version: 'React 19 + Vite 5 + TypeScript 5',
      since: '6.2.2'
    }, {
      folder: 'frameworks/react-vite/infinite-scroll-crudmanager',
      title: 'Infinite scroll and CrudManager',
      description: 'Shows a SchedulerPro with both infinite timeline scroll and infinite resource scroll, managed by the CrudManager. The backend is made in PHP',
      version: 'React 18 + Vite 4 + TypeScript 4',
      since: '6.0.0'
    }, {
      folder: 'frameworks/react-vite/nested-events-lazy-load',
      title: 'Lazy loaded nested events',
      description: 'This demo demonstrates nested events using a lazy loaded project',
      version: 'React 19 + Vite 5 + TypeScript 5',
      since: '6.1.6',
      updated: '6.2.3'
    }, {
      folder: 'frameworks/react-vite/non-working-time',
      title: 'Non-working time',
      description: 'Shows a Scheduler Pro setup with a working hours calendar and time axis filtering',
      version: 'React 18 + Vite 5 + TypeScript 5',
      since: '6.2.5'
    }, {
      folder: 'frameworks/react-vite/split-events',
      title: 'Split events demo',
      description: 'Shows the events split to segments that can be dragged and resized individually',
      version: 'React 19 + Vite 7 + TypeScript 5',
      since: '6.3.1'
    }, {
      folder: 'frameworks/react-vite/taskeditor',
      title: 'Task editor customization',
      description: 'Scheduler Pro with task editor customizations',
      version: 'React 18 + Vite 4 + TypeScript 4',
      since: '5.3.4'
    }, {
      folder: 'frameworks/react-vite/tree-lazy-load',
      title: 'Lazy loading of a tree project',
      description: 'This demo demonstrates lazy loaded resource and event stores using the requestData function with PHP backend',
      version: 'React 18 + Vite 5 + TypeScript 5',
      since: '6.2.1',
      updated: '6.3.2'
    }, {
      folder: 'frameworks/react-vite/travel-time',
      title: 'Travel time',
      description: 'This demo shows how to visualize travel time before/after an event',
      version: 'React 18 + Vite 5 + TypeScript 5',
      since: '5.6.12'
    }]
  },
  React: {
    overlay: 'react',
    tab: 'react',
    build: true,
    items: [{
      folder: 'frameworks/react/javascript/resource-histogram',
      title: 'Resource histogram',
      description: 'This demo shows how to use Resource Histogram in React',
      version: 'React 16'
    }, {
      folder: 'frameworks/react/javascript/conflicts',
      title: 'Scheduling conflict resolution popup',
      description: 'Shows the conflict resolution popup in action',
      version: 'React 18',
      since: '5.1'
    }, {
      folder: 'frameworks/react/javascript/timeline',
      title: 'Timeline',
      description: 'A demo showing the Scheduler Pro component with Timeline widget inside a simple React app',
      version: 'React 17',
      since: '4.1'
    }, {
      folder: 'frameworks/react/typescript/basic',
      title: 'Basic setup with TypeScript',
      description: 'This demo contains the React SchedulerPro wrapper and the demo is written in TypeScript',
      version: 'React 17 + TypeScript 3',
      since: '5.0.3'
    }, {
      folder: 'frameworks/react/typescript/sharepoint-fabric',
      title: 'SharePoint Workbench with TypeScript',
      description: 'This demo includes a SPFx web part that uses TypeScript and React',
      version: 'React 17 + TypeScript 4',
      offline: true,
      since: '5.6.0',
      updated: '6.0.2',
      thin: true
    }, {
      folder: 'frameworks/react/typescript/sharepoint-fabric-drag-from-grid',
      title: 'SharePoint Workbench Drag from Grid with TypeScript',
      description: 'This demo includes a SPFx web part that uses TypeScript and React',
      version: 'React 17 + TypeScript 4',
      offline: true,
      since: '6.2.3',
      thin: true
    }]
  },
  'React + Remix': {
    overlay: 'react',
    tab: 'react',
    build: true,
    items: [{
      folder: 'frameworks/react-remix/basic',
      title: 'Basic setup',
      description: 'This demo contains the React Gantt chart wrapper and the demo is written in Remix using Typescript',
      version: 'React 18 + Remix 2 + Vite 5 + TypeScript 5',
      offline: true,
      since: '6.0.0'
    }]
  },
  'Vue 3 + Vite': {
    overlay: 'vue',
    tab: 'vue',
    build: true,
    items: [{
      folder: 'frameworks/vue-3-vite/basic',
      title: 'Basic setup',
      description: 'This example shows basic setup of the Bryntum Scheduler Pro',
      version: 'Vue 3 + Vite 5 + TypeScript 5',
      since: '6.1.2'
    }, {
      folder: 'frameworks/vue-3-vite/basic-thin',
      title: 'Basic thin setup',
      description: 'This example shows basic thin setup of the Bryntum Scheduler Pro',
      version: 'Vue 3 + Vite 5 + TypeScript 5',
      since: '6.1.4',
      thin: true
    }, {
      folder: 'frameworks/vue-3-vite/drag-unplanned-tasks',
      title: 'Drag unplanned tasks',
      description: 'Drag unplanned tasks from a list onto the Scheduler component',
      version: 'Vue 3 + Vite 4 + TypeScript 4',
      since: '5.5.3',
      updated: '5.6.0'
    }, {
      folder: 'frameworks/vue-3-vite/highlight-event-calendars',
      title: 'Highlight event calendars',
      description: 'Help end users understand the scheduling logic by visualizing event calendars',
      version: 'Vue 3 + Vite 5 + TypeScript 4',
      since: '5.6.9',
      updated: '6.0.5'
    }, {
      folder: 'frameworks/vue-3-vite/highlight-resource-calendars',
      title: 'Highlight resource calendars',
      description: 'Help end users understand the scheduling logic by visualizing resource calendars',
      version: 'Vue 3 + Vite 5 + TypeScript 4',
      since: '5.6.9',
      updated: '6.0.5'
    }, {
      folder: 'frameworks/vue-3-vite/inline-data',
      title: 'Inline data',
      description: 'This demo shows using inline data for Scheduler Pro',
      version: 'Vue 3 + Vite 5 + TypeScript 4',
      since: '6.0.0'
    }, {
      folder: 'frameworks/vue-3-vite/maps',
      title: 'Map integration',
      description: 'This example shows how to integrate the Scheduler with a Mapbox GL JS API in Vue 3',
      version: 'Vue 3 + Vite 5 + TypeScript 5',
      since: '6.2.2'
    }, {
      folder: 'frameworks/vue-3-vite/non-working-time',
      title: 'Non-working time',
      description: 'Shows a Scheduler Pro setup with a working hours calendar and time axis filtering',
      version: 'Vue 3 + Vite 5 + TypeScript 4',
      since: '6.2.5'
    }, {
      folder: 'frameworks/vue-3-vite/taskeditor',
      title: 'Task editor customization',
      description: 'Scheduler Pro with task editor customizations',
      version: 'Vue 3 + Vite 4 + TypeScript 4',
      since: '5.3.4'
    }, {
      folder: 'frameworks/vue-3-vite/travel-time',
      title: 'Travel time',
      description: 'This demo shows how to visualize travel time before/after an event',
      version: 'Vue 3 + Vite 5 + TypeScript 4',
      since: '5.6.12',
      updated: '6.1.2'
    }]
  },
  'Vue 3': {
    overlay: 'vue',
    tab: 'vue',
    build: true,
    items: [{
      folder: 'frameworks/vue-3/javascript/conflicts',
      title: 'Scheduling conflict resolution popup',
      description: 'Shows the conflict resolution popup in action',
      version: 'Vue 3',
      since: '5.1',
      updated: '5.3.0'
    }, {
      folder: 'frameworks/vue-3/javascript/resource-histogram',
      title: 'Resource histogram',
      description: 'The example shows how to configure the Scheduler Pro to be partnered with the Resource Histogram in Vue 3',
      version: 'Vue 3',
      since: '4.1',
      updated: '5.3.0'
    }]
  },
  'Vue 2': {
    overlay: 'vue',
    tab: 'vue',
    build: true,
    items: [{
      folder: 'frameworks/vue/javascript/vue-renderer',
      title: 'Cell renderer',
      description: 'Bryntum Scheduler Pro lets you render Vue components into grid cells which makes it easy to reuse your existing Vue components',
      version: 'Vue 2',
      since: '4.1.0'
    }, {
      folder: 'frameworks/vue/javascript/resource-histogram',
      title: 'Resource histogram',
      description: 'The example shows how to configure the Vue Scheduler Pro partnered with the Resource Histogram',
      version: 'Vue 2',
      updated: '5.3.0'
    }]
  }
};

// Update Scheduler examples
(_window$examples = window.examples) === null || _window$examples === undefined || _window$examples.forEach(e => {
  e.rootFolder = '../examples-scheduler/';
  e.group = e.group + ' (Basic Scheduler)';
});

// Flatten examples tree and merge
const exclude = ['extjsclassic', 'extjsmodern', 'localization', 'salesforce'];
window.examples = Object.entries(proExamples).flatMap(([group, parent]) => parent.items.map(item => Object.assign(item, parent, {
  group,
  items: undefined
}))).concat(window.examples.filter(ex => !exclude.includes(ex.folder)));