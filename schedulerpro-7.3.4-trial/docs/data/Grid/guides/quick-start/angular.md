# Bryntum Grid: Quick start guide for Angular integration

<div class="note">

Using an AI coding assistant? Install the <a href="#Grid/guides/ai-features/mcp-server.md">Bryntum MCP server</a> to give it access to version-specific Bryntum documentation, and add the <a href="https://github.com/bryntum/skills">Bryntum skills</a> so it follows best practices when building with Bryntum.

</div>

## Try Angular demos

Bryntum Grid ships with several demo Angular applications that showcase its functionality. Each demo has been tested
and confirmed to be compatible with Node.js 20.

<div class="b-card-group-2">
<a href="https://bryntum.com/products/grid/examples/?framework=angular" class="b-card"><i class="fas fa-globe"></i>View online Angular demos</a>
<a href="#Grid/guides/integration/angular/guide.md#build-and-run-local-demos" class="b-card"><i class="fab fa-angular"></i>Build and run Angular demos</a>
</div>

## Version requirements

Minimum supported:

 * Angular: `9.0.0` or higher
 * TypeScript: `3.6.0` or higher (for TypeScript application)

Recommended:

 * Angular: `12.0.0` or higher
 * TypeScript: `4.0.0` or higher (for TypeScript application)

## Create Angular application

This quick start guide will show you how to integrate Bryntum Grid into your Angular applications.

To illustrate the integration process, we'll build a simple application that looks like the image below.

<img src="Grid/getting-started-result.png" class="b-screenshot" alt="Screenshot showing example Bryntum Grid in an Angular application">

Here's a breakdown of the process we'll follow:

1. [Access the Bryntum npm registry](##access-to-npm-registry)
2. [Create an Angular application](##create-application)
3. [Install the Bryntum Grid component](##install-component)
4. [Add the component to the application](##add-component-to-application)
5. [Apply styles](##apply-styles)
6. [Run the application](##run-the-application)

## Access to npm registry

You can try out Bryntum components for free using our public Bryntum trial packages. If you have a Bryntum license,
please refer to our [Npm Repository Guide](#Grid/guides/npm/repository/private-repository-access.md) to access the
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
ng new grid-app --no-standalone --no-routing --ssr=false
```

You can replace `grid-app` with your preferred application name.

<div class="note">
 Bryntum components render on the client side. We use <code>--ssr=false</code> to indicate that server-side rendering is not
required. 
</div>

You will be prompted to select a stylesheet format. We recommend choosing either **CSS** or **SCSS**. This guide covers
both options.

Now move to your application folder:

```shell
cd grid-app
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
npm install @bryntum/grid@npm:@bryntum/grid-trial@7.3.4 @bryntum/grid-angular@7.3.4
```

</div>
<div>

```shell
npm install @bryntum/grid@7.3.4 @bryntum/grid-angular@7.3.4
```
</div>
</div>

<div class="note">

If you're using the licensed Bryntum version, ensure that you have configured your npm properly to get access to the Bryntum packages. If not, refer to <a href="#Grid/guides/npm-repository.md">this guide</a>.

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
import { BryntumGridModule } from "@bryntum/grid-angular";
```

Next, add `BryntumGridModule` to `imports[]` :

```typescript
@NgModule({
    imports : [
        BryntumGridModule
    ]
})
```

Next, edit the `src/app/app.ts` file and replace its content with the following:

```typescript
/**
 * App component script
 */
import { Component, ViewChild } from '@angular/core';
import { BryntumGridComponent } from '@bryntum/grid-angular';
import { gridProps } from './app.config';

@Component({
    selector    : 'app-root',
    standalone  : false,
    templateUrl : './app.html',
    styleUrl    : './app.css'
})
export class App {

    gridProps = gridProps;

    @ViewChild('grid') gridComponent!: BryntumGridComponent;
}
```

If you're using SCSS styling, replace `'./app.css'` with `'./app.scss'`.

Create a `src/app/app.config.ts` file with the following content:

```typescript
import { BryntumGridProps } from '@bryntum/grid-angular';

export const gridProps: BryntumGridProps = {
    columns : [
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
            type     : 'column',
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
};
```

Finally, edit the `src/app/app.html` file and replace its content with the following:

```html
<bryntum-grid
    #grid
    [data] = "gridProps.data!"
    [columns] = "gridProps.columns!"
></bryntum-grid>
```

## Apply styles

Bryntum Grid needs a theme and structural CSS to render correctly. If you are not replacing the icons used by the
component, you will also need to include Font Awesome.

The following CSS files are provided in the Bryntum npm packages or in the `/build` folder of the distribution:

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
  "./grid.css",
  "./material3-light.css",
];
```

</div>
<div>

Edit the <code>src/styles.css</code> or <code>src/styles.scss</code> file and add the following:

```scss
/* FontAwesome is used for icons */
@import "@bryntum/grid/fontawesome/css/fontawesome.css";
@import "@bryntum/grid/fontawesome/css/solid.css";
/* Structural CSS */
@import "@bryntum/grid/grid.css";
/* Bryntum theme of your choice */
@import "@bryntum/grid/material3-light.css";
```

If you want to customize the default theme, override the relevant set of CSS variables after the import. Visit the
section on <a href="#Grid/guides/customization/styling.md#creating-a-custom-theme">creating a custom theme</a> for more info.
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

By default, the Bryntum Grid component is configured to occupy 100% of the parent DOM element 
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

## Troubleshooting

If you run into issues while setting up your Bryntum Grid component, refer to our
[troubleshooting guide for Bryntum Grid with Angular](#Grid/guides/integration/angular/troubleshooting.md).

## What to do next?

### Advanced integration with Angular

Visit our [comprehensive Angular guide](#Grid/guides/integration/angular/guide.md) to learn more about integrating
Bryntum Grid with Angular and customizing your application.

### Working with data in Bryntum Grid

Bryntum components often use multiple data collections and entities. 

For a detailed explanation of how these elements 
interact, see our [guide to displaying data in Bryntum Grid](#Grid/guides/data/displayingdata.md).



<p class="last-modified">Last modified on 2026-07-22 10:46:48</p>