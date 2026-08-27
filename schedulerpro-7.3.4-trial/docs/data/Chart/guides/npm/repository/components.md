# Components and wrappers

## Components

Bryntum components (libraries) for web applications are built using pure JavaScript and can be used in any modern web
application without requiring any special JS framework. These components are packaged as follows:

| _Component_                | _Package_                     | Description                          |
|----------------------------|-------------------------------|--------------------------------------|
| Bryntum Chart            | `@bryntum/chart`            | Full licensed component version      |
| Bryntum Chart Trial      | `@bryntum/chart-trial`      | Trial limited component version      |
| Bryntum Chart Thin       | `@bryntum/chart-thin`       | Thin licensed component version      |
| Bryntum Chart Thin Trial | `@bryntum/chart-thin-trial` | Thin trial limited component version |

## Frameworks wrappers

To integrate Bryntum components with all major frameworks including Angular, Ionic, React and Vue, we provide
framework specific wrappers in the following packages:

| _Framework_           | _Package_                       | Integration guide                                                                           |
|-----------------------|---------------------------------|---------------------------------------------------------------------------------------------|
| Angular (IVY)         | `@bryntum/chart-angular`      | [Angular integration guide](#Chart/guides/integration/angular/guide.md)                   |
| Angular (View Engine) | `@bryntum/chart-angular-view` | [Angular integration guide](#Chart/guides/integration/angular/guide.md)                   |
| Angular (Thin)        | `@bryntum/chart-angular-thin` | [Angular multiple products guide](#Chart/guides/integration/angular/multiple-products.md) |
| React                 | `@bryntum/chart-react`        | [React integration guide](#Chart/guides/integration/react/guide.md)                       |
| React (Thin)          | `@bryntum/chart-react-thin`   | [React multiple products guide](#Chart/guides/integration/react/multiple-products.md)     |
| Vue 2.x               | `@bryntum/chart-vue`          | [Vue integration guide](#Chart/guides/integration/vue/guide.md)                           |
| Vue 3.x               | `@bryntum/chart-vue-3`        | [Vue integration guide](#Chart/guides/integration/vue/guide.md)                           |
| Vue 3.x (Thin)        | `@bryntum/chart-vue-3-thin`   | [Vue multiple products guide](#Chart/guides/integration/vue/multiple-products.md)         |

<div class="note">

Wrapper packages require installing <strong>@bryntum/chart</strong> but it is not listed in the package dependencies.
This was done to support trial package aliasing. You have to manually add the <strong>@bryntum/chart</strong> dependency to the 
application's <strong>package.json</strong> file to use the wrapper packages.

</div>

## Demo resources

Bryntum demo applications use resources such as images, fonts and styling from the **demo-resources** npm package.
This package is **optional** and it is not necessary to add it in your application.

| _Description_  | _Package_                 |
|----------------|---------------------------|
| Demo Resources | `@bryntum/demo-resources` |

<div class="note">

Demo Resources package does not contain framework demos and they are bundled within distribution zip.

</div>



<p class="last-modified">Last modified on 2026-07-22 10:46:11</p>