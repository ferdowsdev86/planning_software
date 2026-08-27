<h1 class="title-with-image"><img src="Core/logo/angular.svg" alt="Bryntum Scheduler supports Angular"/>
Using Bryntum Scheduler with Angular</h1>

## Version requirements

Minimum supported:

 * Angular: `9.0.0` or higher
 * TypeScript: `3.6.0` or higher (for TypeScript application)

Recommended:

 * Angular: `12.0.0` or higher
 * TypeScript: `4.0.0` or higher (for TypeScript application)

## Bryntum npm repository access

Please refer to this [guide for Bryntum npm repository access](#Scheduler/guides/npm/repository/private-repository-access.md).

## Bryntum Scheduler

While Bryntum Scheduler is designed to work with any framework, it ships with demos and wrappers to simplify 
integration with popular frameworks like Angular. 

This guide provides a basic introduction to using Bryntum Scheduler with Angular.

## View online demos

Visit our [online example browser](https://bryntum.com/products/scheduler/examples/?framework=angular) to view demos of Bryntum Scheduler with Angular.

## IVY and View Engine wrappers

Bryntum Scheduler comes with two npm Angular wrapper packages to support different versions of Angular framework.

<div class="docs-tabs" data-name="angular">
<div>
    <a>IVY</a>
    <a>View Engine</a>
</div>
<div>

<code>@bryntum/scheduler-angular</code> is designed to work with Angular 12 and newer versions, which use the IVY rendering
engine. It is <strong>recommended</strong> to use this package if possible. Follow these steps to use the package:

Install the package using npm:

```shell
npm install @bryntum/scheduler-angular@7.3.4
```

Import the component in your Angular application:

```typescript
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
```

</div>
<div>

<p>
<code>@bryntum/scheduler-angular-view</code> is designed to work with Angular 11 and older versions, which use the View Engine
for rendering. If you are using one of the legacy Angular versions, you can follow these steps to use the
package:</p>

<p>Install the package using npm:</p>

```shell
npm install @bryntum/scheduler-angular-view@7.3.4
```

<p>Import the component in your Angular application:</p>

```typescript
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular-view';
```

<p>You may also install View Engine package with npm aliasing and import classes from <code>@bryntum/scheduler-angular</code>:</p>

```shell
npm install @bryntum/scheduler-angular@npm@bryntum/scheduler-angular-view@7.3.4
```

<p>Import the component in your Angular application:</p>

```typescript
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
```
</div>
</div>

<div class="note">

Do not forget to change wrapper package name accordingly when you import classes.

</div>

## Build and run local demos

Download distribution zip with demos according to this [guide](#Scheduler/guides/download.md#distribution).

Angular demos are located in **examples/frameworks/angular** folder inside distribution zip.

Each demo contains bundled `README.md` file in demo folder with build and run instructions.

To view and run an example locally in development mode, you can use the following commands:

```shell
npm install
npm run start
```

That starts a local server accessible at `http://localhost:4200`. If
you modify the example code while running it locally it is automatically rebuilt and updated in the browser allowing you
to see your changes immediately.

The production version of an example, or your application, is built by running:

```shell
npm install
npm run build
```

The built version is then located in `dist` sub-folder which contains the compiled code that can be deployed to your
production server.

The demos have been created with [Angular CLI](https://cli.angular.io/)</a>
by `ng new [example-name]` and then implemented using the Bryntum Scheduler wrappers. You can refer to an example while
studying this guide to get more information on the implementation.

## TypeScript and Typings

Bryntum bundles ship with typings for the classes for usage in TypeScript applications. You can find `scheduler*.d.ts`
files in the `build` folder inside the distribution zip package. The definitions also contain a special config type
which can be passed to the class constructor.

The config specific types are also accepted by multiple other properties and functions, for example
the [Store.data](#Core/data/Store#config-data) config of the `Store` which accepts type `ModelConfig[]`.

Sample code for tree store creation with `ModelConfig` and `StoreConfig` classes:

```typescript
import { Store, StoreConfig, ModelConfig } from '@bryntum/scheduler';

const storeConfig: StoreConfig = {
    tree : true,
    data : [
        {
            id       : 1,
            children : [
                {
                    id : 2
                }
            ] as ModelConfig[]
        }
    ] as ModelConfig[]
};

new Store(storeConfig);
```

## Wrappers

The Angular wrappers encapsulate Bryntum Scheduler and other Bryntum widgets in Angular components that expose
configuration options, properties, features and events. The wrapped all Bryntum UI components so they can be used the
usual Angular way.

To use native API package classes with wrappers import them from `@bryntum/scheduler`.

```typescript
import { Scheduler } from '@bryntum/scheduler';
```

### Installing the wrappers package

The wrappers are distributed as a separate package `@bryntum/scheduler-angular` that is installed according to the used
package manager. Please refer to this [guide for Bryntum npm repository access](#Scheduler/guides/npm/repository/private-repository-access.md).

### Wrappers Overview

Wrappers are Angular components which provide full access to Bryntum API widget class configs, properties, events and
features. Each Wrapper has its own HTML tag which can be used in angular templates. This is the list of available
wrappers for Bryntum Scheduler Angular package:

| Wrapper tag name                                | API widget reference                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------- |
| &lt;bryntum-a-i-filter-field/&gt;               | [AIFilterField](#Grid/widget/AIFilterField)                           |
| &lt;bryntum-boolean-combo/&gt;                  | [BooleanCombo](#Core/widget/BooleanCombo)                             |
| &lt;bryntum-button/&gt;                         | [Button](#Core/widget/Button)                                         |
| &lt;bryntum-button-group/&gt;                   | [ButtonGroup](#Core/widget/ButtonGroup)                               |
| &lt;bryntum-chat-panel/&gt;                     | [ChatPanel](#Core/widget/chat/ChatPanel)                              |
| &lt;bryntum-checkbox/&gt;                       | [Checkbox](#Core/widget/Checkbox)                                     |
| &lt;bryntum-checkbox-group/&gt;                 | [CheckboxGroup](#Core/widget/CheckboxGroup)                           |
| &lt;bryntum-checklist-filter-combo/&gt;         | [ChecklistFilterCombo](#Grid/widget/ChecklistFilterCombo)             |
| &lt;bryntum-chip-view/&gt;                      | [ChipView](#Core/widget/ChipView)                                     |
| &lt;bryntum-code-editor/&gt;                    | [CodeEditor](#Core/widget/CodeEditor)                                 |
| &lt;bryntum-color-field/&gt;                    | [ColorField](#Core/widget/ColorField)                                 |
| &lt;bryntum-combo/&gt;                          | [Combo](#Core/widget/Combo)                                           |
| &lt;bryntum-container/&gt;                      | [Container](#Core/widget/Container)                                   |
| &lt;bryntum-date-field/&gt;                     | [DateField](#Core/widget/DateField)                                   |
| &lt;bryntum-date-picker/&gt;                    | [DatePicker](#Core/widget/DatePicker)                                 |
| &lt;bryntum-date-range-field/&gt;               | [DateRangeField](#Core/widget/DateRangeField)                         |
| &lt;bryntum-date-time-field/&gt;                | [DateTimeField](#Core/widget/DateTimeField)                           |
| &lt;bryntum-demo-code-editor/&gt;               | [DemoCodeEditor](#Core/widget/DemoCodeEditor)                         |
| &lt;bryntum-display-field/&gt;                  | [DisplayField](#Core/widget/DisplayField)                             |
| &lt;bryntum-duration-field/&gt;                 | [DurationField](#Core/widget/DurationField)                           |
| &lt;bryntum-editor/&gt;                         | [Editor](#Core/widget/Editor)                                         |
| &lt;bryntum-event-color-field/&gt;              | [EventColorField](#Scheduler/widget/EventColorField)                  |
| &lt;bryntum-field-filter-picker/&gt;            | [FieldFilterPicker](#Core/widget/FieldFilterPicker)                   |
| &lt;bryntum-field-filter-picker-group/&gt;      | [FieldFilterPickerGroup](#Core/widget/FieldFilterPickerGroup)         |
| &lt;bryntum-field-set/&gt;                      | [FieldSet](#Core/widget/FieldSet)                                     |
| &lt;bryntum-file-field/&gt;                     | [FileField](#Core/widget/FileField)                                   |
| &lt;bryntum-file-picker/&gt;                    | [FilePicker](#Core/widget/FilePicker)                                 |
| &lt;bryntum-filter-field/&gt;                   | [FilterField](#Core/widget/FilterField)                               |
| &lt;bryntum-grid/&gt;                           | [Grid](#Grid/view/Grid)                                               |
| &lt;bryntum-grid-base/&gt;                      | [GridBase](#Grid/view/GridBase)                                       |
| &lt;bryntum-grid-chart-designer/&gt;            | [GridChartDesigner](#Grid/widget/GridChartDesigner)                   |
| &lt;bryntum-grid-field-filter-picker/&gt;       | [GridFieldFilterPicker](#Grid/widget/GridFieldFilterPicker)           |
| &lt;bryntum-grid-field-filter-picker-group/&gt; | [GridFieldFilterPickerGroup](#Grid/widget/GridFieldFilterPickerGroup) |
| &lt;bryntum-group-bar/&gt;                      | [GroupBar](#Grid/widget/GroupBar)                                     |
| &lt;bryntum-hint/&gt;                           | [Hint](#Core/widget/Hint)                                             |
| &lt;bryntum-label/&gt;                          | [Label](#Core/widget/Label)                                           |
| &lt;bryntum-list/&gt;                           | [List](#Core/widget/List)                                             |
| &lt;bryntum-menu/&gt;                           | [Menu](#Core/widget/Menu)                                             |
| &lt;bryntum-month-picker/&gt;                   | [MonthPicker](#Core/widget/MonthPicker)                               |
| &lt;bryntum-number-field/&gt;                   | [NumberField](#Core/widget/NumberField)                               |
| &lt;bryntum-paging-toolbar/&gt;                 | [PagingToolbar](#Core/widget/PagingToolbar)                           |
| &lt;bryntum-panel/&gt;                          | [Panel](#Core/widget/Panel)                                           |
| &lt;bryntum-password-field/&gt;                 | [PasswordField](#Core/widget/PasswordField)                           |
| &lt;bryntum-progress-bar/&gt;                   | [ProgressBar](#Core/widget/ProgressBar)                               |
| &lt;bryntum-project-combo/&gt;                  | [ProjectCombo](#Scheduler/widget/ProjectCombo)                        |
| &lt;bryntum-scheduler-project-model/&gt;        | [ProjectModel](#Scheduler/model/ProjectModel)                         |
| &lt;bryntum-radio/&gt;                          | [Radio](#Core/widget/Radio)                                           |
| &lt;bryntum-radio-group/&gt;                    | [RadioGroup](#Core/widget/RadioGroup)                                 |
| &lt;bryntum-resource-combo/&gt;                 | [ResourceCombo](#Scheduler/widget/ResourceCombo)                      |
| &lt;bryntum-resource-filter/&gt;                | [ResourceFilter](#Scheduler/widget/ResourceFilter)                    |
| &lt;bryntum-scheduler/&gt;                      | [Scheduler](#Scheduler/view/Scheduler)                                |
| &lt;bryntum-scheduler-base/&gt;                 | [SchedulerBase](#Scheduler/view/SchedulerBase)                        |
| &lt;bryntum-scheduler-date-picker/&gt;          | [SchedulerDatePicker](#Scheduler/widget/SchedulerDatePicker)          |
| &lt;bryntum-slider/&gt;                         | [Slider](#Core/widget/Slider)                                         |
| &lt;bryntum-slide-toggle/&gt;                   | [SlideToggle](#Core/widget/SlideToggle)                               |
| &lt;bryntum-splitter/&gt;                       | [Splitter](#Core/widget/Splitter)                                     |
| &lt;bryntum-tab-panel/&gt;                      | [TabPanel](#Core/widget/TabPanel)                                     |
| &lt;bryntum-text-area-field/&gt;                | [TextAreaField](#Core/widget/TextAreaField)                           |
| &lt;bryntum-text-area-picker-field/&gt;         | [TextAreaPickerField](#Core/widget/TextAreaPickerField)               |
| &lt;bryntum-text-field/&gt;                     | [TextField](#Core/widget/TextField)                                   |
| &lt;bryntum-time-field/&gt;                     | [TimeField](#Core/widget/TimeField)                                   |
| &lt;bryntum-timeline-histogram/&gt;             | [TimelineHistogram](#Scheduler/view/TimelineHistogram)                |
| &lt;bryntum-time-picker/&gt;                    | [TimePicker](#Core/widget/TimePicker)                                 |
| &lt;bryntum-time-zoom-slider/&gt;               | [TimeZoomSlider](#Scheduler/widget/TimeZoomSlider)                    |
| &lt;bryntum-toolbar/&gt;                        | [Toolbar](#Core/widget/Toolbar)                                       |
| &lt;bryntum-tree-combo/&gt;                     | [TreeCombo](#Grid/widget/TreeCombo)                                   |
| &lt;bryntum-tree-grid/&gt;                      | [TreeGrid](#Grid/view/TreeGrid)                                       |
| &lt;bryntum-undo-redo/&gt;                      | [UndoRedo](#Scheduler/widget/UndoRedo)                                |
| &lt;bryntum-view-preset-combo/&gt;              | [ViewPresetCombo](#Scheduler/widget/ViewPresetCombo)                  |
| &lt;bryntum-widget/&gt;                         | [Widget](#Core/widget/Widget)                                         |
| &lt;bryntum-year-picker/&gt;                    | [YearPicker](#Core/widget/YearPicker)                                 |

### Import BryntumSchedulerModule

Add the following code to your `app.module.ts`:

```typescript
import { BryntumSchedulerModule } from '@bryntum/scheduler-angular'

@NgModule({
    imports : [
        BryntumSchedulerModule
    ]
})
```

Then you will be able to use the custom tag like `<bryntum-scheduler>` and others listed above the same way as you use
your application components. Our examples are built this way so you can refer to them to see how to use the tag and how
to pass parameters.

### Using the wrapper in your application

Now you can use the component defined in the wrapper in your application:

```html
<bryntum-scheduler
    #scheduler
    tooltip = "My cool Bryntum Scheduler component",
    (onCatchAll) = "onSchedulerEvents($event)"
    // other configs, properties, events or features
></bryntum-scheduler>
```

You will also need to import the structural CSS and a theme for Bryntum Scheduler, and if you are not replacing
the icons used by the component, you will also need to include Font Awesome. We recommend doing it in
`src/styles.scss`:

```typescript
// FontAwesome is used for icons
@import "@bryntum/scheduler/fontawesome/css/fontawesome.css";
@import "@bryntum/scheduler/fontawesome/css/solid.css";
// Structural CSS
@import "@bryntum/scheduler/scheduler.css";
// Bryntum theme of your choice
@import "@bryntum/scheduler/material3-light.css";

// other application-global styling
```

### Embedding widgets inside wrapper

Wrappers are designed to allow using Bryntum widgets as Angular components, but they themselves cannot contain other
Bryntum wrappers inside their tag. To embed Bryntum widgets inside a wrapper, you should instead use the available
configuration options for the wrapper's widget. Please note that not all widgets may contain inner widgets, please refer
to the API docs to check for valid configuration options.

This example shows how to use a `Toolbar` widget inside the wrapper for Bryntum Scheduler:

Sample code for `app.component.ts`:

```typescript
export class AppComponent {

    // Toolbar (tbar) config
    tbarConfig = {
        items : {
            myButton : {
                type : 'button',
                text : 'My button'
            }
        }
    }

}
```

Sample code for `app.component.html`:

```html
<bryntum-scheduler
    #scheduler
    [tbar]="tbarConfig"
></bryntum-scheduler>
```

## View Encapsulations

Angular provides 3 options for `ViewEncapsulation`: `Emulated` (default), `None` and `ShadowDom`, two of which are fully
supported by Bryntum.

### View Encapsulation.Emulated

The default encapsulation, when active, modifies styles defined and imported in the component's (s)css file so that
styles do not leak into the rest of the application. The Bryntum theme imported therein is also modified. For example:

```css
.b-button {
  color : var(--b-color-blue);
}
```

is changed to:

```css
.b-button[_ngcontent-ng-c2992155993] {
    color : var(--b-color-blue);
}
```

Should the `b-button` CSS class be used in the component's html template, the class name would be changed as well and it
would become `.b-button[_ngcontent-ng-c2992155993]`. The scope of css classes is this way scoped to the component only.

The problem here is that the html of Bryntum Scheduler is not generated by Angular but by the underlying JavaScript code.
Therefore, the modified CSS classes are not understood and the Scheduler is not styled at all.

The solution would be to import Bryntum Scheduler theme in `styles.scss` which makes it global when no CSS class name
mangling takes place so they are understood and properly applied to Bryntum Scheduler. The styles defined in component's
(s)css file are still scoped to the component only and can be used for html which is not Scheduler.

This is a partial support.

### ViewEncapsulation.None

This is the easiest way because no modification of CSS classes takes place so the Bryntum Scheduler theme can be imported either in `styles.scss` or in component's (s)css file.

This is the full support.

### ViewEncapsulation.ShadowDom

If this encapsulation method is used, Bryntum Scheduler is generated into a shadow root element and therefore there are several things to do at the application level to make it working fully. First of all, the Bryntum Scheduler theme **has to be imported in the component's (s)css file**. The reason for it is that Angular then ensures the styles are copied from the theme file to the shadow root element from where they are applied to the Scheduler.

The only remaining problem to solve is fonts. Fonts are not copied and reference to them is broken by copying styles to shadow root. This can be solved in either of the following two ways.

#### Add Font Faces to `styles.scss`:

```css
@font-face {
    font-family : Roboto;
    font-style  : normal;
    font-weight : 400;
    src         :
        url("../node_modules/@bryntum/scheduler/fonts/Roboto-Regular.woff2") format("woff2"),
        url("../node_modules/@bryntum/scheduler/fonts/Roboto-Regular.woff") format("woff");
}

@font-face {
    font-family  : "Font Awesome 6 Free";
    font-style   : normal;
    font-weight  : 900;
    font-display : block;
    src          :
        url("../node_modules/@bryntum/scheduler/fonts/fa-solid-900.woff2") format("woff2"),
        url("../node_modules/@bryntum/scheduler/fonts/fa-solid-900.ttf") format("truetype");
}
```

This approach is used in [Scheduler Animations demo](https://bryntum.com/products/scheduler/examples/frameworks/angular/animations/). This demo also shows how to access the shadow root element in the code.

#### Add Font Faces in `ngAfterViewInit`:

You can also add the required font faces at runtime:

```typescript
    ngAfterViewInit(): void {
        // The following lines are only needed for ViewEncapsulation.ShadowDom
        document.fonts.add(new FontFace('FontAwesome6Free', `url(assets/fonts/fa-solid-900.woff2)`));
        document.fonts.add(new FontFace('Roboto', `url(assets/fonts/Roboto-Regular.woff2)`));
    }
```

You will also need to modify the default `tsconfig.json` file to add `DOM.Iterable`:

```json
  "compilerOptions": {
    // other options
    "lib": [
      "ES2022",
      "dom",
      "DOM.Iterable"
    ]
```

The last thing to add is fonts directory to assets in `angular.json`:

```json
// other options
"assets": [
    "src/assets",
    {
        "glob": "**/*",
        "input": "node_modules/@bryntum/scheduler/fonts",
        "output": "assets/fonts"
    },
]
```

This approach is used in [Scheduler Basic demo](https://bryntum.com/products/scheduler/examples/frameworks/angular/basic/).

## Using Angular components as renderers

To use an Angular component as column renderer, header renderer, tooltip renderer or any other renderer, create a
component first (`src/app/tooltip-renderer/tooltip-renderer.component.ts`)

```typescript
/**
 * Tooltip renderer component
 */
import { Component, Input } from '@angular/core';

@Component({
    selector : 'event-tooltip-renderer',
    template : `
        <h3>Custom tooltip</h3>
        <p>Destination : {{ destination }}</p>
    `
})
export class EventRendererComponent {

    @Input() destination : string;

}
```

Next, inject the custom element in the `src/app/app.module.ts`

```typescript
// The component used for custom tag definition
import { ToolTipRenderer } from './tooltip-renderer/tooltip-renderer.component';

// Function to create the custom element
import { createCustomElement } from '@angular/elements';

// ... other required imports

@NgModule({
    declarations : [
        AppComponent,
        ToolTipRenderer
    ],
    // These component(s) will be converted to Custom Elements
    entryComponents : [
        ToolTipRenderer
    ],
    imports : [
        BrowserModule,
        BryntumSchedulerModule
    ],
    providers : [],
    bootstrap : [AppComponent]
})

export class AppModule {
    constructor(injector: Injector) {
        // convert Angular Component to Custom Element and register it with browser
        customElements.define('tooltip-renderer', createCustomElement(ToolTipRenderer, { injector }));
    }
}
```

The above renderer can be then used, for example, as a tooltip renderer:

```typescript
features : {
    // enable CellTooltip and configure a default renderer
    cellTooltip : {
        tooltipRenderer : ({ record, column }) => {
            return `
            <tooltip-renderer
            destination="${record.destination}">
            </tooltip-renderer>
            `
        }
    }
},
```

Similarly, if you've custom component for column's renderer:

```typescript
columns : [
    {
        text       : 'Angular Component',
        field      : 'color',
        htmlEncode : false, // to prevent encoding of renderer output
        renderer(data: any) {
            const { record, value } = data;
            // Use registered Custom Element tag name and pass it attributes
            return `<color-renderer value="${value.toLowerCase()}" name="${record.name}"></color-renderer>`;
        }
    }
]
```

This approach is used in
[Grid Angular Renderer demo](https://bryntum.com/products/grid/examples/frameworks/angular/angular-renderer/)
and [Scheduler Angular Booking demo](https://bryntum.com/products/scheduler/examples/frameworks/angular/booking).
The renderers are used the same way also for Scheduler, Gantt, Calendar and others.

## Configs, properties and events

All Bryntum Angular Wrappers support the full set of the public configs, properties and events of a component.

## Features

Features are suffixed with `Feature` and act as both configs and properties for `BryntumSchedulerComponent`. They are
mapped to the corresponding API features of the Bryntum Scheduler `instance`.

This is a list of all `BryntumSchedulerComponent` features:

| Wrapper feature name         | API feature reference                                             |
| ---------------------------- | ----------------------------------------------------------------- |
| aiFeature                    | [AI](#Scheduler/feature/AI)                                       |
| aiFilterFeature              | [AIFilter](#Grid/feature/ai/AIFilter)                             |
| cellCopyPasteFeature         | [CellCopyPaste](#Grid/feature/CellCopyPaste)                      |
| cellEditFeature              | [CellEdit](#Grid/feature/CellEdit)                                |
| cellMenuFeature              | [CellMenu](#Grid/feature/CellMenu)                                |
| cellTooltipFeature           | [CellTooltip](#Grid/feature/CellTooltip)                          |
| chartsFeature                | [Charts](#Grid/feature/Charts)                                    |
| columnAutoWidthFeature       | [ColumnAutoWidth](#Grid/feature/ColumnAutoWidth)                  |
| columnDragToolbarFeature     | [ColumnDragToolbar](#Grid/feature/ColumnDragToolbar)              |
| columnLinesFeature           | [ColumnLines](#Scheduler/feature/ColumnLines)                     |
| columnPickerFeature          | [ColumnPicker](#Grid/feature/ColumnPicker)                        |
| columnRenameFeature          | [ColumnRename](#Grid/feature/ColumnRename)                        |
| columnReorderFeature         | [ColumnReorder](#Grid/feature/ColumnReorder)                      |
| columnResizeFeature          | [ColumnResize](#Grid/feature/ColumnResize)                        |
| dependenciesFeature          | [Dependencies](#Scheduler/feature/Dependencies)                   |
| dependencyEditFeature        | [DependencyEdit](#Scheduler/feature/DependencyEdit)               |
| dependencyMenuFeature        | [DependencyMenu](#Scheduler/feature/DependencyMenu)               |
| eventCopyPasteFeature        | [EventCopyPaste](#Scheduler/feature/EventCopyPaste)               |
| eventDragFeature             | [EventDrag](#Scheduler/feature/EventDrag)                         |
| eventDragCreateFeature       | [EventDragCreate](#Scheduler/feature/EventDragCreate)             |
| eventDragSelectFeature       | [EventDragSelect](#Scheduler/feature/EventDragSelect)             |
| eventEditFeature             | [EventEdit](#Scheduler/feature/EventEdit)                         |
| eventFilterFeature           | [EventFilter](#Scheduler/feature/EventFilter)                     |
| eventMenuFeature             | [EventMenu](#Scheduler/feature/EventMenu)                         |
| eventNonWorkingTimeFeature   | [EventNonWorkingTime](#Scheduler/feature/EventNonWorkingTime)     |
| eventResizeFeature           | [EventResize](#Scheduler/feature/EventResize)                     |
| eventTooltipFeature          | [EventTooltip](#Scheduler/feature/EventTooltip)                   |
| excelExporterFeature         | [ExcelExporter](#Scheduler/feature/experimental/ExcelExporter)    |
| fileDropFeature              | [FileDrop](#Grid/feature/experimental/FileDrop)                   |
| fillHandleFeature            | [FillHandle](#Grid/feature/FillHandle)                            |
| filterFeature                | [Filter](#Grid/feature/Filter)                                    |
| filterBarFeature             | [FilterBar](#Grid/feature/FilterBar)                              |
| groupFeature                 | [Group](#Grid/feature/Group)                                      |
| groupSummaryFeature          | [GroupSummary](#Scheduler/feature/GroupSummary)                   |
| headerMenuFeature            | [HeaderMenu](#Grid/feature/HeaderMenu)                            |
| headerZoomFeature            | [HeaderZoom](#Scheduler/feature/HeaderZoom)                       |
| labelsFeature                | [Labels](#Scheduler/feature/Labels)                               |
| lockRowsFeature              | [LockRows](#Scheduler/feature/LockRows)                           |
| mergeCellsFeature            | [MergeCells](#Grid/feature/MergeCells)                            |
| nonWorkingTimeFeature        | [NonWorkingTime](#Scheduler/feature/NonWorkingTime)               |
| panFeature                   | [Pan](#Scheduler/feature/Pan)                                     |
| pdfExportFeature             | [PdfExport](#Scheduler/feature/export/PdfExport)                  |
| pinColumnsFeature            | [PinColumns](#Grid/feature/PinColumns)                            |
| printFeature                 | [Print](#Scheduler/feature/export/Print)                          |
| quickFindFeature             | [QuickFind](#Grid/feature/QuickFind)                              |
| regionResizeFeature          | [RegionResize](#Grid/feature/RegionResize)                        |
| resourceColumnReorderFeature | [ResourceColumnReorder](#Scheduler/feature/ResourceColumnReorder) |
| resourceMenuFeature          | [ResourceMenu](#Scheduler/feature/ResourceMenu)                   |
| resourceTimeRangesFeature    | [ResourceTimeRanges](#Scheduler/feature/ResourceTimeRanges)       |
| rowCopyPasteFeature          | [RowCopyPaste](#Grid/feature/RowCopyPaste)                        |
| rowEditFeature               | [RowEdit](#Grid/feature/RowEdit)                                  |
| rowExpanderFeature           | [RowExpander](#Grid/feature/RowExpander)                          |
| rowReorderFeature            | [RowReorder](#Scheduler/feature/RowReorder)                       |
| rowResizeFeature             | [RowResize](#Scheduler/feature/RowResize)                         |
| scheduleContextFeature       | [ScheduleContext](#Scheduler/feature/ScheduleContext)             |
| scheduleMenuFeature          | [ScheduleMenu](#Scheduler/feature/ScheduleMenu)                   |
| scheduleTooltipFeature       | [ScheduleTooltip](#Scheduler/feature/ScheduleTooltip)             |
| scrollButtonsFeature         | [ScrollButtons](#Scheduler/feature/ScrollButtons)                 |
| searchFeature                | [Search](#Grid/feature/Search)                                    |
| simpleEventEditFeature       | [SimpleEventEdit](#Scheduler/feature/SimpleEventEdit)             |
| sortFeature                  | [Sort](#Grid/feature/Sort)                                        |
| splitFeature                 | [Split](#Scheduler/feature/Split)                                 |
| stickyCellsFeature           | [StickyCells](#Grid/feature/StickyCells)                          |
| stickyEventsFeature          | [StickyEvents](#Scheduler/feature/StickyEvents)                   |
| stripeFeature                | [Stripe](#Grid/feature/Stripe)                                    |
| summaryFeature               | [Summary](#Scheduler/feature/Summary)                             |
| timeAxisHeaderMenuFeature    | [TimeAxisHeaderMenu](#Scheduler/feature/TimeAxisHeaderMenu)       |
| timeRangesFeature            | [TimeRanges](#Scheduler/feature/TimeRanges)                       |
| timeSelectionFeature         | [TimeSelection](#Scheduler/feature/TimeSelection)                 |
| treeFeature                  | [Tree](#Grid/feature/Tree)                                        |
| treeGroupFeature             | [TreeGroup](#Grid/feature/TreeGroup)                              |
| treeSummaryFeature           | [TreeSummary](#Scheduler/feature/TreeSummary)                     |

### Configuring features

Most features are enabled by default, in which case you can disable them like this:

```javascript
const ganttProps = {
    // other config
    cellMenuFeature           : false,
    scheduleMenuFeature       : false
};
```

Others require you to enable them:

```javascript
const ganttProps = {
    // other config
    stripeFeature       : true,
    dependenciesFeature : true
};
```

To learn more about configuration, visit the feature page from the **API Feature reference** table above.

## Bryntum Scheduler API instance

It is important to know that the Angular `BryntumSchedulerComponent` is **not** the native Bryntum Scheduler instance, it is
a wrapper or an interface between the Angular application and the Bryntum Scheduler itself.

All available configs, properties and features are propagated from the wrapper down to the underlying Bryntum Scheduler
instance, but there might be situations when you want to access the Bryntum Scheduler directly. That is fully valid
approach, and you are free to do it.

### Accessing the Bryntum Scheduler instance

If you need to access Bryntum Scheduler functionality not exposed by the wrapper, you can access the Bryntum Scheduler instance
directly. Within the wrapper it is available under the `instance` property.

This simple example shows how you could use it:

app.component.html

```html
<bryntum-scheduler
    #scheduler
    tooltip = "My cool Bryntum Scheduler component"
></bryntum-scheduler>
```

Sample code for `app.component.ts`:

```typescript
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { Scheduler } from '@bryntum/scheduler';

export class AppComponent implements AfterViewInit {

    @ViewChild(BryntumSchedulerComponent, { static : false }) schedulerComponent: BryntumSchedulerComponent;

    private scheduler : Scheduler;

    @ViewChild(BryntumSchedulerComponent, { static : false }) schedulerComponent: BryntumSchedulerComponent;

    ngAfterViewInit(): void {
        // store Bryntum Scheduler isntance
        this.scheduler = this.schedulerComponent.instance;
    }
}
```

When accessing `instance` directly, use wrapper's API widget reference docs from the list above to get available configs
and properties.

## Troubleshooting

Please refer to this [Troubleshooting guide](#Scheduler/guides/integration/angular/troubleshooting.md).

## References

* Config options, features, events and methods [Bryntum Scheduler API docs](#api)
* Visit [Angular Framework Homepage](https://angular.io)
* Post your questions to [Bryntum Support Forum](https://forum.bryntum.com/)
* [Contact us](https://bryntum.com/contact/)


<p class="last-modified">Last modified on 2026-07-22 10:51:34</p>