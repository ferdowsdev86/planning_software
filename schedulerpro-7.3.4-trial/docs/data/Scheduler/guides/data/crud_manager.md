# Crud Manager in the Scheduler

## Introduction

The *Crud Manager* handles communication between multiple stores and a backend, loading and syncing them using a single
request. It uses the Fetch API to send and receive JSON formatted data.

This guide describes how to use the *Crud Manager* in *Bryntum Scheduler*. It contains only Scheduler specific details. For
in depth information on *Crud Manager* implementation and architecture see
[this guide](#Scheduler/guides/data/crud_manager_in_depth.md).

## Scheduler stores

The *Crud Manager* supports these Scheduler stores out of the box:

| Store                                                                                 | Description                                | 
|---------------------------------------------------------------------------------------|--------------------------------------------|
| [`resourceStore`](#Scheduler/data/CrudManager#config-resourceStore)                     | Holds a collection of resources            |
| [`eventStore`](#Scheduler/data/CrudManager#config-eventStore)                           | Holds a collection of events               |
| [`assignmentStore`](#Scheduler/data/CrudManager#config-assignmentStore)                 | Holds a collection of assignments          |
| [`dependencyStore`](#Scheduler/data/CrudManager#config-dependencyStore)                 | Holds a collection of dependencies         |
| [`timeRangeStore`](#Scheduler/data/CrudManager#property-timeRangeStore)                 | Holds a collection of time ranges          |
| [`resourceTimeRangeStore`](#Scheduler/data/CrudManager#property-resourceTimeRangeStore) | Holds a collection of resource time ranges |

Here's how a basic configuration could look:

```javascript
const crudManager = new CrudManager({
    autoLoad : true,
    loadUrl  : 'php/read.php',
    syncUrl  : 'php/save.php'
});
```

You can either pass the `crudManager` instance to Scheduler:

```javascript
const scheduler = new Scheduler({
    // ... other configs
    crudManager : crudManager
});
```

or pass the configuration object directly without first creating an instance:

```javascript
const scheduler = new Scheduler({
    // ... other configs
    crudManager : {
        autoLoad : true,
        loadUrl  : 'php/read.php',
        syncUrl  : 'php/save.php'
    } 
});
```

## Load inline data

You can also load inline data, please read the
[working with inline data](#Scheduler/guides/data/displayingdata.md#using-inline-or-preloaded-data) guide
for more information.

## Load request structure

The load request has a payload, which by default looks like:

```json
{
    "type"      : "load",
    "requestId" : 17228564331330,
    "stores"    : [ "resources", "events", "assignments", "dependencies", ... ]
}
```

The `stores` property contains a list of all the stores the crud manager uses. This property is optional and can be 
modified. You can use this information for any server-side implementation. For example when a backend should support
loading of only certain crud manager stores. In this case, one should pass the list of stores to load in that property.

To modify the `stores` property, you can use the 
[`beforeLoad`](#Scheduler/crud/AbstractCrudManagerMixin#event-beforeLoad) event. This event allows you to customize
a load request data before it's sent to the backend.

```javascript
crudManager.on('beforeLoad', ({ source, pack }) => { 
    const updatedStores = ['dependencies', 'assignments'];
    pack.stores = updatedStores;
});
```

Alternatively, you can remove a store from the Crud Manager, which will exclude it from the load request payload.
Of course in such case the crud manager will not serve the removed store (not load its data nor sync its changes).
So your application will have to do it manually.

```javascript
const crudManager = new CrudManager({});
crudManager.removeCrudStore("assignments");
```

By using this method, the `assignmentStore` will not receive any data, ensuring it remains empty regardless
of the backend response.

## Load response structure

The backend (in the above case it's "php/read.php" script) should return a JSON similar to the one seen below:

```json
{
    "success" : true,

    "events" : {
        "rows" : [
            {
                "id"          : 11,
                "name"        : "Investigate",
                "startDate"   : "2021-02-08",
                "endDate"     : "2021-02-13"
            },
            {
                "id"          : 12,
                "name"        : "Assign resources",
                "startDate"   : "2021-02-08",
                "endDate"     : "2021-02-20"
            },
            {
                "id"          : 17,
                "name"        : "Report to management",
                "startDate"   : "2021-02-20",
                "endDate"     : "2021-02-20"
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
                "resource" : 1
            }
        ]
    },

    "dependencies" : {
      "rows" : [
        {
          "id"      : 1,
          "from"    : 11,
          "to"      : 17
        }
      ]
    }
}
```

The above response sections contain corresponding stores data which are covered in the following chapters.

### Event data

The *Crud Manager* reads events from the `events` section of the load response. The records are provided as an array of
objects under the `rows` property. In the provided response example it looks like this:

```json
{
    ...

    "events": {
        "rows": [
            {
                "id"          : 11,
                "name"        : "Investigate",
                "startDate"   : "2021-02-08",
                "endDate"     : "2021-02-13"
            },
            {
                "id"          : 12,
                "name"        : "Assign resources",
                "startDate"   : "2021-02-08",
                "endDate"     : "2021-02-20"
            },
            {
                "id"          : 17,
                "name"        : "Report to management",
                "startDate"   : "2021-02-20",
                "endDate"     : "2021-02-20"
            }
        ]
    }
}
```

Each object in the `events.rows` array represents a [EventModel](#Scheduler/model/EventModel) where each object key 
represents an event field. See [EventModel fields](#Scheduler/model/EventModel#fields) for the full list of event fields.

### Resources data

The *Crud Manager* reads resources from the `resources` section of the load response. The records are provided as an 
array of objects under the `rows` property. In the provided response example it looks this:

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

Each object in the `resources.rows` array represents a [ResourceModel](#Scheduler/model/ResourceModel) where each object key
represents a resource field. See [ResourceModel fields](#Scheduler/model/ResourceModel#fields) for the full list of
resource fields.

### Assignments data

Assignments specify resources assigned to certain tasks. The *Crud Manager* reads them from the `assignments` section of 
the load response. The records are provided as an array of objects under the `rows` property. In the provided response 
example it looks this:

```json
{
    ...

    "assignments" : {
        "rows" : [
            {
                "id"       : 1,
                "event"    : 11,
                "resource" : 1
            }
        ]
    }
}
```

Each object in the `assignments.rows` array represents an [AssignmentModel](#Scheduler/model/AssignmentModel) where each 
object key represents an assignment field. See [AssignmentModel fields](#Scheduler/model/AssignmentModel#fields)
for the full list of assignment fields.

### Dependencies data

Event dependencies represent links between events that visually indicates how events are dependent of each other. The
*Crud Manager* reads them from the `dependencies` section of the load response. The records are provided as an array of 
objects under the `rows` property. In the provided response example it looks this:

```json
{
    ...

    "dependencies": {
        "rows" : [
            {
                "id"      : 1,
                "from"    : 11,
                "to"      : 17
            }
        ]
    }
}
```

Each object in the `dependencies.rows` array represents a [DependencyModel](#Scheduler/model/DependencyModel) where each 
object key represents a dependency field. See [DependencyModel fields](#Scheduler/model/DependencyModel#fields) for the
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

For more details on the sync request structure, please see the
[Crud Manager in depth guide](#Scheduler/guides/data/crud_manager_in_depth.md#sync-request-structure).

## Sync response structure

The response to a sync request should confirm that changes were applied and optionally update the client with any
additional changes made on the server.

If there are no additional changes made on the server, a short sync response such as this one is enough:

```json
{
    "success"   : true,
    "requestId" : 124,
    "revision"  : 6
}
```

The `success` attribute is by default optional for successful calls, and if you are not using 
[revision validation](#Scheduler/guides/data/crud_manager_in_depth.md#data-revisions) the response can be made even
shorter:

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

For more details on the sync response structure, please see the
[Crud Manager in depth guide](#Scheduler/guides/data/crud_manager_in_depth.md#sync-response-structure).

## Sending extra HTTP request parameters

Extra params may be added using [transport](#Scheduler/crud/transport/AjaxTransport#config-transport) configuration:

```javascript
const crudManager = new CrudManager({
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

Or dynamically by passing into the [load](#Scheduler/data/CrudManager#function-load) method:

```javascript
crudManager.load({
    request : {
        params : {
            startDate : '2021-01-01'
        }
    }
})
```

Or by listening to the [beforeLoad](#Scheduler/crud/AbstractCrudManagerMixin#event-beforeLoad) event:

```javascript
const crudManager = new CrudManager({
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

You can provide any number of additional stores using the
[crudStores](#Scheduler/crud/AbstractCrudManagerMixin#config-crudStores) config:

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

Or add them programmatically using the [addCrudStore](#Scheduler/crud/AbstractCrudManagerMixin#function-addCrudStore)
method:

```javascript
crudManager.addCrudStore([ store2, store3 ]);
```

## Triggering loading and saving

In the following example the *CrudManager* will start data loading automatically due to the provided
[autoLoad](#Scheduler/data/CrudManager#config-autoLoad) config. In this case the *Crud Manager* schedules asynchronous
loading on construction stage:

```javascript
const crudManager = new CrudManager({
    autoLoad : true,
    loadUrl  : 'php/read.php',
    syncUrl  : 'php/save.php'
});
```

And in order to start data loading manually the *Crud Manager* has a [load](#Scheduler/data/CrudManager#function-load)
method. The method returns a `Promise` that gets resolved once data is loaded and processed by the *Scheduling Engine*:

```javascript
// load data
try {
    await crudManager.load();
    console.log('Data loaded and processed...');
} catch (e) {
    console.log('Data loading error');
}
```

To persist changes automatically, there is the [autoSync](#Scheduler/data/CrudManager#config-autoSync) option. When set to
`true` it causes *Crud Manager* to react on data changes made in the registered stores and schedule data syncing. For
example, in the following snippet the *Crud Manager* will trigger data saving (handled by `php/save.php` script) as soon
as any registered store record gets changed:

```javascript
const crudManager = new CrudManager({
    autoSync : true,
    loadUrl  : 'php/read.php',
    syncUrl  : 'php/save.php'
});
```

And of course manual saving is also possible with the [sync](#Scheduler/data/CrudManager#function-sync) method:

```javascript
try{
    await crudManager.sync();
    console.log('Changes saved...');
} catch(e) {
    console.log('Data saving error');
}
```

## Response format validation

*Crud Manager* will validate responses and log found issues to the browser console. This should help implementing
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

The validation can be disabled with [validateResponse](#Scheduler/data/CrudManager#config-validateResponse) config, which
is recommended in a production environment.


<p class="last-modified">Last modified on 2026-07-22 10:51:33</p>