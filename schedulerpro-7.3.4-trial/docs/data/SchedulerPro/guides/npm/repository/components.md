# Components and wrappers

## Components

Bryntum components (libraries) for web applications are built using pure JavaScript and can be used in any modern web
application without requiring any special JS framework. These components are packaged as follows:

| _Component_                | _Package_                     | Description                          |
|----------------------------|-------------------------------|--------------------------------------|
| Bryntum Scheduler Pro            | `@bryntum/schedulerpro`            | Full licensed component version      |
| Bryntum Scheduler Pro Trial      | `@bryntum/schedulerpro-trial`      | Trial limited component version      |
| Bryntum Scheduler Pro Thin       | `@bryntum/schedulerpro-thin`       | Thin licensed component version      |
| Bryntum Scheduler Pro Thin Trial | `@bryntum/schedulerpro-thin-trial` | Thin trial limited component version |

## Frameworks wrappers

To integrate Bryntum components with all major frameworks including Angular, Ionic, React and Vue, we provide
framework specific wrappers in the following packages:

| _Framework_           | _Package_                       | Integration guide                                                                           |
|-----------------------|---------------------------------|---------------------------------------------------------------------------------------------|
| Angular (IVY)         | `@bryntum/schedulerpro-angular`      | [Angular integration guide](#SchedulerPro/guides/integration/angular/guide.md)                   |
| Angular (View Engine) | `@bryntum/schedulerpro-angular-view` | [Angular integration guide](#SchedulerPro/guides/integration/angular/guide.md)                   |
| Angular (Thin)        | `@bryntum/schedulerpro-angular-thin` | [Angular multiple products guide](#SchedulerPro/guides/integration/angular/multiple-products.md) |
| React                 | `@bryntum/schedulerpro-react`        | [React integration guide](#SchedulerPro/guides/integration/react/guide.md)                       |
| React (Thin)          | `@bryntum/schedulerpro-react-thin`   | [React multiple products guide](#SchedulerPro/guides/integration/react/multiple-products.md)     |
| Vue 2.x               | `@bryntum/schedulerpro-vue`          | [Vue integration guide](#SchedulerPro/guides/integration/vue/guide.md)                           |
| Vue 3.x               | `@bryntum/schedulerpro-vue-3`        | [Vue integration guide](#SchedulerPro/guides/integration/vue/guide.md)                           |
| Vue 3.x (Thin)        | `@bryntum/schedulerpro-vue-3-thin`   | [Vue multiple products guide](#SchedulerPro/guides/integration/vue/multiple-products.md)         |

<div class="note">

Wrapper packages require installing <strong>@bryntum/schedulerpro</strong> but it is not listed in the package dependencies.
This was done to support trial package aliasing. You have to manually add the <strong>@bryntum/schedulerpro</strong> dependency to the 
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



<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>