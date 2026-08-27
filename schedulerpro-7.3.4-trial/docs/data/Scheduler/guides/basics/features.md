# Scheduler features

Features are classes that add functionality to Scheduler. The purpose of this guide is to give an overview of the
features that ships with Scheduler and show how you can configure them.

## Enabling/disabling and configuring features

Features are configured using Schedulers [`features`](#Grid/view/Grid#config-features)-config. Some features are enabled
by default, in which case you can disable them like this:

```javascript
const scheduler = new Scheduler({
    features : {
        columnLines : false,
        eventResize : false
    }
});
```

Others require you to enable them:

```javascript
const scheduler = new Scheduler({
    features : {
        labels     : true,
        timeRanges : true
    }
});
```

Some features have configuration options (see the API docs for each feature for the options). In such cases you can
specify a configuration object instead of `true`:

```javascript
const scheduler = new Scheduler({
    features : {
        eventDrag : { // Configuration object
            constrainDragToResource : true
        },
        sort      : 'name' // Configuration shortcut using string, only availble for certain features
    }
});
```

If you need to access a feature at runtime, they are available through the `features` property on Scheduler:

```javascript
scheduler.features.eventEdit.showRecord(someEventRecord);
```

If you want to create a custom feature, head over to [GridFeatureManager](#Grid/feature/GridFeatureManager) docs.

<div class="note">
If a feature is set to <code>false</code>, it is not included at all and will be <code>undefined</code>.
You can see it by <code>console.log(scheduler.features.timeRanges)</code> when
<code>timeRanges</code> is set to <code>false</code>.
</div>

## Built-in features

Scheduler itself has built-in core functionality for rendering resources & events, selection and keyboard navigation. On
top of that it ships with the features described below, some of which are enabled by default and some which you have to
enable manually.

### AI ([API docs](#Scheduler/feature/AI))

This feature provides an AI agent for Scheduler which allows the user to use natural language to interact with the
Scheduler in different ways. The feature and all its related components are marked as **experimental** and are subject 
to change.

This feature is **disabled** by default.

### ColumnLines ([API docs](#Scheduler/feature/ColumnLines))

Draws lines at the columns (ticks) in the timeaxis. Major ticks can have a different color than normal.

This feature is **enabled** by default.

The demo below shows the default ColumnLines configuration, note the darker line between weeks:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/ColumnLines.js"></div>

### Dependencies ([API docs](#Scheduler/feature/Dependencies))

Display how events depend on each other using arrows.

This feature is **disabled** by default.

Hover over an event in the demo to show dependency terminals, from which you can drag to create dependency lines between
events:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/Dependencies.js"></div>

### DependencyEdit ([API Docs](#Scheduler/feature/DependencyEdit))

Feature that displays a popup containing fields for editing a dependency. Requires the `Dependencies` feature to be
enabled. Double-click a line in the demo below to show the editor.

This feature is **disabled** by default.

### DependencyMenu ([API Docs](#Scheduler/feature/DependencyMenu))

Feature that displays a menu when right-clicking a dependency line. Requires the `Dependencies` and `DependencyEdit`
features to be enabled.

This feature is **disabled** by default.

### EventCopyPaste ([API Docs](#Scheduler/feature/EventCopyPaste))

Allow using [Ctrl/CMD + C/X] and [Ctrl/CMD + V] to copy/cut and paste events.

This feature is **enabled** by default.

### EventDragSelect ([API Docs](#Scheduler/feature/EventDragSelect))

Enables users to click and drag to select events (or assignments in multi assignment mode) inside the Scheduler's
timeline. Press CTRL/CMD-key to extend an existing selection.

This feature is **disabled** by default.

<div class="external-example" data-file="Scheduler/feature/EventDragSelect.js"></div>

### EventMenu ([API docs](#Scheduler/feature/EventMenu))

Displays a context menu when right clicking events. Features add items to the menu, it is also possible to configure
extra items to show.

This feature is **enabled** by default.

Right click on an event to try it out:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/EventMenu.js"></div>

### EventDrag ([API docs](#Scheduler/feature/EventDrag))

Drag events to reschedule their start & end dates. Can be configured to snap to certain time intervals.

This feature is **enabled** by default.

Try dragging an event in the demo:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/EventDrag.js"></div>

### EventDragCreate ([API docs](#Scheduler/feature/EventDragCreate))

Drag an empty area in the schedule to create a new event. Events can also be created by double clicking.

This feature is **enabled** by default.

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/EventDragCreate.js"></div>

### EventEdit ([API docs](#Scheduler/feature/EventEdit))

Displays an editor for editing event data. It is possible to customize which items are shown in the editor.

This feature is **enabled** by default.

Double click an event in the demo to show the editor:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/EventEdit.js"></div>

### EventFilter ([API docs](#Scheduler/feature/EventFilter))

Adds an item for filtering events to the HeaderContextMenu.

This feature is **enabled** by default.

Right click on the timeaxis header to display the context menu, then pick `Filter tasks` and type to filter:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/EventFilter.js"></div>

### EventResize ([API docs](#Scheduler/feature/EventResize))

Change event duration by dragging its ends. Can be configured to snap to certain time intervals.

This feature is **enabled** by default.

Drag the left or right end of an event to resize it:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/EventResize.js"></div>

### EventTooltip ([API docs](#Scheduler/feature/EventTooltip))

Displays a tooltip when hovering events. The tooltip template can be customized to suite your needs.

This feature is **enabled** by default.

Hover an event to show the default tooltip:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/EventTooltip.js"></div>

### EventNonWorkingTime ([API Docs](#Scheduler/feature/EventNonWorkingTime))

Feature that allows rendering non-working time ranges into event bars (weekends for Scheduler).

This feature is **disabled** by default.

<div class="external-example" data-file="Scheduler/feature/EventNonWorkingTime.js"></div>

### Scroll Buttons ([API Docs](#Scheduler/feature/ScrollButtons))

Shows arrow icons at the start/end of each resource row which lets the user quickly scroll to the next/previous task
not currently in view.

This feature is **disabled** by default

<div class="external-example" data-file="Scheduler/feature/ScrollButtons.js"></div>

### ExcelExporter ([API Docs](#Scheduler/feature/experimental/ExcelExporter))

A plugin that allows exporting Scheduler data to Excel without involving the server.

This feature is **disabled** by default.

### Group ([API docs](#Grid/feature/Group))

Allows grouping of resources in Scheduler. Groups consists of all resources with the same value in the column by which
Scheduler is being grouped.

This feature is **enabled** by default.

Click on group headers to expand/collapse the group:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/Group.js"></div>

### GroupSummary ([API docs](#Scheduler/feature/GroupSummary))

Used in combination with Group feature, displays a summary bar at the bottom of each group.

This feature is **disabled** by default.

This demo has it enabled:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/GroupSummary.js"></div>

### HeaderZoom ([API Docs](#Scheduler/feature/HeaderZoom))

Enables users to click and drag to zoom to a date range in Scheduler's header time axis. Only supported in horizontal
mode.

This feature is **disabled** by default.

<div class="external-example" data-file="Scheduler/feature/HeaderZoom.js"></div>

### Labels ([API docs](#Scheduler/feature/Labels))

Shows labels aligned to events. The text in the labels can come from event data or renderer functions.

This feature is **disabled** by default.

This demo defines two labels, one above and one below the events:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/Labels.js"></div>

### LockRows ([API Docs](#Scheduler/feature/LockRows))

A feature which pins resources which fit certain criteria to the top of the grid.

This feature is **disabled** by default.

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/LockRows.js"></div>

### NonWorkingTime ([API docs](#Scheduler/feature/NonWorkingTime))

Can be used to highlight weekends or other non working days. By default gives them a grayish background color, to
distinguish them from normal days.

This feature is **disabled** by default.

Note that saturday and sunday have a tinted background in the demo:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/NonWorkingTime.js"></div>

### Pan ([API Docs](#Scheduler/feature/Pan))

Makes the scheduler's timeline pannable by dragging with the mouse. Try it out in the demo below.

This feature is **disabled** by default.

<div class="external-example" data-file="Scheduler/feature/Pan.js"></div>

### PdfExport ([API Docs](#Scheduler/feature/export/PdfExport))

Generates PDF/PNG files from the Scheduler component.

This feature is **disabled** by default.

### Print ([API Docs](#Scheduler/feature/export/Print))

Allows printing Scheduler contents using browser print dialog.

This feature is **disabled** by default.

### ResourceColumnReorder ([API Docs](#Scheduler/feature/ResourceColumnReorder))

Applicable only for Scheduler in `vertical` mode. Allows reordering resource columns by dragging their headers.

This feature is **disabled** by default.

<div class="external-example" data-file="Scheduler/feature/ResourceMenu.js"></div>

### ResourceMenu ([API Docs](#Scheduler/feature/ResourceMenu))

Applicable only for Scheduler in `vertical` mode. Right click resource header cells to display a context
menu.

This feature is **disabled** by default.

<div class="external-example" data-file="Scheduler/feature/ResourceMenu.js"></div>

### ResourceTimeRanges ([API Docs](#Scheduler/feature/ResourceTimeRanges))

Feature that draws resource time ranges, shaded areas displayed behind events. These zones are similar to events in that
they have a start and end date but different in that they do not take part in the event layout, and they always occupy
full row height.

This feature is **disabled** by default.

<div class="external-example" data-file="Scheduler/feature/ResourceTimeRanges.js"></div>

### RowReorder ([API Docs](#Scheduler/feature/RowReorder))

This feature implements support for project transactions and used by default in Gantt.

This feature is **disabled** by default in Scheduler and **enabled** by default in Gantt.

### RowResize ([API Docs](#Scheduler/feature/RowResize))

Enables user to change row height by dragging the bottom row border.

This feature is **disabled** by default.

### ScheduleContext ([API Docs](#Scheduler/feature/ScheduleContext))

Allow visually selecting a schedule cell by clicking or any other pointer gesture.

This feature is **disabled** by default

<div class="external-example" data-file="Scheduler/feature/ScheduleContext.js"></div>

### ScheduleMenu ([API Docs](#Scheduler/feature/ScheduleMenu))

Displays a context menu for empty parts of the schedule. Items are populated in the first place by configurations of
this Feature, then by other features and/or application code.

This feature is **enabled** by default

### ScheduleTooltip ([API docs](#Scheduler/feature/ScheduleTooltip))

Displays a tooltip with the current data/time when hovering an empty part of the schedule.

This feature is **enabled** by default.

Try hovering an empty part of the schedule to display the default tooltip:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/ScheduleTooltip.js"></div>

### SimpleEventEdit ([API Docs](#Scheduler/feature/SimpleEventEdit))

Feature that displays a text field to edit the event name. You can control the flow of this by listening to the events
relayed by this class from the underlying editor.

This feature is **disabled** by default.

<div class="external-example" data-file="Scheduler/feature/SimpleEventEdit.js"></div>

### Sort ([API docs](#Grid/feature/Sort))

Sort by a single or multiple columns, either by clicking headers or by using their context menus.

This feature is **enabled** by default.

This demo has a default sorter defined:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/Sort.js"></div>

### Split ([API Docs](#Scheduler/feature/Split))

This feature allows splitting the Scheduler into multiple views, either by using the cell context menu, or
programmatically by calling `split()`.

This feature is **disabled** by default.

<div class="external-example" data-file="Scheduler/feature/Split.js"></div>

### StickyEvents ([API Docs](#Scheduler/feature/StickyEvents))

This feature applies native `position: sticky` to event contents in horizontal mode, keeping the contents in
view as long as possible on scroll. For vertical mode it uses a programmatic solution to achieve the same result.

This feature is **enabled** by default.

### Summary ([API docs](#Scheduler/feature/Summary))

Summaries defined per column are displayed in a footer bar.

This feature is **disabled** by default.

Try changing some values, it will updated the summaries:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/Summary.js"></div>

### TimeAxisHeaderMenu ([API docs](#Scheduler/feature/TimeAxisHeaderMenu))

Displays a context menu for the timeaxis header. The menu is populated by other features.

This feature is **enabled** by default.

Right click on the timeaxis header to display the context menu:

<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/TimeAxisHeaderMenu.js"></div>

### TimeRanges ([API docs](#Scheduler/feature/TimeRanges))

Add highlighted time ranges (lines and zones) to the schedule. Can also display a line showing the current time.

This feature is **disabled** by default.

Drag the handles in the header to resize or move (with SHIFT) then TimeRange:
<div class="external-example" data-file="Scheduler/guides/schedulerfeatures/TimeRanges.js"></div>

### TimeSelection ([API Docs](#Scheduler/feature/TimeSelection))

Feature that allows selection of a time span in the time axis header. When a time span is selected in the header,
a `timeSelectionChange` event is fired.

This feature is **disabled** by default.

<div class="external-example" data-file="Scheduler/feature/TimeSelection.js"></div>

### Tree summary ([API docs](#Scheduler/feature/TreeSummary))

A feature allowing you to roll up and display values in the time axis cell for each parent row in a tree scheduler.

This feature is **disabled** by default.

## Useful features inherited from Grid

Scheduler is based on Grid, which has some features that are useful also in Scheduler. Read on for an overview of those.
Please check the list of Grid features in this [guide](#Grid/guides/basics/features.md).

### CellEdit ([API docs](#Grid/feature/CellEdit))

Inline editing of cell values.

This feature is **enabled** by default.

Double click a cell to start editing:

<div class="external-example" data-file="Scheduler/guides/features/CellEdit.js"></div>

### CellTooltip ([API docs](#Grid/feature/CellTooltip))

Display per cell tooltips that can contain record data.

This feature is **disabled** by default.

Hover a cell below to see it in action:

<div class="external-example" data-file="Scheduler/guides/features/CellTooltip.js"></div>

### ColumnPicker ([API docs](#Grid/feature/ColumnPicker))

Adds item to column header context menus to toggle column visibility.

This feature is **enabled** by default.

Right click a column header to show the menu:

<div class="external-example" data-file="Scheduler/guides/features/ColumnPicker.js"></div>

### ColumnReorder ([API docs](#Grid/feature/ColumnReorder))

Allows reordering columns by dragging their headers.

This feature is **enabled** by default.

Drag a header to rearrange:

<div class="external-example" data-file="Scheduler/guides/features/ColumnReorder.js"></div>

### ColumnResize ([API docs](#Grid/feature/ColumnResize))

Lets user resize columns by dragging their headers right hand edge.

This feature is **enabled** by default.

Try it in this demo:

<div class="external-example" data-file="Scheduler/guides/features/ColumnResize.js"></div>

### CellMenu ([API docs](#Grid/feature/CellMenu))

Handles context menu for cells. Other features supply items, additional items can be added in your code.

This feature is **enabled** by default.

Right click a cell in the demo below to show the menu:

<div class="external-example" data-file="Scheduler/guides/features/CellMenu.js"></div>

### HeaderMenu ([API docs](#Grid/feature/HeaderMenu))

Handles context menu for headers. Other features supply items, additional items can be added in your code.

This feature is **enabled** by default.

Right click a header in the demo below to show the menu:

<div class="external-example" data-file="Scheduler/guides/features/HeaderMenu.js"></div>

### Filter ([API docs](#Grid/feature/Filter))

Enables the user to filter rows, either by using the cell context menu or through headers.

This feature is **disabled** by default.

Right click a cell or click the icon in a header in the demo below to see the options:

<div class="external-example" data-file="Scheduler/guides/features/Filter.js"></div>

### FilterBar ([API docs](#Grid/feature/FilterBar))

Similar to the Filter feature, but displays fields for filtering directly in the headers.

This feature is **disabled** by default.

Try it out in this demo:

<div class="external-example" data-file="Scheduler/guides/features/FilterBar.js"></div>

### QuickFind ([API docs](#Grid/feature/QuickFind))

Quick searching within a column, just click a cell and start typing.

This feature is **disabled** by default.

Click any cell in this demo and type something:

<div class="external-example" data-file="Scheduler/guides/features/QuickFind.js"></div>

### RegionResize ([API docs](#Grid/feature/RegionResize))

Displays a splitter that allows the user to resize the regions when using a grid with locked & normal columns.

This feature is **disabled** by default.

Drag the splitter to resize or click the icons in it to expand/collapse:

<div class="external-example" data-file="Scheduler/guides/features/RegionResize.js"></div>

### Search ([API docs](#Grid/feature/Search))

Search has functionality for searching the grid, but it does not have any input UI. That needs to be supplied by the
application.

This feature is **disabled** by default.

This demo uses a basic text field to search from:

<div class="external-example" data-file="Scheduler/guides/features/Search.js"></div>

### Stripe ([API docs](#Grid/feature/Stripe))

Makes every other rows background have a different color, also hides bottom border of each row.

This feature is **disabled** by default.

Grid with striped rows:

<div class="external-example" data-file="Scheduler/guides/features/Stripe.js"></div>

### Tree ([API docs](#Grid/feature/Tree))

Turns the scheduler/grid into a tree. Requires exactly one `TreeColumn` to be present.

This feature is **disabled** by default.

<div class="external-example" data-file="Scheduler/guides/features/TreeGrid.js"></div>

## Importing features from sources

A feature is registered when the application imports it. When using the regular module/umd bundle, this is done
automatically, as the bundle encapsulates all code inside. However, when utilizing sources or thin bundles, a feature
might not be imported by default. For any feature not enabled by default, it is essential to ensure that you have
imported it to be able to use it.

Example:

```javascript
import Scheduler from 'PATH_TO_SOURCE/Scheduler/view/Scheduler.js';
import 'PATH_TO_SOURCE/Scheduler/feature/Dependencies.js';

const scheduler = new Scheduler({
    features : {
        dependencies : {
            // Feature condig
        }
    }
});
```


<p class="last-modified">Last modified on 2026-07-22 10:39:14</p>