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
| Angular (IVY)         | `@bryntum/scheduler-angular`      |
| Angular (View Engine) | `@bryntum/scheduler-angular-view` |
| Angular (Thin)        | `@bryntum/scheduler-angular-thin` |
| React                 | `@bryntum/scheduler-react`        |
| React (Thin)          | `@bryntum/scheduler-react-thin`   |
| Vue 2.x               | `@bryntum/scheduler-vue`          |
| Vue 3.x               | `@bryntum/scheduler-vue-3`        |
| Vue 3.x (Thin)        | `@bryntum/scheduler-vue-3-thin`   |

## Other public packages

The following utility packages are also available on the public npm registry:

| Description     | Package                           |
|-----------------|-----------------------------------|
| Demo Resources  | `@bryntum/demo-resources`         |
| Babel Preset    | `@bryntum/babel-preset-react-app` |

## Installation

Trial packages require using npm package aliasing to install the `"@bryntum/scheduler-trial"` using
the `"@bryntum/scheduler"` alias.

<div class="note">

The trial Bryntum Scheduler package should be installed first

</div>

Example for Angular framework integration using package manager of your choice:

<div class="docs-tabs" data-name="packagemanager">
<div>
    <a>npm</a>
    <a>yarn</a>
</div>
<div>

```shell
npm install @bryntum/scheduler@npm:@bryntum/scheduler-trial@7.3.4
npm install @bryntum/scheduler-angular@7.3.4
```

<div class="note">

We recommend to use npm <code>--save-exact</code> arguments to install the precise package versions and take upgrades fully under
control.

</div>

</div>
<div>

```shell
yarn add @bryntum/scheduler@npm:@bryntum/scheduler-trial@7.3.4
yarn add @bryntum/scheduler-angular@7.3.4
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
  "@bryntum/scheduler": "npm:@bryntum/scheduler-trial@7.3.4",
  "@bryntum/scheduler-angular": "7.3.4"
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
[Framework wrappers](#Scheduler/guides/npm/repository/components.md#frameworks-wrappers) table.

## Limitations

Trial packages have the following limitations compared to licensed packages:

* Displays a trial watermark
* Obfuscated code
* Intended for evaluation use only

For full functionality and production use, upgrade to licensed packages from the private Bryntum repository.


<p class="last-modified">Last modified on 2026-07-22 10:51:34</p>