# Crud Manager in the SchedulerPro

## Introduction

This guide describes how to use the *Crud Manager* in *Bryntum Scheduler Pro*. It contains only *SchedulerPro* specific details.
For general information on *Crud Manager* implementation and architecture see
[this guide](#Scheduler/guides/data/crud_manager_in_depth.md).

In the SchedulerPro, *Crud Manager* mixins are applied to the [ProjectModel](#SchedulerPro/model/ProjectModel) class. So each
project is capable of loading and saving its data using the *Crud Manager* protocol. It uses the Fetch API as transport
system and JSON as encoding format.

## SchedulerPro stores

There are a lot of stores in the SchedulerPro. They are used for keeping resources, assignments,
calendars, dependencies, timeRanges, resourceTimeRanges and events. The
stores reference each others records and are joined together by a project.

Providing *Crud Manager* functionality to [ProjectModel](#SchedulerPro/model/ProjectModel) allows handling loading and
persisting of the stores.

Project creates related stores by default, and in case you need to provide your own store instances or store
configuration objects, there are corresponding configs:

| Store                                                                                 | Description                        | 
|---------------------------------------------------------------------------------------|------------------------------------|
| [`resourceStore`](#SchedulerPro/model/ProjectModel#config-resourceStore)                   | Holds a collection of resources    |
| [`eventStore`](#SchedulerPro/model/ProjectModel#config-eventStore)                         | Holds a collection of events       |
| [`assignmentStore`](#SchedulerPro/model/ProjectModel#config-assignmentStore)               | Holds a collection of assignments  |
| [`dependencyStore`](#SchedulerPro/model/ProjectModel#config-dependencyStore)               | Holds a collection of dependencies |
| [`timeRangeStore`](#SchedulerPro/model/ProjectModel#config-timeRangeStore)                 | Holds a collection of time rs      |
| [`calendarManagerStore`](#SchedulerPro/model/ProjectModel#config-calendarManagerStore)     | Holds a collection of calendars    |
| [`resourceTimeRangeStore`](#SchedulerPro/model/ProjectModel#config-resourceTimeRangeStore) | Holds a collection of resource rs  |

Here's how a basic configuration could look:

```javascript
const project = new ProjectModel({
    autoLoad : true,
    // we want to provide a custom store for events
    eventStore,
    loadUrl : 'php/read.php',
    syncUrl : 'php/save.php'
});
```

You can either pass the `project` instance to SchedulerPro:

```javascript
const schedulerpro = new SchedulerPro({
    // ... other configs
    project : project
});
```

or pass the configuration object directly without first creating an instance:

```javascript
const schedulerpro = new SchedulerPro({
    // ... other configs
    project : {
        autoLoad : true,
        // we want to provide a custom store for events
        eventStore,
        loadUrl : 'php/read.php',
        syncUrl : 'php/save.php'
    }
});
```

## Load inline data

You can also load inline data, which can either be loaded during the initialization:

```javascript
const schedulerpro = new SchedulerPro({
    // ... other configs
    project : {
        resources : [
            { id : 1, name : 'Linda', city : 'NY' },
            { id : 2, name : 'Olivia', city : 'Paris' }
        ],

        dependencies : [
            { fromEvent : 1, toEvent : 2 }
        ],

        assignments : [
            { event : 1, resource : 1 },
            { event : 2, resource : 2 }
        ],
        events : [
            { id : 1, name : 'Proof-read docs', startDate : '2017-01-02', endDate : '2017-01-09' },
            { id : 2, name : 'Release docs', startDate : '2017-01-09', endDate : '2017-01-10' }
        ],
    }
});
```

In case of frameworks, we recommend using [`ProjectModel`](#Scheduler/model/ProjectModel).

<div class="framework-tabs">
<div data-name="angular">

```html
<bryntum-scheduler-pro-project-model
    #project
    [events] = "projectData.events"
    [assignments] = "projectData.assignments"
    [resources] = "projectData.resources"
></bryntum-scheduler-pro-project-model>
<bryntum-scheduler-pro
    #schedulerpro
    [project] = "project"
    [columns] = "schedulerproProps.columns"
    [columnField] = "schedulerproProps.columnField"
></bryntum-scheduler-pro>
```

```typescript
import { DateHelper } from '@bryntum/schedulerpro';
import { BryntumSchedulerProProps, BryntumSchedulerProProjectModelProps } from '@bryntum/schedulerpro-angular';

export const projectProps: BryntumSchedulerProProjectModelProps = {
    resources : [
        { id : 1, name : 'Linda' },
        { id : 2, name : 'Olivia' }
    ],

    assignments : [
        { event : 1, resource : 1 },
        { event : 2, resource : 2 }
    ],

    events : [
        { id : 1, name : 'Proof-read docs', startDate : '2022-01-01T10:00', endDate : '2022-01-02T13:00' },
        { id : 2, name : 'Release docs', startDate : '2022-01-09T15:00', endDate : '2022-01-10T16:00' }
    ]
};

export const schedulerproProps: BryntumSchedulerProProps = {
    /* schedulerpro props here */
};
```

</div>
<div data-name="react">

```javascript
import { BryntumSchedulerProProjectModelProps } from '@bryntum/schedulerpro-react';
const projectProps: BryntumSchedulerProProjectModelProps = {

    resources : [
        { id : 1, name : 'Linda' },
        { id : 2, name : 'Olivia' }
    ],

    assignments : [
        { event : 1, resource : 1 },
        { event : 2, resource : 2 }
    ],

    events : [
        { id : 1, name : 'Proof-read docs', startDate : '2022-01-01T10:00', endDate : '2022-01-02T13:00' },
        { id : 2, name : 'Release docs', startDate : '2022-01-09T15:00', endDate : '2022-01-10T16:00' }
    ]
}

const schedulerproProps : BryntumSchedulerProProps = {
    /* schedulerpro props here */
}
```

```javascript
import { FunctionComponent, useRef } from 'react';
import { BryntumSchedulerPro, BryntumSchedulerProProjectModel } from '@bryntum/schedulerpro-react';
import { projectProps, schedulerproProps } from './appConfig';
import './App.scss';

const App: FunctionComponent = () => {
    const projectRef = useRef<BryntumSchedulerProProjectModel>(null);
    const SchedulerProRef = useRef<BryntumSchedulerPro>(null);

    return <>
        <BryntumSchedulerProProjectModel
            ref={projectRef}
            {...projectProps}
        />
        <BryntumSchedulerPro
            ref={schedulerProRef}
            project={projectRef}
            {...schedulerproProps}
        />
    </>;
};

export default App;
```

</div>
<div data-name="vue">

```javascript
<script>
import { ref } from 'vue';
import { BryntumSchedulerPro, BryntumSchedulerProProjectModel } from '@bryntum/schedulerpro-vue-3';
import { schedulerproProps, projectConfig, sliderConfig } from '@/AppConfig';
import * as initialData from '@/initialData';

export default {
    name : 'App',

    components : {
        BryntumSchedulerProProjectModel,
        BryntumSchedulerPro
    },

    setup() {
        const project = ref(null);
        const events = ref(initialData.events);
        const resources = ref(initialData.resources);
        const assignments = ref(initialData.assignments);

        return {
            project,
            projectConfig,
            schedulerproProps,
            sliderConfig,
            events,
            resources,
            assignments,
        };
    }
};
</script>

<template>
    <bryntum-scheduler-pro-project-model
        ref="project"
        v-bind="projectConfig"
        :events="events"
        :resources="resources"
        :assignments="assignments"
        :time-ranges="timeRanges"
    />
    <bryntum-scheduler-pro
        ref="schedulerpro"
        v-bind="schedulerproProps"
        :project="project"
    />
</template>
```

</div>
</div>

For better understanding, checkout our `inline-data` demos for
[Angular](https://bryntum.com/products/schedulerpro/examples/?framework=angular),
[React](https://bryntum.com/products/schedulerpro/examples/?framework=react) and
[Vue](https://bryntum.com/products/schedulerpro/examples/?framework=vue).

You can also load it later using `loadInlineData()`; It uses the same format as when creating a project with inline data:

```javascript
await schedulerpro.project.loadInlineData({
        resources : [
            { id : 1, name : 'Linda', city : 'NY' },
            { id : 2, name : 'Olivia', city : 'Paris' }
        ],

        dependencies : [
            { fromEvent : 1, toEvent : 2 }
        ],

        assignments : [
            { event : 1, resource : 1 },
            { event : 2, resource : 2 }
        ],
        events : [
            { id : 1, name : 'Proof-read docs', startDate : '2017-01-02', endDate : '2017-01-09' },
            { id : 2, name : 'Release docs', startDate : '2017-01-09', endDate : '2017-01-10' }
        ],
});
```

Also read [Working with inline data](#SchedulerPro/model/ProjectModel#working-with-inline-data) for more information.

## Load request structure

The load request has a payload, which by default looks like:

```json
{
    "type"      : "load",
    "requestId" : 17228564331330,
    "stores"    : [ "resources", "events", "assignments", "dependencies", ... ]
}
```

The `stores` property contains a list of all the stores the project uses. This property is optional and can be
modified. You can use this information for any server-side implementation. For example when a backend should support
loading of only certain project stores. In this case, one should pass the list of stores to load in that property.

To modify the `stores` property, you can use the
[`beforeLoad`](#Scheduler/crud/AbstractCrudManagerMixin#event-beforeLoad) event. This event allows you to customize
a load request data before it's sent to the backend.

```javascript
project.on('beforeLoad', ({ source, pack }) => {
    const updatedStores = ['dependencies', 'assignments'];
    pack.stores = updatedStores;
});
```

Alternatively, you can remove a store from the project, which will exclude it from the load request payload.
Of course in such case the project will not serve the removed store (not load its data nor sync its changes).
So your application will have to do it manually.

```javascript
const project = new ProjectModel({});
project.removeCrudStore("assignments");
```

By using this method, the `assignmentStore` will not receive any data, ensuring it remains empty regardless
of the backend response.

## Load response structure

The backend (in the above case it's "php/read.php" script) should return a JSON similar to the one seen below:

```json
{
    "success" : true,

    "project" : {
        "calendar"     : 10,
        "startDate"    : "2019-01-14",
        "hoursPerDay"  : 24,
        "daysPerWeek"  : 5,
        "daysPerMonth" : 20
    },

    "calendars" : {
        "rows" : [
            {
                "id"        : 10,
                "name"      : "General",
                "intervals" : [
                    {
                        "recurrentStartDate" : "on Sat",
                        "recurrentEndDate"   : "on Mon",
                        "isWorking"          : false
                    }
                ]
            }
        ]
    },

    "dependencies" : {
        "rows" : [
            {
                "id"      : 1,
                "from"    : 11,
                "to"      : 17,
                "type"    : 2,
                "lag"     : 0,
                "lagUnit" : "d"
            }
        ]
    },

    events : {
        "rows" : [
            {
                "id"          : 11,
                "name"        : "Investigate",
                "percentDone" : 50,
                "startDate"   : "2021-02-08",
                "endDate"     : "2021-02-13",
                "duration"    : 5
            },
            {
                "id"          : 12,
                "name"        : "Assign resources",
                "percentDone" : 50,
                "startDate"   : "2021-02-08",
                "endDate"     : "2021-02-20",
                "duration"    : 10
            },
            {
                "id"          : 17,
                "name"        : "Report to management",
                "percentDone" : 0,
                "startDate"   : "2021-02-20",
                "endDate"     : "2021-02-20",
                "duration"    : 0
            }
        ]
    },

    "resources" : {
        "rows" : [
            {
                "id"   : 1,
                "name" : "Mats"
            },
            {
                "id" : 2,
                "name" : "Nickolay"
            }
        ]
    },

    "assignments" : {
        "rows" : [
            {
                "id"       : 1,
                "event"    : 11,
                "resource" : 1,
                "units"    : 80
            }
        ]
    }
}
```

The above response sections contain corresponding stores data which are covered in the following chapters.

### Project data

The project reads values of its own fields from the `project` section of the responses. In the above example it looks
this:

```json
{
    ...

    "project" : {
        "startDate"    : "2010-01-18",
        "calendar"     : 12,
        "hoursPerDay"  : 8,
        "daysPerWeek"  : 5,
        "daysPerMonth" : 20
    }
}
```

Please check [ProjectModel docs](#SchedulerPro/model/ProjectModel#fields) for the full list of the project fields.

### Events data

The project reads events from the `events` section of load response. The records are provided
as an array of objects under the `rows` property. In the provided response example it looks this:

```json
{
    ...

    "events": {
        "rows": [
            {
                "id"          : 11,
                "name"        : "Investigate",
                "percentDone" : 50,
                "startDate"   : "2021-02-08",
                "endDate"     : "2021-02-13",
                "duration"    : 5
            },
            {
                "id"          : 12,
                "name"        : "Assign resources",
                "percentDone" : 50,
                "startDate"   : "2021-02-08",
                "endDate"     : "2021-02-20",
                "duration"    : 10
            },
            {
                "id"          : 17,
                "name"        : "Report to management",
                "percentDone" : 0,
                "startDate"   : "2021-02-20",
                "endDate"     : "2021-02-20",
                "duration"    : 0
            }
        ]
    }
}
```

Each object in the `events.rows` array represents a
[EventModel](#SchedulerPro/model/EventModel) where each object key represents an event
field. See [EventModel fields](#SchedulerPro/model/EventModel#fields) for the full list of
event fields.

### Resources data

The project reads resources from the `resources` section of the load response. The records are provided as an array of
objects under the `rows` property. In the provided response example it looks this:

```json
{
    ...

    "resources" : {
        "rows" : [
            {
                "id"   : 1,
                "name" : "Mats"
            },
            {
                "id"   : 2,
                "name" : "Nickolay"
            }
        ]
    }
}
```

Each object in the `resources.rows` array represents a
[ResourceModel](#SchedulerPro/model/ResourceModel) where each object
key represents a resource field. See
[ResourceModel fields](#SchedulerPro/model/ResourceModel#fields)
for the full list of resource fields.

### Assignments data

Assignments specify resources usage for certain events. The project reads them from the `assignments`
section of the load response. The records are provided as an array of objects under the `rows` property. In the provided
response example it looks this:

```json
{
    ...

    "assignments" : {
        "rows" : [
            {
                "id"       : 1,
                "event"    : 11,
                "resource" : 1,
                "units"    : 80
            }
        ]
    }
}
```

Each object in the `assignments.rows` array represents an
[AssignmentModel](#SchedulerPro/model/AssignmentModel) where each
object key represents an assignment field. See
[AssignmentModel fields](#SchedulerPro/model/AssignmentModel#fields)
for the full list of assignment fields.

### Calendars data

Calendars in the SchedulerPro define working/non-working periods of time for resources or events. The project
reads their data from the load response `calendars` section. The records are provided as an array of objects under the
`rows` property. In the provided response example it looks this:

```json
{
    ...

    "calendars" : {
        "rows" : [
            {
                "id"        : 10,
                "name"      : "General",
                "intervals" : [
                    {
                        "recurrentStartDate" : "on Sat",
                        "recurrentEndDate"   : "on Mon",
                        "isWorking"          : false
                    }
                ]
            }
        ]
    }
}
```

Each object in the `calendars.rows` array represents a [CalendarModel](#SchedulerPro/model/CalendarModel) where each object
key represents a calendar field. See [CalendarModel fields](#SchedulerPro/model/CalendarModel#fields) for the full list of calendar fields.

### Dependencies data

Task dependencies represent links between events that describe how events should be scheduled
based on each other. The project reads them from the `dependencies` section of the load response. The records are
provided as an array of objects under the `rows` property. In the provided response example it looks this:

```json
{
    ...

    "dependencies": {
        "rows" : [
            {
                "id"      : 1,
                "from"    : 11,
                "to"      : 17,
                "type"    : 2,
                "lag"     : 0,
                "lagUnit" : "d"
            }
        ]
    }
}
```

Each object in the `dependencies.rows` array represents a [DependencyModel](#SchedulerPro/model/DependencyModel) where each
object key represents a dependency field. See [DependencyModel fields](#SchedulerPro/model/DependencyModel#fields) for the
full list of dependency fields.

## Sync request structure

Syncing includes changes for all linked stores in a single request, with sections for `added`, `updated` and `removed`
records per store. For changes to the EventStore and the ResourceStore a sync request might look like this:

```json
{
    "requestId" : 124,
    "type"      : "sync",
    "revision"  : 5,

    "events"     : {
        "added" : [
            { "$PhantomId" : "_generated5", "name" : "New event" }
        ],
        "updated" : [
            { "id" : 50, "startDate" : "2022-05-02" }
        ],
        "removed" : [
            { "id" : 9001 }
        ]
    },

    "resources"      : {
        "added" : [
            { "$PhantomId" : "_generated7", "name" : "Steven", "surname" : "Grant" }
        ]
    }
}
```

Each added record is sent should include its *phantom identifier* (auto-generated client side unique value used to
identify the record) ([by default](#Scheduler/crud/AbstractCrudManagerMixin#config-phantomIdField) the `$PhantomId`,
field name is used). Please do not persist phantom record identifiers as-is on the server. That might cause collisions
on the client after data reloading. It's expected that backend assigns new identifiers to added records.

Please note that by default, only changed fields and any fields configured with
[alwaysWrite](#Core/data/field/DataField#config-alwaysWrite) are sent. If you want all fields to always be sent, please
see [writeAllFields](#Scheduler/crud/AbstractCrudManagerMixin#config-writeAllFields).

For more details on the sync request structure, please see the generic
[Crud Manager in depth guide](#Scheduler/guides/data/crud_manager_in_depth.md#sync-request-structure).

## Sync response structure

The Response to a sync request should confirm that changes were applied and optionally update the client with any
additional changes made on the server.

If there are no additional changes made on the server, a short sync response such as this one is enough:

```json
{
    "success"   : true,
    "requestId" : 124,
    "revision"  : 6
}
```

The `success` attribute is by default optional for successful calls, and if you are not using revision validation the
response can be made even shorter:

```json
{
    "requestId" : 124
}
```

Whenever the server makes changes to the synced data, the new values must be part of the response. For example, when
saving a new record the server provides a new value for its id, and that has to be included for the client side to use
the correct id. This is a valid response to the sync request above:

```json
{
    "success"     : true,
    "requestId"   : 124,
    "revision"    : 6,

    "events" : {
        "rows" : [
            { "$PhantomId" : "_generated5", "id" : 543, "added_dt" : "2022-05-02T11:30:00" }
        ]
    },

    "resources" : {
        "rows" : [
            { "$PhantomId" : "_generated7", "id" : 12 }
        ],
        "removed" : [
            { "id" : 5 }
        ]
    }
}
```

For each store there are two possible sections: `rows` and `removed`.

The `rows` section list data changes made *by the server*.

If the server decides to update *any* other field of *any* record it should return an object holding a combination of
the record identifier and new field values (this is shown in above snippet where server sets `added_dt` field value).
When adding a new record the server generates an identifier for it and responds with both old *phantom identifier* and
the new identifier. The field values will be applied to the corresponding store record on the client.

<div class="note">

Note that this way the server can also provide new records to the client by passing them in the <code>rows</code> section.

</div>

The `removed` section contains identifiers of records removed *by the server*, perhaps by another user since the last
load or sync call. In the above snippet, the response includes removal of a resource with id `5`, initiated by the
server.

For more details on the sync request structure, please see the generic
[Crud Manager in depth guide](#Scheduler/guides/data/crud_manager_in_depth.md#sync-response-structure).

## Sending extra HTTP request parameters

Extra params may be added using [transport](#Scheduler/crud/transport/AjaxTransport#config-transport) configuration:

```javascript
const project = new ProjectModel({
    transport : {
        load : {
            url    : 'php/read.php',
            method : 'POST',
            params : {
                userAccess : 'granted',
                viewId     : 'full'
            }
        },
        sync : {
            url : 'php/save.php'
        }
    }
});
```

Or dynamically by passing into [load](#SchedulerPro/model/ProjectModel#function-load) method:

```javascript
project.load({
    request : {
        params : {
            startDate : '2021-01-01'
        }
    }
})
```

Or by listening to the [beforeLoad](#Scheduler/crud/AbstractCrudManagerMixin#event-beforeLoad) event:

```javascript
const project = new Project({
    loadUrl : 'php/read.php',
    syncUrl : 'php/save.php',
    listeners : {
        beforeLoad({ pack }){
            pack.params.includeHidden = false;
        }
    }
});
```

## Dealing with extra stores

Since [ProjectModel](#SchedulerPro/model/ProjectModel) implements a *Crud Manager* you can provide any number of additional
stores using the [crudStores](#Scheduler/crud/AbstractCrudManagerMixin#config-crudStores) config:

```javascript
const
    store1      = new Store({ id : 'store1' }),
    store2      = new Store({ id : 'store2' }),
    store3      = new Store({ id : 'store3' }),
    crudManager = new CrudManager({
          // Register additional stores, to also handle them
          // in a batch when loading data
          crudStores : [ store1, store2, store3 ],
          loadUrl    : 'php/read.php',
          syncUrl    : 'php/save.php'
    });
```

Or add them programmatically using the [addCrudStore](#Scheduler/crud/AbstractCrudManagerMixin#function-addCrudStore) method:

```javascript
project.addCrudStore([ store2, store3 ]);
```

## Triggering loading and saving

In the following example the project will start data loading automatically due to the provided
[autoLoad](#SchedulerPro/model/ProjectModel#config-autoLoad) config. In this case the project schedules asynchronous loading
on construction stage:

```javascript
const project = new ProjectModel({
      autoLoad : true,
      loadUrl : 'php/read.php',
      syncUrl : 'php/save.php'
});
```

And in order to start data loading manually the project has [load](#SchedulerPro/model/ProjectModel#function-load) method.
The method returns a `Promise` that gets resolved once data is loaded and processed by the *Scheduling Engine*:

```javascript
// load data
try {
    await project.load();
    console.log('Data loaded and processed...');
} catch (e) {
    console.log('Data loading error');
}
```

To persist changes automatically, there is the [autoSync](#SchedulerPro/model/ProjectModel#config-autoSync) option. When set
to `true` it causes project to react on data changes made in the registered stores and schedule data syncing. For
example in the following snippet the project will trigger data saving (handled by `php/save.php` script) as soon as any
registered store record gets changed:

```javascript
const project = new ProjectModel({
    autoSync : true,
    loadUrl : 'php/read.php',
    syncUrl : 'php/save.php'
});
```

And of course manual saving is also possible with the [sync](#SchedulerPro/model/ProjectModel#function-sync) method:

```javascript
try {
    await project.sync();
    console.log('Changes saved...');
} catch(e) {
    console.log('Data saving error');
}
```

## Response format validation

SchedulerPro project will validate responses and log found issues to the browser console. This should help implementing
backend integration on development stage.

Example of the validation report:

```text
Project sync response error(s):
- "events" store "rows" section should mention added record(s) #XXX sent in the request. It should contain the added records identifiers (both phantom and "real" ones assigned by the backend).
- "events" store "rows" section should mention updated record(s) #XXX sent in the request. It should contain the updated record identifiers.
- "events" store "removed" section should mention removed record(s) #XXX sent in the request. It should contain the removed record identifiers.
Please adjust your response to look like this:
{
    "events": {
        "removed": [
            {
                "id": XXX
            },
            ...
        ],
        "rows": [
            {
                "$PhantomId": XXX,
                "id": ...
            },
            {
                "id": XXX
            },
            ...
        ]
    }
}
Note: Please consider enabling "supportShortSyncResponse" option to allow less detailed sync responses (https://bryntum.com/products/scheduler/docs/api/Scheduler/crud/AbstractCrudManagerMixin#config-supportShortSyncResponse)
Note: To disable this validation please set the "validateResponse" config to false
```

The validation can be disabled with [validateResponse](#SchedulerPro/model/ProjectModel#config-validateResponse) config.


<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>