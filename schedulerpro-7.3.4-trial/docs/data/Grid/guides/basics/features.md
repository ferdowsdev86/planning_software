# Grid features

Features are classes that add functionality to the Grid. The purpose of this guide is to give an overview of the
features that ships with Grid and show how you can configure them.

## Enabling/disabling and configuring features

Features are configured using Grids [`features`](#Grid/view/Grid#config-features)-config. Some features are enabled by
default, in which case you can disable them like this:

```javascript
const grid = new Grid({
    features : {
        sort  : false,
        group : false
    }
});
```

Others require you to enable them:

```javascript
const grid = new Grid({
    features : {
        filter    : true,
        quickFind : true
    }
});
```

Some features have configuration options (see the API docs for each feature for the options). In such cases you can
specify an configuration object instead of `true`:

```javascript
const grid = new Grid({
    features : {
        filter : { // Default filter, configuration object
            property : 'city',
            name     : 'Stockholm'
        },
        sort   : 'name' // Sort by name, configuration shortcut using string
    }
});
```

If you need to access a feature at runtime, they are available through the `features` property on Grid:

```javascript
grid.features.search.gotoNextHit();
```

If you want to create a custom feature, head over to the [Creating custom features](#Core/guides/advanced/customfeatures.md) guide.

## Built-in features

Grid itself has lots of built-in core functionality such rendering of cells, selection and keyboard navigation. On top 
of that, it ships with the features described below, some of which are enabled by default and others that have to be
enabled manually.

### AI ([API docs](#Grid/feature/AI))

This feature provides an AI agent for Grid which allows the user to use natural language to interact with the Grid in
different ways. The feature and all its related components are marked as **experimental** and are subject to change.

This feature is **disabled** by default.

### AIFilter ([API docs](#Grid/feature/ai/AIFilter))

Natural language filter tool

This feature is **disabled** by default.

### CellCopyPaste ([API Docs](#Grid/feature/CellCopyPaste))

Allows using <code>[Ctrl/CMD + C]</code>, <code>[Ctrl/CMD + X]</code> and <code>[Ctrl/CMD + V]</code> to cut, copy and
paste cell or cell ranges. Also makes cut, copy and paste actions available via the cell context menu.

This feature is **disabled** by default.

### CellEdit ([API docs](#Grid/feature/CellEdit))

Inline editing of cell values.

This feature is **enabled** by default.

Double click a cell to start editing:

<div class="external-example" data-file="Grid/guides/features/CellEdit.js"></div>

### RowEdit ([API docs](#Grid/feature/RowEdit))

Editing of a record in a side docked editing panel.

This feature is **disabled** by default.

Double click a cell to start editing:

<div class="external-example" data-file="Grid/guides/features/RowEdit.js"></div>

### CellTooltip ([API docs](#Grid/feature/CellTooltip))

Display per cell tooltips that can contain record data.

This feature is **disabled** by default.

Hover a cell below to see it in action:

<div class="external-example" data-file="Grid/guides/features/CellTooltip.js"></div>

### Charts ([API docs](#Grid/feature/Charts))

Design charts based on grid data.

This feature is **disabled** by default.

Hover a cell below to see it in action:

<div class="external-example" data-file="Grid/guides/features/Charts.js"></div>

### ColumnAutoWidth ([API Docs](#Grid/feature/ColumnAutoWidth))

Enables the `autoWidth` config for a grid's columns.

This feature is **enabled** by default.

### ColumnDragToolbar ([API docs](#Grid/feature/ColumnDragToolbar))

A toolbar on which column headers can be dropped to sort, group etc. Great on touch devices.

This feature is **disabled** by default, but automatically enabled on touch devices unless explicitly disabled.

Grab a column header and drag it down to show the toolbar:

<div class="external-example" data-file="Grid/guides/features/ColumnDragToolbar.js"></div>

### ColumnPicker ([API docs](#Grid/feature/ColumnPicker))

Adds item to grid header context menus to toggle column visibility.

This feature is **enabled** by default.

Right click a header to show the menu:

<div class="external-example" data-file="Grid/guides/features/ColumnPicker.js"></div>

### ColumnRename ([API Docs](#Grid/feature/ColumnRename))

Allows user to rename columns by either right-clicking column header or using keyboard shortcuts when column header is
focused.

This feature is **disabled** by default.

<div class="external-example" data-file="Grid/feature/ColumnRename.js"></div>

### ColumnReorder ([API docs](#Grid/feature/ColumnReorder))

Allows reordering columns by dragging their headers.

This feature is **enabled** by default.

Drag a header to rearrange:

<div class="external-example" data-file="Grid/guides/features/ColumnReorder.js"></div>

### ColumnResize ([API docs](#Grid/feature/ColumnResize))

Lets user resize columns by dragging their headers right hand edge.

This feature is **enabled** by default.

Try it in this demo:

<div class="external-example" data-file="Grid/guides/features/ColumnResize.js"></div>

### CellMenu ([API docs](#Grid/feature/CellMenu))

Handles context menu for cells. Other features supply items, additional items can be added in your code.

This feature is **enabled** by default.

Right click a cell in the demo below to show the menu:

<div class="external-example" data-file="Grid/guides/features/CellMenu.js"></div>

### HeaderMenu ([API docs](#Grid/feature/HeaderMenu))

Handles context menu for headers. Other features supply items, additional items can be added in your code.

This feature is **enabled** by default.

Right click a header in the demo below to show the menu:

<div class="external-example" data-file="Grid/guides/features/HeaderMenu.js"></div>

### ExcelExporter ([API Docs](#Grid/feature/experimental/ExcelExporter))

A feature that allows exporting Grid data to Excel or CSV without involving the server.

This feature is **disabled** by default.

### FileDrop ([API Docs](#Grid/feature/experimental/FileDrop))

An experimental feature that lets users drop files on a Widget. The widget fires an event when a file is dropped onto
it. In the event, you get access to the raw files as strings, that were parsed by calling `readAsBinaryString`.

This feature is **disabled** by default.

### FillHandle ([API Docs](#Grid/feature/FillHandle))

This feature adds a fill handle to a Grid range selection, which when dragged, fills the cells being dragged over with
values based on the values in the original selected range. This is similar to functionality normally seen in various
spreadsheet applications.

This feature is **disabled** by default.

<div class="external-example" data-file="Grid/feature/FillHandle.js"></div>

### Filter ([API docs](#Grid/feature/Filter))

Enables the user to filter rows, either by using the cell context menu or through headers.

This feature is **disabled** by default.

Right click a cell or click the icon in a header in the demo below to see the options:

<div class="external-example" data-file="Grid/guides/features/Filter.js"></div>

### FilterBar ([API docs](#Grid/feature/FilterBar))

Similar to the Filter feature, but displays fields for filtering directly in the headers.

This feature is **disabled** by default.

Try it out in this demo:

<div class="external-example" data-file="Grid/guides/features/FilterBar.js"></div>

### Group ([API docs](#Grid/feature/Group))

Allows grouping of rows in the Grid. Groups consists of all rows with the same value in the column by which the Grid is
being grouped.

This feature is **enabled** by default.

Click on group headers to expand/collapse the group:

<div class="external-example" data-file="Grid/guides/features/Group.js"></div>

### GroupSummary ([API docs](#Grid/feature/GroupSummary))

Used in combination with Group feature, displays a summary bar at the bottom of each group.

This feature is **disabled**by default.

This demo has it enabled:

<div class="external-example" data-file="Grid/guides/features/GroupSummary.js"></div>

### LockRows ([API Docs](#Grid/feature/LockRows))

A feature which pins records which fit certain criteria to the top of the grid.

This feature is **disabled** by default.

This demo has it enabled:

<div class="external-example" data-file="Grid/guides/features/LockRows.js"></div>

### MergeCells ([API Docs](#Grid/feature/MergeCells))

This feature merges cells that have the same value in sorted columns configured to `mergeCells`.

This feature is **disabled** by default.

<div class="external-example" data-file="Grid/feature/MergeCells.js"></div>

### PdfExport ([API Docs](#Grid/feature/export/PdfExport))

Generates PDF/PNG files from the Grid component.

This feature is **disabled** by default.

### PinColumns ([API Docs](#Grid/feature/PinColumns))

This feature allows users to pin columns to the start or end of the Grid. This improves data visibility and navigation
in wide datasets without requiring additional subGrid configuration. When enabled, a `Pin columns` option is added to both the column header and cell context menus.

This feature is **disabled** by default.

This demo has it enabled:

<div class="external-example" data-file="Grid/feature/PinColumns.js"></div>

### Print ([API Docs](#Grid/feature/export/Print))

Allows printing Grid contents using browser print dialog.

This feature is **disabled** by default.

### QuickFind ([API docs](#Grid/feature/QuickFind))

Quick searching within a column, just click a cell and start typing.

This feature is **disabled** by default.

Click any cell in this demo and type something:

<div class="external-example" data-file="Grid/guides/features/QuickFind.js"></div>

### RegionResize ([API docs](#Grid/feature/RegionResize))

Displays a splitter that allows the user to resize the regions when using a grid with locked & normal columns.

This feature is **disabled** by default.

Drag the splitter to resize or click the icons in it to expand/collapse:

<div class="external-example" data-file="Grid/guides/features/RegionResize.js"></div>

### RowCopyPaste ([API Docs](#Grid/feature/RowCopyPaste))

Allow using [Ctrl/CMD + C/X] and [Ctrl/CMD + V] to copy/cut and paste rows. Also makes cut, copy and paste actions
available via the cell context menu.

This feature is **enabled** by default.

### RowExpander ([API Docs](#Grid/feature/RowExpander))

Enables expanding of Grid rows by either row click or double click, or by adding a separate Grid column which renders a
button that expands or collapses the row.

This feature is **disabled** by default.

<div class="external-example" data-file="Grid/feature/RowExpander.js"></div>

### RowReorder ([API Docs](#Grid/feature/RowReorder))

Allows user to reorder rows by dragging them. To get notified about row reorder listen to `change` event on
the grid store.

This feature is **disabled** by default.

<div class="external-example" data-file="Grid/feature/RowReorder.js"></div>

### RowResize ([API Docs](#Grid/feature/RowResize))

Enables user to change row height by dragging the bottom row border.

This feature is **disabled** by default.

<div class="external-example" data-file="Grid/feature/RowResize.js"></div>

### Search ([API docs](#Grid/feature/Search))

Search has functionality for searching the grid, but it does not have any input UI. That needs to be supplied by the
application.

This feature is **disabled** by default.

This demo uses a basic text field to search from:

<div class="external-example" data-file="Grid/guides/features/Search.js"></div>

### Sort ([API docs](#Grid/feature/Sort))

Sort by a single or multiple columns, either by clicking headers or by using their context menus.

This feature is **enabled** by default.

This demo has a default sorter defined:

<div class="external-example" data-file="Grid/guides/features/Sort.js"></div>

### Split ([API Docs](#Grid/feature/Split))

This feature allows splitting the Grid into multiple views, either by using the cell context menu, or programmatically
by calling `split()`.

This feature is **disabled** by default.

<div class="external-example" data-file="Grid/feature/Split.js"></div>

### StickyCells ([API Docs](#Grid/feature/StickyCells))

A feature which pins configurable content from a grid row to the top of the grid while the row scrolls off the top but
is still visible.

This feature is **disabled** by default.

### Stripe ([API docs](#Grid/feature/Stripe))

Makes every other rows background have a different color, also hides bottom border of each row. This feature is
**disabled** by default. Grid with striped rows:

<div class="external-example" data-file="Grid/guides/features/Stripe.js"></div>

### Summary ([API docs](#Grid/feature/Summary))

Summaries defined per column are displayed in a footer bar.

This feature is **disabled** by default.

Try changing some values, it will updated the summaries:

<div class="external-example" data-file="Grid/guides/features/Summary.js"></div>

### Tree ([API docs](#Grid/feature/Tree))

Turns the grid into a tree. Requires exactly one `TreeColumn` to be present.

This feature is **disabled** by default.

If you want to use this feature, we recommend that you use `TreeGrid` instead of `Grid` since it has what is needed
included by default.

<div class="external-example" data-file="Grid/guides/features/TreeGrid.js"></div>

### TreeGroup [API Docs](#Grid/feature/TreeGroup)

A feature that allows transforming a flat dataset (or the leaves of a hierarchical) into a tree by specifying a record
field per parent level. Parents are generated based on each leaf's value for those fields.

This feature is **disabled** by default.

<div class="external-example" data-file="Grid/feature/TreeGroup.js"></div>

## Importing features from sources

A feature is registered when the application imports it. When using the regular module/umd bundle, this is done
automatically, as the bundle encapsulates all code inside. However, when utilizing sources or thin bundles, a feature
might not be imported by default. For any feature not enabled by default, it is essential to ensure that you have
imported it to be able to use it.

Example:

```javascript
import Grid from 'PATH_TO_SOURCE/Grid/view/Grid.js';
import 'PATH_TO_SOURCE/Grid/feature/Filter.js';

const grid = new Grid({
    features : {
        filter : {
            // feature config
        }
    }
});
```


<p class="last-modified">Last modified on 2026-07-22 10:39:04</p>