# Binding Bryntum Scheduler Pro data

Bryntum Scheduler Pro is a data intensive component that uses several datasets. These datasets usually come from the server
and are held in `SchedulerPro` project during the lifetime of the `SchedulerPro` view. There are several ways of populating the
project data stores.

## Using project transport

[ProjectModel](#SchedulerPro/model/ProjectModel) supports loading and saving of data in multiple stores with
[transport](#SchedulerPro/model/ProjectModel#config-transport) config. Loading the stores and saving all changes is done in
one request.

Configuring `project` with `transport` is the simplest way of binding data to the `SchedulerPro` project stores as seen from
the client side, but it does require following a specific protocol on the backend.

The configuration can be as simple as setting the `project` property like this:

```javascript
schedulerproProps: {
    project : {
        loadUrl  : '/server/load/url',
        syncUrl  : '/server/save/url',
        autoLoad : true
    }
}

<BryntumSchedulerPro {...schedulerproProps}/>
```

With this configuration, the data is loaded and saved from and to the above URLs and the data `transport` is handled
automatically.

## Binding existing data to the component

When the application already has a server transport layer then the data for `SchedulerPro` is available in application
code and it needs to be passed (bound) to the component. One approach is to make the data available as component
variables and bind them in the Vue template:

**App.vue:**

```javascript
<template>
    <bryntum-scheduler-pro
        :assignments = "assignments"
        :calendars = "calendars"
        :dependencies = "dependencies"
        :resources = "resources"
        :events = "events"
        v-bind = "schedulerProProps"
    />
</template>

<script>
import { ref, reactive } from 'vue';

import { BryntumSchedulerPro } from '@bryntum/schedulerpro-vue-3';

import { useschedulerProProps } from '@/AppConfig';
import * as appData from '@/AppData';

export default {
    name : 'App',

    components : {
        BryntumSchedulerPro
    },

    setup() {
        const schedulerProProps = reactive(useschedulerProProps());

        const assignments = ref(appData.assignments);
        const calendars = ref(appData.calendars);
        const dependencies = ref(appData.dependencies);
        const resources = ref(appData.resources);
        const events = ref(appData.events);

        return {
            schedulerProProps,
            assignments,
            calendars,
            dependencies,
            resources,
            events
        };
    }
};
</script>

<style lang = "scss">
@import './App.scss';
</style>
```

Here we have component variables, initialized by spreading `...initialData`. Whenever a change of the data is needed,
it is only necessary to assign the new values to these variables, for example:

```javascript
this.events = newEvents;
this.dependencies = newDependencies;
```

## Binding existing data to the project

This approach binds data to a standalone `SchedulerProProjectModel` and then uses this project in `SchedulerPro`. Project has its
own markup in the template and it must be assigned to the `SchedulerPro` during initialization.

This approach is suitable for more complex applications that use more than one Bryntum component that share a common
`project`:

**App.vue:**

```javascript
<template>
    <div>
        <bryntum-scheduler-pro-project-model
            ref = "project"
            :assignments = "assignments"
            :calendars = "calendars"
            :dependencies = "dependencies"
            :resources = "resources"
            :events = "events"
        />
        <bryntum-scheduler-pro
            :project = "project"
            v-bind = "schedulerProProps"
        />
    </div>
</template>

<script>
import { ref, reactive } from 'vue';

import { BryntumSchedulerProProjectModel, BryntumSchedulerPro } from '@bryntum/schedulerpro-vue-3';

import { useschedulerProProps } from '@/AppConfig';
import * as appData from '@/AppData';

export default {
    name : 'App',

    components : {
        BryntumSchedulerProProjectModel,
        BryntumSchedulerPro
    },

    setup() {
        const project = ref(null);

        const schedulerProProps = reactive(useschedulerProProps());

        const assignments = ref(appData.assignments);
        const calendars = ref(appData.calendars);
        const dependencies = ref(appData.dependencies);
        const resources = ref(appData.resources);
        const events = ref(appData.events);

        return {
            project,
            schedulerProProps,
            assignments,
            dependencies,
            calendars,
            events,
            resources
        };
    }
};
</script>

<style lang = "scss">
@import './App.scss';
</style>
```

Here we create a standalone `SchedulerProProjectModel` (without any rendered output) with properties bound to individual
data sets.

<div class="note">

Note that <code>bryntum-schedulerpro-project-model</code> tag must come before all other components that use it. Otherwise the <code>project</code>
reference is not valid to these components.

</div>

Check implementation in React [inline-data](../examples/frameworks/vue-3-vite/inline-data/) demo.



<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>