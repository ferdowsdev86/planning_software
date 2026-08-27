# Public repository access

Bryntum trial packages and framework wrappers are available on the public npm registry (**npmjs.com**).

**No login or authorization required** - install directly using standard npm commands without any registry
configuration or authentication.

## Available packages

The following trial packages are available on the public npm registry:

| Component (Trial)   | Package                            |
|---------------------|------------------------------------|
| Grid                | `@bryntum/grid-trial`              |
| Grid Thin           | `@bryntum/grid-thin-trial`         |
| Scheduler           | `@bryntum/scheduler-trial`         |
| Scheduler Thin      | `@bryntum/scheduler-thin-trial`    |
| Scheduler Pro       | `@bryntum/schedulerpro-trial`      |
| Scheduler Pro Thin  | `@bryntum/schedulerpro-thin-trial` |
| Gantt               | `@bryntum/gantt-trial`             |
| Gantt Thin          | `@bryntum/gantt-thin-trial`        |
| Calendar            | `@bryntum/calendar-trial`          |
| Calendar Thin       | `@bryntum/calendar-thin-trial`     |
| TaskBoard           | `@bryntum/taskboard-trial`         |
| TaskBoard Thin      | `@bryntum/taskboard-thin-trial`    |

## Framework wrappers

Framework wrappers do not have a `-trial` suffix and are available on the public npm registry:

| Framework Wrapper     | Package                         |
|-----------------------|---------------------------------|
| Angular (IVY)         | `@bryntum/core-angular`      |
| Angular (View Engine) | `@bryntum/core-angular-view` |
| Angular (Thin)        | `@bryntum/core-angular-thin` |
| React                 | `@bryntum/core-react`        |
| React (Thin)          | `@bryntum/core-react-thin`   |
| Vue 2.x               | `@bryntum/core-vue`          |
| Vue 3.x               | `@bryntum/core-vue-3`        |
| Vue 3.x (Thin)        | `@bryntum/core-vue-3-thin`   |

## Other public packages

The following utility packages are also available on the public npm registry:

| Description     | Package                           |
|-----------------|-----------------------------------|
| Demo Resources  | `@bryntum/demo-resources`         |
| Babel Preset    | `@bryntum/babel-preset-react-app` |

## Installation

Trial packages require using npm package aliasing to install the `"@bryntum/core-trial"` using
the `"@bryntum/core"` alias.

<div class="note">

The trial Bryntum Core package should be installed first

</div>

Example for Angular framework integration using package manager of your choice:

<div class="docs-tabs" data-name="packagemanager">
<div>
    <a>npm</a>
    <a>yarn</a>
</div>
<div>

```shell
npm install @bryntum/core@npm:@bryntum/core-trial@7.3.4
npm install @bryntum/core-angular@7.3.4
```

<div class="note">

We recommend to use npm <code>--save-exact</code> arguments to install the precise package versions and take upgrades fully under
control.

</div>

</div>
<div>

```shell
yarn add @bryntum/core@npm:@bryntum/core-trial@7.3.4
yarn add @bryntum/core-angular@7.3.4
```

<div class="note">

We recommend using yarn <code>--exact</code> argument to install the specific package versions and keep upgrades fully under
control.

</div>
</div>
</div>

Alternatively, you can directly add entries to the `"dependencies"` section of the `package.json` project file as
follows:

```json
"dependencies": {
  "@bryntum/core": "npm:@bryntum/core-trial@7.3.4",
  "@bryntum/core-angular": "7.3.4"
}
```

<div class="note">

We recommend against prefixing package versions with the caret character (<code>^</code>) to install the precise package versions
and take upgrades fully under control.

</div>

To install Bryntum trial products use the trial product packages `@bryntum/grid-trial`, `@bryntum/gantt-trial`,
`@bryntum/scheduler-trial`, `@bryntum/schedulerpro-trial`, `@bryntum/calendar-trial` or `@bryntum/taskboard-trial`.

<div class="note">

To avoid compatibility issues, please make sure that you use the same version for all installed Bryntum product
packages.

</div>

Packages for other frameworks are listed in the
[Framework wrappers](#Core/guides/npm/repository/components.md#frameworks-wrappers) table.

## Limitations

Trial packages have the following limitations compared to licensed packages:

* Displays a trial watermark
* Obfuscated code
* Intended for evaluation use only

For full functionality and production use, upgrade to licensed packages from the private Bryntum repository.


<p class="last-modified">Last modified on 2026-07-22 10:45:56</p>