const examples = {

    'Power demos' : {
        items : [
            {
                folder      : 'backlog',
                title       : 'Locking backlog events at the top of the view',
                description : 'Demonstrates showing a set of resources locked at the top of the Scheduler',
                since       : '6.0.0',
                group       : 'Power demos'
            },
            {
                folder      : 'bigdataset',
                title       : 'Big data set',
                description : 'Demonstrates that the scheduler performs well even with many many rows',
                updated     : '5.2.5'
            },
            {
                folder      : 'bigdataset-tree',
                title       : 'Big data set tree',
                description : 'Demonstrates that the scheduler performs well even with a large hierarchical data set',
                since       : '4.3.1'
            },
            {
                folder      : 'bigdataset-vertical',
                title       : 'Big data set vertical',
                description : 'Demonstrates that the vertical scheduler performs well even with many many rows',
                since       : '2.2',
                updated     : '6.1.6'
            },
            {
                folder      : 'booking',
                title       : 'Property booking',
                description : 'This example shows a demo booking application, using ResourceTimeRanges and the summary feature',
                since       : '5.2.0',
                updated     : '6.0.5'
            },
            {
                folder      : 'infinite-scroll',
                title       : 'Infinite scroll',
                description : 'Shows a Scheduler with both infinite timeline scroll as well as infinite resource scroll. The backend is made in PHP',
                since       : '6.0.0'
            },
            {
                folder      : 'infinite-scroll-tree',
                title       : 'Infinite scroll tree',
                description : 'Shows a Scheduler with hierarchical resource data and both infinite timeline scroll as well as infinite resource scroll. The backend is made in PHP',
                since       : '6.2.4'
            },
            {
                folder      : 'nestedevents',
                title       : 'Nested events',
                description : 'Shows a more advanced use of eventRenderer to render "nested events"',
                updated     : '6.0'
            },
            {
                folder      : 'paged',
                title       : 'Paged Scheduler',
                description : 'This example demonstrates that the Scheduler can access large data sets page by page',
                since       : '6.1.0'
            },
            {
                folder      : 'partners',
                title       : 'Partnered Schedulers',
                description : 'Dual timelines in sync',
                updated     : '2.3'
            },
            {
                folder      : 'stress',
                title       : 'Stress test',
                description : 'This demo lets you test the scheduler when external edits are received, to simulate a real world app with web sockets',
                since       : '4.1'
            },
            {
                folder      : 'tasks',
                title       : 'Tasks application',
                description : 'An application demo with lots of custom rendering'
            },
            {
                folder      : 'timeaxis',
                title       : 'Non-continuous time axis',
                description : 'Shows how you can customize the TimeAxis class, which is used to generate the date ticks in the timeline header',
                since       : '2.0',
                updated     : '5.3.3'
            },
            {
                folder      : 'timelinehistogram',
                title       : 'Rows with histograms',
                description : 'Shows a timeline histogram',
                since       : '5.4.0'
            },
            {
                folder      : 'websockets',
                title       : 'WebSockets online',
                description : "A demo that comes with a WebSocket server for multi-user realtime' interaction with the Schedule, see README.md for details on how to get it started",
                build       : true,
                since       : '2.0'
            }
        ]
    },

    'Drag & drop' : {
        items : [
            {
                folder      : 'drag-between-schedulers',
                title       : 'Drag drop tasks between different Scheduler instances',
                description : 'You can drag drop tasks between different scheduler instances on the page',
                updated     : '5.4'
            },
            {
                folder      : 'dragfromgrid',
                title       : 'Drag drop from a grid',
                description : 'This example shows how easy it is to drag tasks from a separate list or grid onto the schedule',
                updated     : '4.2.0'
            },
            {
                folder      : 'drag-from-grid-custom',
                title       : 'Customized drag drop from a grid',
                description : 'This example shows how easy it is to drag tasks from a separate list or grid onto the schedule',
                since       : '5.4.0'
            },
            {
                folder      : 'drag-from-grid-to-tree',
                title       : 'Drag drop from a grid to a tree',
                description : 'This example shows how to drag tasks from a grid onto a tree schedule',
                since       : '5.3.5',
                updated     : '7.2.0'
            },
            {
                folder      : 'drag-from-list',
                title       : 'Drag drop objects from a list',
                description : 'This example shows how to drag items from a list and drop them onto a task to update some aspect of it',
                since       : '5.0'
            },
            {
                folder      : 'drag-from-tree',
                title       : 'Drag drop from a tree',
                description : 'This example shows how easy it is to drag tasks from a tree grid onto the schedule',
                since       : '5.0',
                updated     : '6.2.3'
            },
            {
                folder      : 'drag-onto-tasks',
                title       : 'Drag drop objects onto tasks',
                description : 'This example shows how to drag any DOM node and drop it onto a task to update some aspect of it',
                updated     : '5.6.3'
            },
            {
                folder      : 'drag-outside',
                title       : 'Drag events out of the scheduler',
                description : 'This example shows how to drag events to an element outside the scheduler',
                since       : '5.0'
            }
        ]
    },

    Charts : {
        items : [
            {
                folder      : 'charts',
                title       : 'Chart designer',
                description : 'Shows how to use a chart designer widget to configure and display a chart from Scheduler data',
                since       : '6.3.0',
                thin        : true
            },
            {
                folder      : 'sparklines',
                title       : 'Sparklines',
                description : 'This example shows how the SparklineColumn can display sparkline charts inline in a Scheduler row',
                since       : '6.3.0',
                thin        : true
            },
            {
                folder      : 'scheduler-chart',
                title       : 'Scheduler with chart',
                description : 'This example shows a Chart side by side with a Scheduler',
                since       : '6.3.0',
                thin        : true
            }
        ]
    },

    Basics : {
        items : [
            {
                folder      : 'basic',
                title       : 'Basic',
                description : 'Shows a very basic scheduler setup'
            },
            {
                folder      : 'configuration',
                title       : 'Configuration',
                description : 'Built-in and custom made view presets along with zooming feature',
                updated     : '5.2.0'
            },
            {
                folder      : 'zooming',
                title       : 'Zooming',
                description : 'Demonstrates smooth zooming with zoom controls, TimeZoomSlider, and a large dataset',
                since       : '7.3.0'
            },
            {
                folder      : 'columns',
                title       : 'Columns',
                description : 'Displays columns of different types on left and right sides of the schedule',
                since       : '2.0',
                updated     : '5.6.7'
            },
            {
                folder      : 'rowheight',
                title       : 'Row height',
                description : 'Allows adjusting row height and bar margin using sliders to get immediate feedback on the effect of those settings. Also shows the StickyCells feature',
                updated     : '7.3.0'
            },
            {
                folder      : 'scrollto',
                title       : 'Scrolling',
                description : "Here's an example of locating elements in the grid programmatically. You can scroll to a point in time, and you can also scroll to a certain event in the eventStore"
            },
            {
                folder      : 'timeresolution',
                title       : 'Time resolution',
                description : '<p>The scheduler has support for snapping to the set time resolution. In the view below, you can snap in any increment between 5-60 minutes. </p><p>Note how drag, resize and create operations are affected by having Snap checked or not.</p>',
                updated     : '6.0.5'
            },
            {
                folder      : 'state',
                title       : 'Saving UI state',
                description : 'This example demonstrates auto state handling for the Scheduler. It allows the user to store state in localStorage and restore it across page reloads',
                since       : '5.3.3'
            }
        ]
    },

    'Event layout & styling' : {
        items : [
            {
                folder      : 'animations',
                title       : 'Animations',
                description : 'The Scheduler will animate any changes to your rendered Events by default'
            },
            {
                folder      : 'customeventstyling',
                title       : 'Custom event styling',
                description : 'Custom rendering of events using the <code>eventRenderer()</code> function',
                updated     : '4.3.4'
            },
            {
                folder      : 'rough',
                title       : 'Custom styling with Rough.js',
                description : 'Uses the Rough.js library to draw sketchy events',
                since       : '2.0'
            },
            {
                folder      : 'custom-theme',
                title       : 'Custom theme',
                description : 'This demo has a custom theme, to showcase how you can create your own. Check the resources/ folder to see how it is done',
                updated     : '6.1.3'
            },
            {
                folder      : 'layouts',
                title       : 'Event layouts',
                description : 'The Scheduler can layout events in 3 different ways: `stack` (the default), `pack` or `none` (overlapping). Order of overlapping events is configurable',
                updated     : '6.3.2'
            },
            {
                folder      : 'eventstyles',
                title       : 'Event styles',
                description : 'Shows how using eventStyle and eventColor affects appearance',
                updated     : '7.1.2'
            },
            {
                folder      : 'milestonelayout',
                title       : 'Milestone layout',
                description : 'Shows the different options available to make milestones part of the event layout',
                updated     : '6.0.0'
            },
            {
                folder      : 'icons',
                title       : 'Milestone icons',
                description : 'You can render not only event bars, but also icons representing a milestone',
                updated     : '5.6.2'
            }
        ]
    },

    Features : {
        items : [
            {
                folder      : 'collapsible-columns',
                title       : 'Collapsible columns',
                description : 'A Scheduler with collapsible grouped columns in its grid section',
                since       : '5.2.0',
                updated     : '7.0.0'
            },
            {
                folder      : 'dragselection',
                title       : 'Drag drop selection mode',
                description : 'Click and drag to select multiple events easily',
                since       : '2.0',
                updated     : '6.2.5'
            },
            {
                folder      : 'dependencies',
                title       : 'Dependencies',
                description : 'This example shows how you can have dependencies visualized between tasks by loading data using the CrudManager',
                updated     : '6.2.5'
            },
            {
                folder      : 'vertical-dependencies',
                title       : 'Dependencies in vertical mode',
                description : 'Shows a scheduler in vertical mode with dependencies',
                since       : '7.2.0'
            },
            {
                folder      : 'fieldfilters',
                title       : 'Advanced filtering',
                description : 'Shows how to use FieldFilterPickerGroup to filter the resource and event stores of the Schedule',
                since       : '5.5.3',
                updated     : '6.1.8'
            },
            {
                folder      : 'fillticks',
                title       : 'Fill ticks',
                description : 'This demo uses the `fillTicks` config to force events to be rendered as full ticks. Only affects rendering, the events retain their configured start and end dates on the data level',
                updated     : '6.0.5'
            },
            {
                folder      : 'filtering',
                title       : 'Filtering',
                description : 'This demo shows you how easy it is to filter & highlight events and resources to quickly find what matters to you',
                updated     : '6.2.0'
            },
            {
                folder      : 'grouping',
                title       : 'Grouping',
                description : 'This example shows how you can group resources'
            },
            {
                folder      : 'groupsummary',
                title       : 'Group summary',
                description : 'This example shows how you can display group summaries with custom rendering',
                updated     : '5.6.10'
            },
            {
                folder      : 'infinite-timeline-scroll',
                title       : 'Infinite timeline scrolling',
                description : "A scheduler which contains a year's worth of events and may be scrolled continuously so that all events may be visited",
                since       : '4.2.0'
            },
            {
                folder      : 'labels',
                title       : 'Labels',
                description : 'This demo uses the Labels feature to display labels above/below events. Labels can display field data or use a custom renderer',
                updated     : '4.1'
            },
            {
                folder      : 'merge-cells',
                title       : 'Merge cells',
                description : 'This example shows how to use the `mergeCells` option on columns to merge cells with the same value into a single cell spanning multiple rows',
                since       : '4.3.0'
            },
            {
                folder      : 'multiassign',
                title       : 'Multi assignment',
                description : 'Shows a basic scheduler using an AssignmentStore to support multi assignment'
            },
            {
                folder      : 'multiassign-resourceids',
                title       : 'Multi assignment using resourceIds',
                description : 'Shows a basic scheduler using resourceIds field to support multi assignment',
                since       : '5.3.8'
            },
            {
                folder      : 'multiassign-with-dependencies',
                title       : 'Multi assignment + dependencies',
                description : 'Shows a basic scheduler using an multi assignment with dependencies, drawing dependency lines to all assignments of an event',
                since       : '2.0'
            },
            {
                folder      : 'multisummary',
                title       : 'Multi summary',
                description : 'This example shows how to display multiple summaries for the schedule part'
            },
            {
                folder      : 'nonworkingdays',
                title       : 'Non-working days',
                description : "The demo shows how to customize Scheduler's weekends and non-working days",
                updated     : '6.0.0'
            },
            {
                folder      : 'recurrence',
                title       : 'Recurring events',
                description : 'Shows recurring events. All update/delete operations on recurring events required to be confirmed. You can change recurrence configuration using the default event editor',
                since       : '2.3'
            },
            {
                folder      : 'recurringtimeranges',
                title       : 'Recurring time ranges',
                description : 'Shows how to use the TimeRanges feature with the recurring time spans to add repeating vertical lines and zones to the schedule',
                since       : '3.0.3',
                updated     : '5.6.9'
            },
            {
                folder      : 'resource-collapsing',
                title       : 'Resource collapsing',
                description : 'Using `eventLayout` field of the resource model you can control the collapsed state. "stack" means expanded, "none" means collapsed',
                since       : '4.1.5'
            },
            {
                folder      : 'resourcetimeranges',
                title       : 'Resource time ranges',
                description : 'Displays resource time ranges, similar to events in that they have a start and end date but different in that they do not take part in the layout. They always occupy full row height and are displayed behind events',
                since       : '1.2',
                updated     : '7.2.2'
            },
            {
                folder      : 'responsive',
                title       : 'Responsive',
                description : 'Shows how the scheduler can be easily made responsive using a combination of configs and styling'
            },
            {
                folder      : 'scroll-buttons',
                title       : 'Scroll Buttons demo',
                description : 'Shows buttons at the start/end of each row to let users scroll to the next event quickly',
                since       : '6.0.0'
            },
            {
                folder      : 'simpleeditor',
                title       : 'Simple event editor',
                description : 'Double click event bars to edit name easily',
                since       : '2.0'
            },
            {
                folder      : 'schedule-context',
                title       : 'Schedule hover widgets',
                description : 'Shows how to position a widget overlayed at the tick cell that the pointer is hovering',
                since       : '6.0.0'
            },
            {
                folder      : 'schedule-context-advanced',
                title       : 'Complex schedule hover widgets',
                description : 'Shows how to position a widget overlayed at the tick cell that the pointer is hovering',
                since       : '6.0.0'
            },
            {
                folder      : 'split',
                title       : 'Splitting the Scheduler',
                description : 'This example demonstrates how split the scheduler into multiple views',
                since       : '5.5'
            },
            {
                folder      : 'summary',
                title       : 'Summary',
                description : 'This example shows the summary feature',
                updated     : '6.0.4'
            },
            {
                folder      : 'header-summary',
                title       : 'Summary shown in time axis header',
                description : 'This example shows a summary in the timeaxis header',
                since       : '5.6.7',
                updated     : '5.6.8'
            },
            {
                folder      : 'histogramsummary',
                title       : 'Summary with histogram',
                description : 'This example shows how to make a simple animated histogram summary'
            },
            {
                folder      : 'timeranges',
                title       : 'Time ranges',
                description : 'Shows how to use the TimeRanges feature to add vertical lines and zones to the schedule',
                updated     : '7.3.0'
            },
            {
                folder      : 'timezone',
                title       : 'Time zone support',
                description : 'Shows how time zone support can be implemented',
                since       : '5.3.0',
                updated     : '5.6.11'
            },
            {
                folder      : 'time-selection',
                title       : 'Time selection',
                description : 'Shows how to select time ranges in the time axis header',
                since       : '5.2',
                updated     : '6.0.5'
            },
            {
                folder      : 'tree',
                title       : 'Tree',
                description : 'This demo visualizes hierarchical data in the form of a tree'
            },
            {
                folder      : 'tree-summary',
                title       : 'Tree summary',
                description : 'This demo shows how to rollup and summarize tree data',
                since       : '6.2.0'
            },
            {
                folder      : 'tree-summary-custom',
                title       : 'Tree summary custom',
                description : 'This demo shows how to rollup and summarize tree data and customize the way the rollup data are shown',
                since       : '6.2.0'
            },
            {
                folder      : 'tree-grouping',
                title       : 'Tree grouping',
                description : "Uses the TreeGroup feature to transform the resource tree's structure",
                since       : '5.2'
            },
            {
                folder      : 'undoredo',
                title       : 'Undo/Redo',
                description : 'This demo shows undo / redo functionality one can use in an application using standard State Tracking Manager facility'
            },
            {
                folder      : 'vertical',
                title       : 'Vertical mode',
                description : 'Shows a basic scheduler using vertical mode',
                since       : '2.2',
                updated     : '7.2.0'
            },
            {
                folder      : 'vertical-resource-widths',
                title       : 'Vertical mode with variable column widths',
                description : 'Shows a basic scheduler using vertical mode with defined column widths',
                since       : '5.0.2',
                updated     : '7.2.0'
            },
            {
                folder      : 'workingtime',
                title       : 'Working hours & days',
                description : 'This demo shows how to configure Scheduler to only show working hours and working days, stretching events to fill the gaps that would otherwise be seen',
                since       : '2.0'
            },
            {
                folder      : 'multi-groups',
                title       : 'Resources with multi-group membership',
                description : 'This example shows how resources may be members of multiple groups',
                since       : '5.6.0'
            },
            {
                folder      : 'multi-treegroups',
                title       : 'Resources with multi-TreeGroup membership',
                description : 'This example shows how resources may be members of multiple tree groups',
                since       : '5.6.0'
            },
            {
                folder      : 'lock-rows',
                title       : 'Locking resources at top of view',
                description : 'This example demonstrates how to freeze rows at the top of the Scheduler using the LockRows feature',
                since       : '6.0.0',
                updated     : '6.1.8'
            }
        ]
    },

    Customization : {
        items : [
            {
                folder      : 'custom-event-rendering',
                title       : 'Customized event rendering',
                description : 'Shows a how to render custom HTML into the event bars',
                since       : '5.5'
            },
            {
                folder      : 'airport',
                title       : 'Custom rendering for airport scheduling',
                description : 'This demo visualizes transport scheduling at an airport',
                since       : '5.5',
                updated     : '6.0.5'
            },
            {
                folder      : 'docked-editor',
                title       : 'Docked event editor',
                description : 'This example shows the event editor docked inside the browser viewport',
                since       : '5.2.9',
                updated     : '7.0.2'
            },
            {
                folder      : 'eventeditor',
                title       : 'Event editor customization',
                description : 'The Event Editor feature displays a popup where you can edit the fields for your events. Double click an event to show the editor. Hover over an event to show a tooltip with information',
                updated     : '5.4'
            },
            {
                folder      : 'eventeditor-combos',
                title       : 'Event editor with cascading combos',
                description : 'The Event Editor feature displays a popup where you can edit the fields for your events. The popup has two custom combo fields. The second combo item list depends on the first combo value'
            },
            {
                folder      : 'eventmenu',
                title       : 'Event menu customization',
                description : 'Shows how to customize the items of the EventMenu',
                since       : '1.2',
                updated     : '4.1.6'
            },
            {
                folder      : 'layers',
                title       : 'Customizing layers',
                description : 'Shows how to move the different layers along the z-axis',
                since       : '5.6.0',
                updated     : '6.0.0'
            },
            {
                folder      : 'localization',
                title       : 'Localization',
                description : 'Shows how to preload a specific locale and localize the application',
                updated     : '6.1.8'
            },
            {
                folder      : 'tooltips',
                title       : 'Tooltip customization',
                description : 'Shows you how to customize the event tooltip',
                updated     : '5.6.9'
            },
            {
                folder      : 'custom-event-buttons',
                title       : 'Shows custom buttons inside the event bars',
                description : 'Shows how to render custom buttons into the event bar',
                since       : '5.5',
                updated     : '6.0.5'
            },
            {
                folder      : 'custom-event-editor',
                title       : 'Replace the event editor',
                description : 'A custom event editor implemented with Bootstrap',
                since       : '4.0',
                updated     : '4.2.0'
            },
            {
                folder      : 'custom-eventmenu',
                title       : 'Replace the event menu',
                description : 'A custom event menu implemented with Bootstrap',
                since       : '4.0'
            },
            {
                folder      : 'eventeditor-tinymce',
                title       : 'Rich text editor',
                description : 'This example shows how to use TinyMCE as a field in the event editor popup',
                since       : '6.3.0'
            },
            {
                folder      : 'validation',
                title       : 'Validation when dragging, creating or resizing tasks',
                description : 'Validation can be done when dragging, creating or resizing tasks. You can also provide an error message shown to your users when the state of a task is invalid',
                updated     : '6.0.0'
            }
        ]
    },

    Export : {
        items : [
            {
                folder      : 'export',
                title       : 'Export to PDF/PNG',
                description : 'Demonstrates how to export the scheduler to PDF/PNG',
                since       : '3.0',
                updated     : '6.3.0'
            },
            {
                folder      : 'print',
                title       : 'Print',
                description : 'Demonstrates how to print component using browser print dialog',
                since       : '5.6.0'
            },
            {
                folder      : 'exporttoexcel',
                title       : 'Export to Excel',
                description : 'This demo shows a custom solution of exporting Scheduler data to Excel without involving the server based on a third party library called write-excel-file (https://www.npmjs.com/package/write-excel-file)'
            },
            {
                folder      : 'exporttoics',
                title       : 'Export to ICS',
                description : 'This demo shows how to export an event to the ICS format to be added to Outlook and other calendars',
                since       : '4.0'
            },
            {
                folder      : 'test-case',
                title       : 'Extracting a test case',
                description : "This example shows how to extract a starting point for a test case which can be useful for reproducing an issue when reporting it on Bryntum's support forum",
                since       : '5.0'
            }
        ]
    },

    Misc : {
        items : [
            {
                folder      : 'kitchen-sink',
                title       : 'Kitchen sink',
                description : 'Comprehensive showcase of all the widgets included in the Bryntum package. Browse through text fields, date pickers, buttons, layouts, and more',
                since       : '7.1',
                thin        : true
            }
        ]
    },

    Integration : {
        items : [
            {
                folder      : 'crudmanager',
                title       : 'Backend in PHP + CrudManager',
                description : 'Scheduler with a CrudManager using a backend built on PHP & MySQL',
                overlay     : 'php',
                offline     : true,
                updated     : '6.0.0'
            },
            {
                folder      : 'csp',
                title       : 'Content-Security-Policy (CSP)',
                description : 'This example uses a Content-Security-Policy meta tag to show that Scheduler works with CSP'
            },
            {
                folder      : 'esmodule',
                title       : 'Include using EcmaScript module',
                description : 'This example shows how to include and use the grid using EcmaScript modules (import)'
            },
            {
                folder      : 'extjsclassic',
                title       : 'ExtJS Classic App integration',
                description : 'Example of a Bryntum Scheduler embedded in an ExtJS Classic application. Read more about ExtJS here: <a href="https://www.sencha.com/products/extjs" style="color: white; font-weight: bold">https://www.sencha.com</a>',
                version     : 'ExtJS 7.4.0',
                overlay     : 'extjs',
                since       : '6.3.2'
            },
            {
                folder      : 'extjsmodern',
                title       : 'ExtJS Modern App integration',
                description : 'Example of a Bryntum Scheduler embedded in an ExtJS Modern application. Read more about ExtJS here: <a href="https://www.sencha.com/products/extjs" style="color: white; font-weight: bold">https://www.sencha.com</a>',
                version     : 'ExtJS 6.5.3',
                overlay     : 'extjs',
                updated     : '4.2'
            },
            {
                folder      : 'php',
                title       : 'Backend in PHP',
                description : 'Demonstrates an editable Scheduler with a simple PHP backend (only stores data in session, no database)',
                overlay     : 'php'
            },
            {
                folder      : 'salesforce',
                title       : 'Integrate with Salesforce Lightning',
                description : 'This demo shows how to embed Bryntum Scheduler into the Lightning Web Component to use in your salesforce org',
                globalUrl   : 'https://bryntum-dev-ed.develop.my.site.com/demo/scheduler',
                overlay     : 'salesforce',
                since       : '4.0',
                updated     : '6.3.3'
            },
            {
                folder      : 'scripttag',
                title       : 'Include using script tag',
                description : 'This example shows how to include and use the grid bundle using an ordinary script tag'
            },
            {
                folder      : 'webcomponents',
                title       : 'Use as web component',
                description : 'This example shows how to use the Custom elements version of the Scheduler'
            },
            {
                folder      : 'frameworks/aspnet',
                title       : 'ASP.NET',
                description : 'Shows scheduler with .NET backend',
                overlay     : 'dotnet',
                offline     : true,
                since       : '3.1.0'
            },
            {
                folder      : 'frameworks/aspnetcore',
                title       : 'ASP.NET Core',
                description : 'Shows scheduler with .NET backend',
                overlay     : 'dotnet',
                offline     : true,
                since       : '3.1.0'
            },
            {
                folder      : 'frameworks/webpack/basic',
                title       : 'Custom build using WebPack',
                description : 'This very basic demo shows how to use SchedulerBase and webpack to do a custom build from our sources',
                version     : 'WebPack 5',
                overlay     : 'webpack',
                offline     : true,
                since       : '2.3',
                updated     : '6.1.4'
            },
            {
                folder      : 'frameworks/webpack/basic-thin',
                title       : 'Custom thin build using WebPack',
                description : 'This very basic demo shows how to use SchedulerBase and webpack to do a custom build from our thin packages',
                version     : 'WebPack 5',
                overlay     : 'webpack',
                since       : '6.1.4',
                thin        : true
            }
        ]
    },

    Angular : {
        overlay : 'angular',
        tab     : 'angular',
        build   : true,
        items   : [
            {
                folder      : 'frameworks/angular/advanced',
                title       : 'Angular Routing + NgRx',
                description : 'This example shows how to use Bryntum Angular Scheduler component in an Angular application with routing and with state managed by NgRx',
                version     : 'Angular 13 + TypeScript 4',
                since       : '2.0',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/angular-11-routing',
                title       : 'Angular 11 Routing',
                description : 'Shows how to use Angular 11 routing with the Bryntum Angular Scheduler. Angular v6+ is fully supported',
                version     : 'Angular 11 + TypeScript 4',
                since       : '4.1.1',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/animations',
                title       : 'Animations',
                description : 'The Angular Scheduler control will animate any changes to your rendered events out of the box',
                version     : 'Angular 19 + TypeScript 5',
                since       : '2.0',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/basic',
                title       : 'Basic setup',
                description : 'This simple example shows how the Angular Scheduler component can be integrated into any Angular application',
                version     : 'Angular 19 + TypeScript 5',
                since       : '2.0',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/basic-thin',
                title       : 'Basic thin setup',
                description : 'This example shows setup the thin Angular Scheduler component',
                version     : 'Angular 19 + TypeScript 5',
                since       : '6.1.4',
                updated     : '7.3.0',
                thin        : true
            },
            {
                folder      : 'frameworks/angular/booking',
                title       : 'Property booking',
                description : 'This example shows a booking application demo, using ResourceTimeRanges, the summary feature and angular components as renderers',
                version     : 'Angular 16 + TypeScript 4',
                since       : '5.6.3',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/columns',
                title       : 'Columns',
                description : 'Displays columns of different types on left and right sides of the schedule',
                version     : 'Angular 13 + TypeScript 4',
                since       : '5.1',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/custom-event-editor',
                title       : 'Custom event editor',
                description : 'Shows how to replace the default event editor with an Angular-based custom editor',
                version     : 'Angular 13 + TypeScript 4',
                since       : '2.2.5',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/dependencies',
                title       : 'Dependencies',
                description : 'This example shows how you can visualize dependencies between tasks by loading data using the CrudManager in Angular',
                version     : 'Angular 15 + TypeScript 4',
                since       : '2.0',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/drag-between-schedulers',
                title       : 'Drag between schedulers',
                description : 'You can drag drop tasks between different Angular Scheduler component instances on the page',
                version     : 'Angular 15 + TypeScript 4',
                since       : '2.0',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/drag-from-grid',
                title       : 'Drag tasks from grid',
                description : 'The example shows how easy it is to allow end users to drag unplanned tasks from an external grid to the Angular Scheduler component',
                version     : 'Angular 19 + TypeScript 5',
                since       : '2.0',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/drag-onto-tasks',
                title       : 'Drop equipment onto tasks',
                description : 'This example lets you drag external DOM nodes and drop them onto tasks to update some aspect of them, such as scheduling the use of equipment',
                version     : 'Angular 15 + TypeScript 4',
                since       : '2.0',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/eventeditor-combos',
                title       : 'Event Editor with Cascading Combos',
                description : 'The Event Editor feature displays a popup where you can edit the fields for your events. The popup has multiple custom fields, which have dependencies on each other',
                version     : 'Angular 19 + TypeScript 5',
                since       : '6.3.1',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/filtering',
                title       : 'Filtering',
                description : 'This demo shows you how easy it is to filter & highlight events and resources to quickly find what matters to you',
                version     : 'Angular 15 + TypeScript 4',
                since       : '2.0',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/infinite-scroll-tree',
                title       : 'Infinite scroll tree',
                description : 'Shows a Scheduler with hierarchical resource data and both infinite timeline scroll as well as infinite resource scroll. The backend is made in PHP',
                version     : 'Angular 20 + TypeScript 5',
                since       : '6.2.5',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/localization',
                title       : 'Localization',
                description : 'This example shows how to localize the Angular Scheduler control together with i18next library in Angular',
                version     : 'Angular 15 + TypeScript 4',
                since       : '2.0',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/ngrx-lazy-load',
                title       : 'Lazy loading with NgRx',
                description : 'Resources and events are lazily loaded on demand via NgRx (Store + Effects), so the scheduler scrolls on both axes',
                version     : 'Angular 20 + TypeScript 5',
                since       : '7.3.3'
            },
            {
                folder      : 'frameworks/angular/pdf-export',
                title       : 'PDF export (offline)',
                description : 'This example shows how you can export the Angular Scheduler content into PDF/PNG in Angular',
                version     : 'Angular 15 + TypeScript 4',
                offline     : true,
                since       : '3.0',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/recurring-events',
                title       : 'Recurring events',
                description : 'Shows how to use recurring events feature in Angular Scheduler. You can use any recurrence pattern to control the event scheduling',
                version     : 'Angular 15 + TypeScript 4',
                since       : '3.1',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/recurring-timeranges',
                title       : 'Recurring timeranges',
                description : 'Shows how to use the TimeRanges feature with the recurring time spans to add repeating vertical lines and zones to the schedule',
                version     : 'Angular 13 + TypeScript 4',
                since       : '4.3.4',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/simpleeditor',
                title       : 'Simple editor',
                description : 'Double click event bars to edit name easily',
                version     : 'Angular 13 + TypeScript 4',
                since       : '5.1',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/tasks',
                title       : 'Tasks',
                description : 'This example shows the Angular Scheduler with resources organized in a tree structure and per-row task coloring',
                version     : 'Angular 15 + TypeScript 4',
                since       : '2.0',
                updated     : '7.3.0'
            },
            {
                folder      : 'frameworks/angular/timelinehistogram',
                title       : 'Timeline histogram',
                description : 'Shows a timeline histogram',
                version     : 'Angular 16 + TypeScript 4',
                since       : '5.6.4',
                updated     : '7.3.0'
            }
        ]
    },

    'React + Vite' : {
        overlay : 'react',
        tab     : 'react',
        build   : true,
        items   : [
            {
                folder      : 'frameworks/react-vite/basic',
                title       : 'Basic setup',
                description : 'This demo contains a React component that wraps Bryntum Grid using TypeScript and a small demo to showcase it',
                version     : 'React 18 + Vite 5 + TypeScript 5',
                since       : '6.1.2'
            },
            {
                folder      : 'frameworks/react-vite/basic-thin',
                title       : 'Basic thin setup',
                description : 'This demo contains a React component that wraps Bryntum Grid using TypeScript and a small demo to showcase it',
                version     : 'React 18 + Vite 5 + TypeScript 5',
                since       : '6.1.3',
                updated     : '7.2.2',
                thin        : true
            },
            {
                folder      : 'frameworks/react-vite/bigdataset',
                title       : 'Big dataset with React JSX events rendering',
                description : 'Demonstrates that the Scheduler performs well with many resources and events and with enabled React JSX rendering',
                version     : 'React 18 + Vite 4 + TypeScript 4',
                since       : '5.5.3'
            },
            {
                folder      : 'frameworks/react-vite/booking',
                title       : 'Property booking',
                description : 'This example shows a demo booking application, using ResourceTimeRanges and the summary feature',
                version     : 'React 18 + Vite 5 + TypeScript 5',
                since       : '6.0.0',
                updated     : '6.0.5'
            },
            {
                folder      : 'frameworks/react-vite/drag-from-grid',
                title       : 'Drag from grid demo',
                description : 'This demo shows how easy it is to drag unscheduled tasks from an external grid onto the React Scheduler',
                version     : 'React 18 + Vite 5 + TypeScript 5',
                since       : '2.0',
                updated     : '6.1.8'
            },
            {
                folder      : 'frameworks/react-vite/eventeditor-combos',
                title       : 'Event Editor Combos',
                description : 'The Event Editor feature displays a popup where you can edit the fields for your events. The popup has multiple custom fields, which have dependencies on each other',
                version     : 'React 19 + Vite 6 + TypeScript 5',
                since       : '6.2.4'
            },
            {
                folder      : 'frameworks/react-vite/infinite-scroll-tree',
                title       : 'Infinite scroll tree',
                description : 'Shows a Scheduler with hierarchical resource data and both infinite timeline scroll as well as infinite resource scroll. The backend is made in PHP',
                version     : 'React 19 + Vite 7 + TypeScript 5',
                since       : '6.2.5'
            },
            {
                folder      : 'frameworks/react-vite/nonworkingdays',
                title       : 'Non-Working days',
                description : "The demo shows how to customize Scheduler's weekends and non-working days",
                version     : 'React 18 + Vite 5 + TypeScript 5',
                since       : '6.0.0'
            },
            {
                folder      : 'frameworks/react-vite/print',
                title       : 'Print demo with React JSX component as event renderer',
                description : 'This demo contains a React Scheduler with the Print feature enabled while using JSX event and cell renderer',
                version     : 'React 19 + Vite 6 + TypeScript 5',
                since       : '7.0.2'
            },
            {
                folder      : 'frameworks/react-vite/react-events',
                title       : 'React JSX component as event renderer',
                description : 'This example demonstrates how to use React components as event renderers',
                version     : 'React 19 + Vite 6 + TypeScript 5',
                since       : '5.3.0',
                updated     : '6.2.4'
            },
            {
                folder      : 'frameworks/react-vite/react-tooltips',
                title       : 'Using React JSX components in tooltips',
                description : 'This example demonstrates how to use React components in tooltips and other widgets',
                version     : 'React 19 + Vite 7 + TypeScript 5',
                since       : '5.2.6',
                updated     : '7.0.0'
            },
            {
                folder      : 'frameworks/react-vite/renderer-context',
                title       : 'Using React Context with renderers',
                description : 'Shows how to configure React renderers to use the React Context',
                version     : 'React 18 + Vite 4 + TypeScript 5',
                since       : '5.6.1'
            },
            {
                folder      : 'frameworks/react-vite/rtk-query-lazy-load',
                title       : 'Lazy loading with RTK Query',
                description : 'Resources and events are lazily loaded on demand via Redux Toolkit Query, so the scheduler scrolls smoothly through large datasets on both axes',
                version     : 'React 19 + Vite 8 + TypeScript 6',
                since       : '7.3.3'
            },
            {
                folder      : 'frameworks/react-vite/timelinehistogram',
                title       : 'Timeline histogram',
                description : 'Shows a timeline histogram',
                version     : 'React 18 + Vite 4 + TypeScript 4',
                since       : '5.6.4'
            },
            {
                folder      : 'frameworks/react-vite/vertical',
                title       : 'Vertical mode',
                description : 'This demo shows the React Scheduler in vertical mode with resource along the horizontal axis',
                version     : 'React 18 + Vite 5 + TypeScript 5',
                since       : '4.1',
                updated     : '6.1.6'
            }
        ]
    },

    React : {
        overlay : 'react',
        tab     : 'react',
        build   : true,
        items   : [
            {
                folder      : 'frameworks/react/javascript/advanced',
                title       : 'React + Redux Toolkit advanced',
                description : 'Demo of using the Bryntum React Scheduler component in a React application using Redux Toolkit, loading data with Redux Toolkit Query',
                version     : 'React 18',
                since       : '2.0'
            },
            {
                folder      : 'frameworks/react/javascript/animations',
                title       : 'Animations',
                description : 'This demo contains a React Scheduler component and lets you play with the out-of-the-box animations after data changes',
                version     : 'React 16',
                since       : '2.0'
            },
            {
                folder      : 'frameworks/react/javascript/columns',
                title       : 'Columns',
                description : 'Displays columns of different types on left and right sides of the schedule',
                version     : 'React 18',
                since       : '5.1'
            },
            {
                folder      : 'frameworks/react/javascript/custom-event-editor',
                title       : 'Custom event editor',
                description : 'This demo contains a React Scheduler control with a custom event editor popup implemented in React',
                version     : 'React 16',
                since       : '2.2'
            },
            {
                folder      : 'frameworks/react/javascript/dependencies',
                title       : 'Dependencies',
                description : 'This demo contains a React Scheduler with the dependencies feature in action. You can connect tasks from any side',
                version     : 'React 16',
                since       : '2.0'
            },
            {
                folder      : 'frameworks/react/javascript/drag-between-schedulers',
                title       : 'Drag between schedulers',
                description : 'This demo contains two React Scheduler component instances and lets you drag tasks between them',
                version     : 'React 16',
                since       : '2.0'
            },
            {
                folder      : 'frameworks/react/javascript/drag-onto-tasks',
                title       : 'Drag onto tasks',
                description : 'This demo contains a React Scheduler component and you can drag and drop external DOM nodes onto the tasks to add equipment',
                version     : 'React 16',
                since       : '2.0',
                updated     : '5.6.3'
            },
            {
                folder      : 'frameworks/react/javascript/filtering',
                title       : 'Filtering',
                description : 'This shows how to use the Bryntum React Scheduler and other Widgets to filter or highlight the scheduled tasks',
                version     : 'React 16',
                since       : '2.2'
            },
            {
                folder      : 'frameworks/react/javascript/localization',
                title       : 'Localization',
                description : 'This demo shows how to localize the React Scheduler. You can localize it to any language using the JSON language files provided',
                version     : 'React 16',
                since       : '2.1'
            },
            {
                folder      : 'frameworks/react/javascript/pdf-export',
                title       : 'PDF export (offline)',
                description : 'This demo contains a React Scheduler with the PDF export feature enabled. You can also export to PNG & Excel',
                version     : 'React 16',
                offline     : true,
                since       : '3.0'
            },
            {
                folder      : 'frameworks/react/javascript/react-state',
                title       : 'Using state',
                description : 'This demo shows how to use React state with the React Scheduler control',
                version     : 'React 17',
                since       : '4.3.2'
            },
            {
                folder      : 'frameworks/react/javascript/simple',
                title       : 'Simple setup',
                description : 'This demo contains a very simple React Scheduler implementation example',
                version     : 'React 16',
                since       : '2.0',
                updated     : '2.3'
            },
            {
                folder      : 'frameworks/react/javascript/simpleeditor',
                title       : 'Simple editor',
                description : 'Double click event bars to edit name easily',
                version     : 'React 18',
                since       : '5.1'
            },
            {
                folder      : 'frameworks/react/typescript/filtering',
                title       : 'Filtering with TypeScript',
                description : 'This shows how to use Bryntum Scheduler and Widgets to take user input and filter or highlight the scheduler tasks in React + TypeScript',
                version     : 'React 16 + TypeScript 4',
                since       : '2.2',
                updated     : '5.0.3'
            },
            {
                folder      : 'frameworks/react/typescript/recurring-events',
                title       : 'Recurring events with TypeScript',
                description : 'This shows how to use Bryntum Scheduler recurring events configuration in React + TypeScript',
                version     : 'React 16 + TypeScript 4',
                since       : '3.1',
                updated     : '5.0.3'
            },
            {
                folder      : 'frameworks/react/typescript/recurring-timeranges',
                title       : 'Recurring timeranges with TypeScript',
                description : 'Shows how to use the TimeRanges feature with the recurring time spans to add repeating vertical lines and zones to the schedule',
                version     : 'React 16 + TypeScript 4',
                since       : '4.3.4',
                updated     : '5.0.3'
            },
            {
                folder      : 'frameworks/react/typescript/sharepoint-fabric',
                title       : 'SharePoint Workbench with TypeScript',
                description : 'This demo includes a SPFx web part that uses TypeScript and React',
                version     : 'React 17 + TypeScript 4',
                offline     : true,
                since       : '6.0.1',
                thin        : true
            },
            {
                folder      : 'frameworks/react/typescript/sharepoint-fabric-drag-from-grid',
                title       : 'SharePoint Workbench Drag from Grid with TypeScript',
                description : 'This demo includes a SPFx web part that uses TypeScript and React',
                version     : 'React 17 + TypeScript 4',
                offline     : true,
                since       : '6.1.8',
                thin        : true
            }
        ]
    },

    'React + Remix' : {
        overlay : 'react',
        tab     : 'react',
        build   : true,
        items   : [
            {
                folder      : 'frameworks/react-remix/basic',
                title       : 'Basic setup',
                description : 'This demo contains the React Scheduler wrapper and the demo is written in Remix using Typescript',
                version     : 'React 18 + Remix 2 + Vite 5 + TypeScript 5',
                offline     : true,
                since       : '6.0.0'
            }
        ]
    },

    'Vue 3 + Nuxt' : {
        overlay : 'vue',
        tab     : 'vue',
        build   : true,
        items   : [
            {
                folder      : 'frameworks/vue-3-nuxt/basic',
                title       : 'Basic setup (Nuxt)',
                description : 'This example shows basic setup of the Scheduler in Nuxt',
                version     : 'Vue 3 + NuxtJS 4 + Vite 5',
                since       : '7.3.0'
            }
        ]
    },

    'Vue 3 + Vite' : {
        overlay : 'vue',
        tab     : 'vue',
        build   : true,
        items   : [
            {
                folder      : 'frameworks/vue-3-vite/basic',
                title       : 'Basic setup',
                description : 'This example shows basic setup of the Bryntum Scheduler',
                version     : 'Vue 3 + Vite 5 + TypeScript 5',
                since       : '6.1.2'
            },
            {
                folder      : 'frameworks/vue-3-vite/basic-thin',
                title       : 'Basic thin setup',
                description : 'This example shows basic setup of the Bryntum Scheduler',
                version     : 'Vue 3 + Vite 5 + TypeScript 5',
                since       : '6.1.4',
                thin        : true
            },
            {
                folder      : 'frameworks/vue-3-vite/booking',
                title       : 'Property booking',
                description : 'This example shows a demo booking application, using ResourceTimeRanges and the summary feature',
                version     : 'Vue 3 + Vite 5 + TypeScript 4',
                since       : '6.0.0',
                updated     : '6.0.5'
            },
            {
                folder      : 'frameworks/vue-3-vite/custom-event-editor',
                title       : 'Custom event editor',
                description : 'This demo contains an example of the Vue Scheduler with a custom Vue + Vuetify event editor popup replacing the default one',
                version     : 'Vue 3 + Vite 5 + TypeScript 5',
                since       : '2.2.5',
                updated     : '6.2.3'
            },
            {
                folder      : 'frameworks/vue-3-vite/drag-from-grid',
                title       : 'Drag tasks from grid',
                description : 'This demo shows how easy it is to drag unscheduled tasks from an external grid onto the Scheduler',
                version     : 'Vue 3 + Vite 5 + TypeScript 5',
                since       : '6.0.6'
            },
            {
                folder      : 'frameworks/vue-3-vite/event-rendering',
                title       : 'Event rendering demo',
                description : 'This example shows a demo using custom Vue component as event renderer',
                version     : 'Vue 3 + Vite 5 + TypeScript 5',
                since       : '6.0.6'
            },
            {
                folder      : 'frameworks/vue-3-vite/infinite-scroll-tree',
                title       : 'Infinite scroll tree',
                description : 'Shows a Scheduler with hierarchical resource data and both infinite timeline scroll as well as infinite resource scroll. The backend is made in PHP',
                version     : 'Vue 3 + Vite 7 + TypeScript 5',
                since       : '6.2.5'
            },
            {
                folder      : 'frameworks/vue-3-vite/tanstack-query-lazy-load',
                title       : 'Lazy loading with TanStack Query',
                description : 'Resources and events are lazily loaded on demand via TanStack Query, so the scheduler scrolls smoothly through large datasets on both axes',
                version     : 'Vue 3 + Vite 8 + TypeScript 6',
                since       : '7.3.3'
            },
            {
                folder      : 'frameworks/vue-3-vite/timelinehistogram',
                title       : 'Timeline histogram',
                description : 'Shows a timeline histogram',
                version     : 'Vue 3 + Vite 4 + TypeScript 4',
                since       : '5.6.4'
            },
            {
                folder      : 'frameworks/vue-3-vite/widget-rendering',
                title       : 'Vue Component in widget and tooltip',
                description : 'This example shows how to configure a Vue component to render in widget or tooltip',
                version     : 'Vue 3 + Vite 6 + TypeScript 5',
                since       : '6.1.5'
            }
        ]
    },

    'Vue 3' : {
        overlay : 'vue',
        tab     : 'vue',
        build   : true,
        items   : [
            {
                folder      : 'frameworks/vue-3/javascript/columns',
                title       : 'Columns',
                description : 'Displays columns of different types on left and right sides of the schedule',
                version     : 'Vue 3',
                since       : '5.1',
                updated     : '5.3.0'
            },
            {
                folder      : 'frameworks/vue-3/javascript/simple',
                title       : 'Simple setup',
                description : 'Shows a simple Vue Scheduler component integration with Vue 3',
                version     : 'Vue 3',
                since       : '4.1',
                updated     : '5.3.0'
            },
            {
                folder      : 'frameworks/vue-3/javascript/simpleeditor',
                title       : 'Simple editor',
                description : 'Double click event bars to edit name easily',
                version     : 'Vue 3',
                since       : '5.1',
                updated     : '5.3.0'
            }
        ]
    },

    'Vue 2' : {
        overlay : 'vue',
        tab     : 'vue',
        build   : true,
        items   : [
            {
                folder      : 'frameworks/vue/javascript/advanced',
                title       : 'Advanced',
                description : 'Shows an advanced integration of Vue Scheduler using the Vue router and Vuex state management',
                version     : 'Vue 2',
                since       : '2.0.4'
            },
            {
                folder      : 'frameworks/vue/javascript/animations',
                title       : 'Animations',
                description : 'Shows how to configure event animations in the Vue Scheduler component. You can also disable animations completely',
                version     : 'Vue 2',
                since       : '2.0.4'
            },
            {
                folder      : 'frameworks/vue/javascript/dependencies',
                title       : 'Dependencies',
                description : 'Shows how to use the Vue Scheduler dependencies features to connect tasks using drag and drop',
                version     : 'Vue 2',
                since       : '2.0.4'
            },
            {
                folder      : 'frameworks/vue/javascript/drag-between-schedulers',
                title       : 'Drag between schedulers',
                description : 'Shows how to implement dragging events between two Vue Scheduler instances',
                version     : 'Vue 2',
                since       : '2.0.4'
            },
            {
                folder      : 'frameworks/vue/javascript/drag-onto-tasks',
                title       : 'Drag onto tasks',
                description : 'This example shows how to drag any DOM node and drop it onto a task in the Vue Scheduler to update some aspect of it',
                version     : 'Vue 2',
                since       : '2.0.4',
                updated     : '5.6.3'
            },
            {
                folder      : 'frameworks/vue/javascript/localization',
                title       : 'Localization',
                description : 'Shows how to combine the i18next framework with Vue Scheduler localization',
                version     : 'Vue 2',
                since       : '2.0.4'
            },
            {
                folder      : 'frameworks/vue/javascript/pdf-export',
                title       : 'PDF export',
                description : 'Shows how to use the PDF export feature in the Vue Scheduler component',
                version     : 'Vue 2',
                offline     : true,
                since       : '3.0'
            },
            {
                folder      : 'frameworks/vue/javascript/simple',
                title       : 'Simple setup',
                description : 'Shows a super simple integration of the Vue Scheduler into a Vue app',
                version     : 'Vue 2',
                since       : '2.0.4'
            },
            {
                folder      : 'frameworks/vue/javascript/tasks',
                title       : 'Tasks',
                description : 'Shows how to organize the resources in the Vue Scheduler into a tree combined with per-row coloring of tasks',
                version     : 'Vue 2',
                since       : '2.0.4'
            },
            {
                folder      : 'frameworks/vue/javascript/vue-renderer',
                title       : 'Cell renderer',
                description : 'The Bryntum Scheduler component for Vue lets you render native Vue Components into grid cells',
                version     : 'Vue 2',
                since       : '4.1'
            }
        ]
    }
};

// Flatten examples tree
window.examples = Object.entries(examples).flatMap(([group, parent]) => parent.items.map(item => Object.assign(item, parent, { group, items : undefined })));
