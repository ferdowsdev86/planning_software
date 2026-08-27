# Styling
The Bryntum Grid is rendered in the DOM using regular HTML and CSS, and can be completely styled using CSS. It ships 
with both pre-compiled CSS bundles, and the original CSS files. The CSS includes different themes and colors, 
which can be used to alter how the Grid and its contents look.

You can also programmatically modify the appearance of cells, headers and events using renderers (depending on product).

## Using a theme

Bryntum products have their "structural" CSS and themes separated. The structural CSS contains the basic layout and
styling shared between all themes for the product. It defines a lot of CSS variables (CSS custom properties), that the
themes then set to specific values to create the visual appearance.

The theme CSS files set CSS variables for all Bryntum products, so you can use the same theme file for all Bryntum
products.

The Grid ships with four themes, each available in light and dark variants:
- Stockholm (`stockholm-light.css` & `stockholm-dark.css`)
- Svalbard (`svalbard-light.css` & `svalbard-dark.css`)
- Visby (`visby-light.css` & `visby-dark.css`)
- Material3 (`material3-light.css` & `material3-dark.css`)
- Fluent2 (`fluent2-light.css` & `fluent2-dark.css`)

The CSS is located in the `/build` folder of the Bryntum distribution. You can include it in your project by for example
using link tags:

```html
<!-- Structural CSS -->
<link rel="stylesheet" href="build/grid.css">
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

![Svalbard Light theme](Grid/themes/thumb.svalbard-light.png "Svalbard Light theme")
![Svalbard Dark theme](Grid/themes/thumb.svalbard-dark.png "Svalbard Dark theme")

#### Stockholm

The Stockholm theme was our default theme prior to v7.0. It has been updated with a more modern look and feel.

![Stockholm Light theme](Grid/themes/thumb.stockholm-light.png "Stockholm Light theme")
![Stockholm Dark theme](Grid/themes/thumb.stockholm-dark.png "Stockholm Dark theme")

#### Visby

The city of Visby is famous for its medieval city wall, and the Visby theme embraces that by using more borders than our
other themes.

![Visby Light theme](Grid/themes/thumb.visby-light.png "Visby Light theme")
![Visby Dark theme](Grid/themes/thumb.visby-dark.png "Visby Dark theme")

#### Material3

The Material3 theme is based on Google's Material Design. It is a modern and clean theme that is slightly more colorful
than our Svalbard theme.

![Material3 Light theme](Grid/themes/thumb.material3-light.png "Material Light theme")
![Material3 Dark theme](Grid/themes/thumb.material3-dark.png "Material Dark theme")

#### Fluent2

The Fluent2 theme is based on Microsoft's Fluent Design System. It features rounded corners, subtle depth, and a 
polished modern aesthetic with balanced use of color and spacing.

![Fluent2 Light theme](Grid/themes/thumb.fluent2-light.png "Fluent2 Light theme")
![Fluent2 Dark theme](Grid/themes/thumb.fluent2-dark.png "Fluent2 Dark theme")

In most of the included examples you can switch theme on the fly by clicking on the gear icon found in the header and
then picking a theme in the dropdown.

![Change theme](Grid/changing-theme.png "Change theme")

### Combining products

The structural CSS described above include all the CSS you need to use Grid and its helper widgets such as Popups,
TextFields and so on. When combining multiple different Bryntum products on a single page using normal structural CSS, 
the shared styling will be included multiple times.

To avoid this, each product's structural CSS is available in a version that only contains the CSS specific for that
product. These are called `thin` CSS bundles (e.g. `grid.thin.css`). 

When using them you will need to include one for each used level in the Bryntum product hierarchy 
(Grid -> `Core + Grid`, Scheduler -> `Core + Grid + Scheduler`).

For example to combine Grid and Scheduler using the Svalbard Light theme, you would include:

- `core.thin.css`
- `grid.thin.css`
- `scheduler.thin.css`
- `svalbard-light.css`

Which in your html file might look something like this:

```html
<link rel="stylesheet" href="core.thin.css" >
<link rel="stylesheet" href="grid.thin.css">
<link rel="stylesheet" href="scheduler.thin.css">
<link rel="stylesheet" href="svalbard-light.css" data-bryntum-theme>
```

<div class="note">

Nothing prevents you from always using thin CSS bundles, but please note that there might be a slight network overhead 
from pulling in multiple CSS files as opposed to a single one with the normal CSS.

</div>

## Creating a custom theme

To create your own theme, get the [distribution bundle](#Grid/guides/download.md) or install the NPM package as usual and follow these steps:

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

Please see the <a href="../examples/custom-theme/" target="_blank">
Custom theme example</a> for a custom theme in action:

![Custom theme](Grid/themes/thumb.custom.png "Custom theme")

## Overriding an existing theme

As an alternative to creating a full custom theme, you can also just override a few variables in an existing theme.
To do so, include the structural CSS and the theme you want to use, and then add your own CSS file that overrides
the variables you want to change.

```html
<!-- Structural CSS -->
<link rel="stylesheet" href="build/grid.css">
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
import { Grid, DomHelper } from '@bryntum/grid';
const grid = new Grid({
    // ...grid data
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

## Using renderers and CSS

Contents of both cells and header can be customized using renderers. Renderers are functions with access to a cell/headers
data and elements. They can manipulate the element directly or return a value to have it displayed.

For more information, see the demo below or check API docs for Column (you can click the <i class="b-icon b-icon-code"></i>
button top right in the demo to view the code for it).

<div class="external-example" data-file="Grid/guides/styling/renderers.js"></div>

If you want to customize the display of predefined columns (such as DateColumn, NumberColumn) but do not want to 
affect output, you can use the `afterRenderCell` method to assign CSS classes to the cell / row.

```javascript
const grid = new Grid({
    columns: [
        {
            text  : 'Date', // Can be any column to style rows
            type  : 'date',
            field : 'date',
            width : 100,
            afterRenderCell({ row, record, cellElement, value }) {
                // Add "past" CSS class to dates in the past
                cellElement.classList.toggle('past', value < Date.now());
            }
        }
    ]
});
```

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
`7.3.4` of Grid, you need to have the CSS files of version `7.3.4`.

#### Clear Cache

Ensure the mismatched CSS file is not cached on your web server to prevent outdated files from being served.
Clear the browser cache to ensure the latest CSS file is loaded.

#### Cache Busting

Cache busting is a technique used to force browsers to load the most recent versions of files. If the CSS file is 
imported in `index.html`, then it should have cache busting by specifying the version
(`grid.css?v=7.3.4`) or use timestamps (`grid.css?1704085200`).

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Grid App</title>
    <link rel="stylesheet" href="path/to/stylesheet.css?v=1.2.3"> <!-- Cache busting by specifying version -->
</head>
<body>
    <!-- Your content here -->
</body>
</html>
```

Modern frameworks apply this by default to the production code, but it needs to be manually implemented in vanilla 
JavaScript projects.


<p class="last-modified">Last modified on 2026-07-22 10:46:47</p>