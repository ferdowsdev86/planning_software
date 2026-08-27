# Styling
The Bryntum Scheduler Pro is rendered in the DOM using regular HTML and CSS, and can be completely styled using CSS. It ships 
with both pre-compiled CSS bundles, and the original CSS files. The CSS includes different themes and colors, 
which can be used to alter how the SchedulerPro and its contents look.

You can also programmatically modify the appearance of cells, headers and events using renderers (depending on product).

## Styling event bars using predefined styles and colors

Bryntum Scheduler Pro ships with 10 predefined event styles, each available in 20+ predefined colors. Style and color 
can be specified for the entire Scheduler Pro, per resource or per event. Event settings overrides resource, which in 
its turn overrides the Scheduler Pro setting. The following snippet shows how to assign colors:

```javascript
// Make all events blue by default
schedulerPro.eventColor = 'blue';
// Make all events assigned to a specific resource orange:
resource.eventColor = 'orange';
// Make a single event violet:
event.eventColor = 'violet';
```

This demo has one event per available color:

<div class="external-example" data-file="SchedulerPro/guides/styling/colors.js"></div>

Event styles are assigned in a very similar way:

```javascript
/// Make all events use "outlined" style by default
schedulerPro.eventStyle  = 'outlined';
// Make all events assigned to a resource use "line" style:
resource.eventStyle = 'line';
// Make a single event "intended":
event.eventStyle    = 'intendet';
```

And this demo shows the predefined styles:

<div class="external-example" data-file="SchedulerPro/guides/styling/styles.js"></div>

Give the <a href="../examples-scheduler/eventstyles" target="_blank">Event styles</a> demo a shot if you want to try
different colors and styles.

<div class="note">

If you want to control the appearance of events using custom CSS we recommend setting both <code>eventColor</code> and
<code>eventStyle</code> to <code>null</code>. This applies very basic styling that is easier to override using CSS.

</div>

## Styling individual events using data fields

You can style individual events easily by populating a few predefined fields of the 
[EventModel](#Scheduler/model/EventModel#fields):

- [cls](#Scheduler/model/TimeSpan#field-cls) - add a CSS class to the event bar element
- [style](#Scheduler/model/TimeSpan#field-style) - inline styles for the event bar element
- [iconCls](#Scheduler/model/TimeSpan#field-iconCls) - define the icon for the event

These fields allow you to style each individually through event data.

<div class="external-example" data-file="SchedulerPro/guides/styling/styling-data.js"></div>

You can also apply styling at runtime using the
[eventRenderer](#Scheduler/view/mixin/SchedulerEventRendering#config-eventRenderer) which is described below.

## Sorting overlapping events

The vertical order (the non-timeaxis direction) of overlapping events rendered in a horizontal scheduler can be
customized by overriding
[overlappingEventSorter](#Scheduler/view/mixin/SchedulerEventRendering#config-overlappingEventSorter)
function on the scheduler.

<div class="note">

Note that the algorithms (stack, pack) that lay the events out expects them to be served in chronological order, be sure
to first sort by <code>startDate</code> to get predictable results.

</div>

For example:

```javascript
let schedulerPro = new SchedulerPro({
    overlappingEventSorter(a, b) {
        return b.startDate.getTime() - a.startDate.getTime();
    },
    /*...*/
});
```

This live demo sorts events with identical timings by color:

<div class="external-example" data-file="SchedulerPro/guides/styling/events-order.js"></div>

## Using a theme

Bryntum products have their "structural" CSS and themes separated. The structural CSS contains the basic layout and
styling shared between all themes for the product. It defines a lot of CSS variables (CSS custom properties), that the
themes then set to specific values to create the visual appearance.

The theme CSS files set CSS variables for all Bryntum products, so you can use the same theme file for all Bryntum
products.

The SchedulerPro ships with four themes, each available in light and dark variants:
- Stockholm (`stockholm-light.css` & `stockholm-dark.css`)
- Svalbard (`svalbard-light.css` & `svalbard-dark.css`)
- Visby (`visby-light.css` & `visby-dark.css`)
- Material3 (`material3-light.css` & `material3-dark.css`)
- Fluent2 (`fluent2-light.css` & `fluent2-dark.css`)

The CSS is located in the `/build` folder of the Bryntum distribution. You can include it in your project by for example
using link tags:

```html
<!-- Structural CSS -->
<link rel="stylesheet" href="build/schedulerpro.css">
<!-- Bryntum theme -->
<link rel="stylesheet" href="build/svalbard-light.css" data-bryntum-theme>
```

<div class="note">

The <code>data-bryntum-theme</code> attribute on the link tag is not strictly required, but it allows you to programmatically 
switch the theme at runtime using <code>DomHelper.setTheme()</code>.

</div>

### Comparison of themes

#### Svalbard

Our default theme, very light and minimalistic. It is designed to be easy on the eyes and to not distract from the data.

![Svalbard Light theme](SchedulerPro/themes/thumb.svalbard-light.png "Svalbard Light theme")
![Svalbard Dark theme](SchedulerPro/themes/thumb.svalbard-dark.png "Svalbard Dark theme")

#### Stockholm

The Stockholm theme was our default theme prior to v7.0. It has been updated with a more modern look and feel.

![Stockholm Light theme](SchedulerPro/themes/thumb.stockholm-light.png "Stockholm Light theme")
![Stockholm Dark theme](SchedulerPro/themes/thumb.stockholm-dark.png "Stockholm Dark theme")

#### Visby

The city of Visby is famous for its medieval city wall, and the Visby theme embraces that by using more borders than our
other themes.

![Visby Light theme](SchedulerPro/themes/thumb.visby-light.png "Visby Light theme")
![Visby Dark theme](SchedulerPro/themes/thumb.visby-dark.png "Visby Dark theme")

#### Material3

The Material3 theme is based on Google's Material Design. It is a modern and clean theme that is slightly more colorful
than our Svalbard theme.

![Material3 Light theme](SchedulerPro/themes/thumb.material3-light.png "Material Light theme")
![Material3 Dark theme](SchedulerPro/themes/thumb.material3-dark.png "Material Dark theme")

#### Fluent2

The Fluent2 theme is based on Microsoft's Fluent Design System. It features rounded corners, subtle depth, and a 
polished modern aesthetic with balanced use of color and spacing.

![Fluent2 Light theme](SchedulerPro/themes/thumb.fluent2-light.png "Fluent2 Light theme")
![Fluent2 Dark theme](SchedulerPro/themes/thumb.fluent2-dark.png "Fluent2 Dark theme")

In most of the included examples you can switch theme on the fly by clicking on the gear icon found in the header and
then picking a theme in the dropdown.

![Change theme](SchedulerPro/changing-theme.png "Change theme")

### Combining products

The structural CSS described above include all the CSS you need to use SchedulerPro and its helper widgets such as Popups,
TextFields and so on. When combining multiple different Bryntum products on a single page using normal structural CSS, 
the shared styling will be included multiple times.

To avoid this, each product's structural CSS is available in a version that only contains the CSS specific for that
product. These are called `thin` CSS bundles (e.g. `schedulerpro.thin.css`). 

When using them you will need to include one for each used level in the Bryntum product hierarchy 
(`Scheduler Pro` ->`Core` + `Grid` + `Scheduler` + `Scheduler Pro`).

For example to combine Calendar and Scheduler Pro using the Svalbard Light theme, you would include:

- `core.thin.css`
- `grid.thin.css`
- `scheduler.thin.css`
- `schedulerpro.thin.css`
- `calendar.thin.css`
- `svalbard-light.css`

Which in your html file might look something like this:

```html
<link rel="stylesheet" href="core.thin.css" >
<link rel="stylesheet" href="grid.thin.css">
<link rel="stylesheet" href="scheduler.thin.css">
<link rel="stylesheet" href="schedulerpro.thin.css">
<link rel="stylesheet" href="calendar.thin.css">
<link rel="stylesheet" href="svalbard-light.css" data-bryntum-theme>
```

<div class="note">

Nothing prevents you from always using thin CSS bundles, but please note that there might be a slight network overhead 
from pulling in multiple CSS files as opposed to a single one with the normal CSS.

</div>

## Creating a custom theme

To create your own theme, get the [distribution bundle](#SchedulerPro/guides/download.md) or install the NPM package as usual and follow these steps:

* (Optional) Make a copy of an existing theme found under `build/` (either in package under the `node_modules` folder or 
  in the extracted zip), for example the `svalbard-light.css` file. If you pick the theme that is closest to what you 
  want, you will have to change less. You can also start from scratch, but it will be more work.
* Edit the variables in it to suit your needs, and add any additional variables you want to tweak. You can reference all 
  the available variables in the API documentation for each widget, or by looking at the CSS files in the `lib` folder.
* Include your theme on page (and remove any default theme you where using).

Depending on the import order of your CSS files, you might need to make the theme's variables more specific than the
structural CSS. If for example this does not alter the variables as you would expect:

```css
:root {
    --b-button-outlined-border-color : lightsalmon;
}
```

It might be because the structural CSS is included after your theme, and it sets the variable to a different value. In
that case, you can either alter the inclusion order (if you have control over the build process), or make your variables
more specific:

```css
/* The :not rule can contain anything, its purpose is only to make this rule */ 
/* more specific */
:root:not(.b-nothing) {
  --b-button-outlined-border-color : lightsalmon;
}

/* Another (less flexible) option is to scope it to a specific selector */
.b-button {
  --b-button-outlined-border-color : lightsalmon;
}
```

Scheduler Pro also uses variables from `grid-sass` and `scheduler-sass`, found at `node_modules/@bryntum/schedulerpro/source/resources/[grid/scheduler]-sass/variables.scss`

Please see the <a href="../examples-scheduler/custom-theme/" target="_blank">
Custom theme example</a> for a custom theme in action:

![Custom theme](SchedulerPro/themes/thumb.custom.png "Custom theme")

## Overriding an existing theme

As an alternative to creating a full custom theme, you can also just override a few variables in an existing theme.
To do so, include the structural CSS and the theme you want to use, and then add your own CSS file that overrides
the variables you want to change.

```html
<!-- Structural CSS -->
<link rel="stylesheet" href="build/schedulerpro.css">
<!-- Bryntum theme -->
<link rel="stylesheet" href="build/svalbard-light.css" data-bryntum-theme>
<!-- Your customizations -->
<link rel="stylesheet" href="path/to/your/customizations.css">
```

In `customizations.css`, you can then override any variables you want to change:

```css
:root {
    /* Everything looks good in lightsalmon */
    --b-button-outlined-border-color : lightsalmon;
}
```

## Switching theme at runtime

You can also add a combo box (or other UI) that lets you change the theme at run-time, similar to the examples we have.
To do so, ensure you have multiple themes in a folder (e.g. `/themes`).

<div class="note">

If you're using custom themes, ensure that you change their names in the <code>.b-theme-info</code> block in the CSS file to avoid
collisions.

</div>

Next, you need to add a combo box using `tbar`.

```javascript
import { SchedulerPro, DomHelper } from '@bryntum/schedulerpro';
const schedulerpro = new SchedulerPro({
    // ...schedulerpro data
    tbar : [
        {
            type  : 'combo',
            // list of themes shown in the drop down (combo box)
            items : [
                { text : 'Svalbard Light', value : 'svalbard-light' },
                { text : 'Svalbard Dark', value : 'svalbard-dark' },
                { text : 'Visby-Light', value : 'visby-light' },
                { text : 'Visby-Dark', value : 'visby-dark' }
                // More themes...
            ],
            label : 'Theme',
            // default theme
            value : 'svalbard-light',
            // change theme on selection
            onAction(props) {
                DomHelper.setTheme(props.value);
            }
        }
    ]
});
```

With that being set up, you can switch themes within your application.

## Customizing the event bar HTML contents

It is easy to show any HTML structure inside an event bar using
the [eventRenderer](#Scheduler/view/mixin/SchedulerEventRendering#config-eventRenderer).

```javascript
const schedulerPro = new SchedulerPro({
    appendTo : 'container',

    columns : [
        { text : 'Name', field : 'name' }
    ],

    eventRenderer : ({ eventRecord, renderData }) => {
        const value = eventRecord.percentDone || 0;

        // Add an extra element to the children of the container, to display a progress bar.
        // In a real app, you should avoid having inline styles and instead style using the CSS class
        renderData.children.push({
            text      : `${eventRecord.name} ${value}%`,
            className : 'percentBar',
            style     : {
                position           : 'absolute',
                width              : `${value}%`,
                height             : '100%',
                display            : 'flex',
                'background-color' : 'rgba(255, 255, 255, 0.25)',
                'padding-left'     : '1em',
                'align-items'      : 'center'
            }
        });
    }
});
```

<div class="external-example" data-file="SchedulerPro/guides/styling/eventrenderer.js"></div>

## Controlling output using column renderers, event renderer and CSS

Contents of grid cells, header cells and events can be fully customized using 'renderers'. Renderers are functions with
access to a the data used output grid cells / header cells / events (such as style and CSS classes, and in some cases
elements). They can manipulate the data to alter appearances or return a value to have it displayed.

In the demo below, we use the following APIs:

* [Resource `cls` field](#Scheduler/model/ResourceModel#field-cls) - To provide row specific styling
* [Column cell renderer](#Grid/column/Column#config-renderer) - To output custom cell content
* [Column header renderer](#Grid/column/Column#config-headerRenderer) - To add special text in column header
* [Time Axis cell renderer](#Scheduler/preset/ViewPresetHeaderRow#config-renderer) - To show a sad emoji on the most
  boring day week of the day (Monday)
* [Event bar renderer](#Scheduler/view/mixin/SchedulerEventRendering#config-eventRenderer) - To output custom text
  into
  the event bar

<div class="external-example" data-file="SchedulerPro/guides/styling/renderers.js"></div>

```javascript
const schedulerPro = new SchedulerPro({
    viewPreset : {
        base    : 'weekAndDayLetter',
        headers : [
            {
                unit       : 'week',
                dateFormat : 'ddd DD MMM YYYY', // Mon 01 Jan 2017
            },
            {
                unit     : 'day',
                renderer : (start, end, headerConfig, index) => {
                    if (start.getDay() === 1) {
                        headerConfig.headerCellCls = "blue-monday";
                        return '☹️';
                    }

                    return DateHelper.format(start, 'd1');
                }
            }
        ]
    },
    columns    : [
        {
            text       : 'Name',
            field      : 'name',
            width      : 160,
            htmlEncode : false,
            // Custom header renderer
            headerRenderer : ({ column }) => column.text.toUpperCase() + '!',
            // Custom cell renderer
            renderer({ record, value }) {
                return `<i class="fa fa-${record.gender}"></i>${value}`;
            }
        }
    ],

    // Custom event renderer, simple version
    eventRenderer({ eventRecord, tplData }) {
        // Inline style
        tplData.style = 'font-weight: bold; border-radius: 3px';
        // Add CSS class
        tplData.cls.add('my-custom-css');

        // Return the text to display
        return 'Activity: ' + eventRecord.name;
    }
});
```

## Styling dependency lines

You can easily customize the arrows drawn between events when using the Dependencies feature. To change all arrows,
apply
the following basic SVG CSS:

```css
.b-sch-dependency {
    stroke-width : 2;
    stroke       : red;
}

.b-sch-dependency-arrow {
    fill : red;
}
```

To style an individual dependency line, you can provide a [cls](#Scheduler/model/DependencyModel#field-cls) in your
data:

```json
{
  "id": 9,
  "from": 7,
  "to": 8,
  "cls": "special-dependency"
}
```

```scss
// Make line dashed 
.b-sch-dependency {
    stroke-dasharray : 5, 5;
}
```

## Other useful configs

There are a few other configs worth mentioning to affect the styling of your Scheduler Pro events:

* `barMargin`, distance between overlapping events within a resource
  ([docs](#Scheduler/view/mixin/TimelineEventRendering#config-barMargin))
  ([demo](../examples-scheduler/rowheight))
* `resourceMargin`, distance between the first and last event and the resources borders
  ([docs](#Scheduler/view/mixin/SchedulerEventRendering#config-resourceMargin))
  ([demo](../examples-scheduler/rowheight))
* `eventLayout`, determines if overlapping events stack, pack or simply overlap
  ([docs](#Scheduler/view/mixin/SchedulerEventRendering#config-eventLayout))
  ([demo](../examples-scheduler/layouts))

```javascript
 const schedulerPro = new SchedulerPro({
    barMargin      : 3,
    resourceMargin : 15,
    eventLayout    : 'pack',
    /*...*/
});
```

# Learn more

Some more information can be found in the following blog posts:

* [Styling your tasks, part 1](https://bryntum.com/blog/styling-your-tasks-part-1-built-in-styling)
* [Styling your tasks, part 2](https://bryntum.com/blog/styling-your-tasks-part-2-custom-styling)

Happy styling :)

## Troubleshooting

### CSS mismatched version

If you've encountered a CSS error:

```plaintext
CSS version 7.0.0 doesn't match bundle version 7.3.4!
Make sure you have imported css from the appropriate product version.
```

That means you're using a wrong version of Bryntum theme file. Following are some of the ways to check and fix the issue:

#### Verify CSS version

Ensure that the CSS file being used matches the version of the Bryntum API. For example, if you're using version
`7.3.4` of SchedulerPro, you need to have the CSS files of version `7.3.4`.

#### Clear Cache

Ensure the mismatched CSS file is not cached on your web server to prevent outdated files from being served.
Clear the browser cache to ensure the latest CSS file is loaded.

#### Cache Busting

Cache busting is a technique used to force browsers to load the most recent versions of files. If the CSS file is 
imported in `index.html`, then it should have cache busting by specifying the version
(`schedulerpro.css?v=7.3.4`) or use timestamps (`schedulerpro.css?1704085200`).

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your SchedulerPro App</title>
    <link rel="stylesheet" href="path/to/stylesheet.css?v=1.2.3"> <!-- Cache busting by specifying version -->
</head>
<body>
    <!-- Your content here -->
</body>
</html>
```

Modern frameworks apply this by default to the production code, but it needs to be manually implemented in vanilla 
JavaScript projects.


<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>