# Getting Started with Bryntum Grid in JavaScript

<div class="note">

Using an AI coding assistant? Install the <a href="#Grid/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

## Try JavaScript demos

Bryntum Grid is delivered with a variety of JavaScript demo applications showing its functionality.

<div class="b-card-group-2">
<a href="https://bryntum.com/products/grid/examples/" class="b-card"><i class="fas fa-globe"></i>View online JS demos</a>
<a href="#Grid/guides/download.md#javascript-demos" class="b-card"><i class="fab fa-js"></i>View local JS demos</a>
</div>

## Create JavaScript application

In this guide we will explain how to get started if you are not using npm. If you prefer to use npm,
[please visit the dedicated Quick Start here](#Grid/guides/quick-start/javascript-npm.md).

To get started, the broad steps are as follows:

1. [Download Bryntum Grid](##download)
2. [Create Application](##create-application)
3. [Bryntum bundles](##bryntum-bundles)
4. [Add component to Application](##add-component-to-application)
5. [Apply styles](##apply-styles)
6. [Run the Application](##run-the-application)

The application we are about to build together is pretty simple, and will look like the live demo below:
<div class="external-example" data-file="Grid/guides/readme/basic.js"></div>

## Download

Bryntum Grid is a commercial product, but you can access our free trial archive with bundles and examples by
[downloading it here](https://bryntum.com/download/?product=grid).

## Create Application

You can proceed as usual. The Bryntum Grid Component is compliant with the most popular Javascript Standards.

To create an application, create a new folder and add the following to `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bryntum Grid App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

## Bryntum bundles

The Bryntum Grid distribution provides pre-build JavaScript bundles.
All bundles are transpiled with `chrome: 88` babel preset.

In distribution zip they are located under the `/build` folder.

| File                    | Contents                                                        |
|-------------------------|-----------------------------------------------------------------|
| `grid.module.js`     | Modules format bundle without WebComponents                     |
| `grid.lwc.module.js` | Modules format bundle with Lightning WebComponents (Salesforce) |
| `grid.wc.module.js`  | Modules format bundle with WebComponents                        |
| `grid.umd.js`        | UMD format bundle with WebComponents                            |

Typings for TypeScripts can be found in files with a `.d.ts` file extension.

Minified bundles are available for Licensed product version and delivered with `.min.js` suffix.

### Using EcmaScript module bundles

If you choose this option, **copy** the selected module file onto your application, in the root folder, for instance.

Create a `main.js` file, you can import the grid JavaScript.

```javascript
import { Grid } from './grid.module.js';

const grid = new Grid({/*...*/ });
```

<div class="note">

We have copied the module directly from the <code>build</code> folder for simplicity in this code example. Consider
using your preferred build tool instead.

</div>

Learn more about how to use EcmaScript modules [here](#Grid/guides/gettingstarted/es6bundle.md).

### Using `<script>` tag and UMD files

Please consider this solution as legacy and use it only for compatibility. If you choose this option, **copy** the
selected UMD file onto your application, in the root folder, for instance.

To include Bryntum Grid on your page using a plain old script tag, add a `<script>` tag pointing to the UMD bundle
file in the `<HEAD>` of your `index.html` page. Example:

```html
<script src="grid.umd.js"></script>
```

In the `main.js`, you will be able to access Grid classes in the global `bryntum` namespace as
follows:

```javascript
const grid = new bryntum.grid.Grid({/*...*/ });
```

<div class="note">

We also recommend you to copy onto your application the <code>.js.map</code> file paired with the umd file you selected.

</div>

<div class="note">

We have copied the module directly from the <code>build</code> folder for simplicity in this code example. Consider
using your preferred build tool instead.

</div>

Read more on [script tag and UMD modules...](#Grid/guides/gettingstarted/scripttag.md)

## Add component to Application

Assuming the use of an EcmaScript module bundle:

```javascript
import { Grid } from './grid.module.js';

const grid = new Grid({
    appendTo : 'app',
    columns  : [
        {
            text   : 'Name',
            field  : 'name',
            flex   : 1,
            editor : {
                type     : 'textfield',
                required : true
            }
        }, {
            text  : 'Age',
            field : 'age',
            width : 100,
            type  : 'number'
        }, {
            text  : 'City',
            field : 'city',
            flex  : 1
        }, {
            text  : 'Food',
            field : 'food',
            flex  : 1
        }, {
            text     : 'Color',
            field    : 'color',
            width    : 80,
            type     : 'color',
            renderer : ({ cellElement, value }) => {
                cellElement.style.color = value;
                cellElement.style.fontWeight = '700';
                return value;
            }
        }
    ],

    data : [
        { id : 1, name : 'Don A Taylor', age : 30, city : 'Moscow', food : 'Salad', color : 'Black' },
        { id : 2, name : 'John B Adams', age : 65, city : 'Paris', food : 'Bolognese', color : 'Orange' },
        { id : 3, name : 'John Doe', age : 40, city : 'London', food : 'Fish and Chips', color : 'Blue' },
        { id : 4, name : 'Maria Garcia', age : 28, city : 'Madrid', food : 'Paella', color : 'Green' },
        { id : 5, name : 'Li Wei', age : 35, city : 'Beijing', food : 'Dumplings', color : 'Yellow' },
        { id : 6, name : 'Sara Johnson', age : 32, city : 'Sydney', food : 'Sushi', color : 'Purple' },
        { id : 7, name : 'Lucas Brown', age : 22, city : 'Toronto', food : 'Poutine', color : 'Orange' },
        { id : 8, name : 'Emma Wilson', age : 27, city : 'Paris', food : 'Croissant', color : 'Pink' },
        { id : 9, name : 'Ivan Petrov', age : 45, city : 'St. Petersburg', food : 'Borscht', color : 'Grey' },
        { id : 10, name : 'Zhang Ming', age : 50, city : 'Shanghai', food : 'Hot Pot', color : 'Purple' },
        { id : 11, name : 'Sophia Martinez', age : 20, city : 'Mexico City', food : 'Tacos', color : 'Crimson' },
        { id : 12, name : 'Noah Smith', age : 55, city : 'Cape Town', food : 'Biltong', color : 'Turquoise' },
        { id : 13, name : 'Isabella Jones', age : 33, city : 'Rio de Janeiro', food : 'Feijoada', color : 'Magenta' },
        { id : 14, name : 'Ethan Taylor', age : 29, city : 'Chicago', food : 'Deep-Dish Pizza', color : 'Cyan' },
        { id : 15, name : 'Olivia Brown', age : 37, city : 'Berlin', food : 'Schnitzel', color : 'Maroon' },
        { id : 16, name : 'Mia Wilson', age : 26, city : 'Rome', food : 'Pasta', color : 'Olive' },
        { id : 17, name : 'Jacob Miller', age : 60, city : 'Amsterdam', food : 'Stroopwafel', color : 'Lime' },
        { id : 18, name : 'Chloe Davis', age : 23, city : 'Los Angeles', food : 'Burger', color : 'Teal' },
        { id : 19, name : 'Aiden Martinez', age : 48, city : 'Buenos Aires', food : 'Asado', color : 'Violet' },
        { id : 20, name : 'Liam Lee', age : 38, city : 'Seoul', food : 'Kimchi', color : 'Indigo' },
        { id : 21, name : 'Sophie Kim', age : 21, city : 'Tokyo', food : 'Ramen', color : 'Pink' },
        { id : 22, name : 'Alexander Nguyen', age : 41, city : 'Hanoi', food : 'Pho', color : 'Coral' },
        { id : 23, name : 'Ella Patel', age : 19, city : 'Mumbai', food : 'Curry', color : 'Amber' },
        { id : 24, name : 'James O Connor', age : 34, city : 'Dublin', food : 'Irish Stew', color : 'Green' },
        { id : 25, name : 'Isabelle Chen', age : 31, city : 'Hong Kong', food : 'Dim Sum', color : 'Brown' }
    ]
});
```

Here we are providing inline data, you can learn more about how we manage 
data using Store [in this guide](#Core/guides/data/storebasics.md).

If you want to discover how flexible the Bryntum Grid Component is, please explore 
the [API documentation](#Grid/view/Grid).

## Apply styles

### Stylesheets

You'll find a complete list of available CSS files in the `/build` folder of the distribution:

| File                              | Contents                      |
|-----------------------------------|-------------------------------|
| `grid.css`                     | Structural CSS                |
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

You'll need to copy and import the structural CSS and the preferred theme into your project for the Bryntum Grid to 
render correctly, and if you are not replacing the icons used by the component, you will also need to include Font 
Awesome. Below we assume they are in the root folder.

<div class="note">

We also recommend you to copy onto your application the <code>.css.map</code> file paired with the css file you selected.

</div>

Add link tags for the structural CSS and a theme to your `index.html` in the `<head>...</head>` section:

```html
<!-- Structural CSS -->
<link rel="stylesheet" href="grid.css">
<!-- Bryntum theme of your choice -->    
<link rel="stylesheet" href="svalbard-light.css" data-bryntum-theme>
```

Make sure to copy the `fonts/` folder located in the `/build` right next to the `.css` theme.

```bash
- my-grid-app/
  - fonts/
  - grid.css
  - svalbard-light.css
```

### Sizing the component

By default, the Bryntum Grid component is configured to occupy 100% of the parent DOM element 
with a `min-height` of `10em`.

To display the component at the appropriate size, you can, for example, set parent components to 
take up the full height of the screen.

```css
#app {
    margin         : 0;
    display        : flex;
    flex-direction : column;
    height         : 100vh;
    font-size      : 14px;
}
```

There are many other solutions depending on the situation. Feel free to adapt the code above regarding your application
layout. For more information on the topic, see this guide
[Sizing the component](https://bryntum.com/products/grid/docs/guide/Grid/basics/sizing).

## Run the application

To see the preview, start a live-server (if you are using one) or 
open the `index.html` file in your browser from your local web server.

<div class="note">

A local web server is required, viewing the app page directly from the local file system won't work.

</div>

## What to do next?

### Tutorial

Now it is time to customize your application. To get familiar with the most common tasks developers perform, we have
designed an [engaging tutorial](#Grid/guides/tutorial.md) that we are excited 
to see you follow.

### Learn about Data

Bryntum components often use multiple data collections and entities. 

For a detailed explanation of how these elements 
interact, see our [guide to displaying data in Bryntum Grid](#Grid/guides/data/displayingdata.md).

### Enabling features

Please refer to the
[enabling extra features guide](#Grid/guides/basics/features.md) 
to learn how to enhance your Grid chart with additional functionality (such as displaying labels for the tasks).

### Responsiveness

Grid can be configured to work well on many different screen sizes. This is achieved by specifying different
responsive "levels" (breakpoints) on Grid and then having per level configurations on the columns. 

If this is a
concern now, visit the  [responsive guide](#Grid/guides/customization/responsive.md) 
 to learn how to configure responsiveness.

### Localization

Bryntum Grid uses locales for translations of texts, date formats and such. This
[localization guide](#Grid/guides/customization/localization.md) 
shows you how to use one of the locales that Bryntum Grid ships with and how to create your own.



<p class="last-modified">Last modified on 2026-07-22 10:46:48</p>