# Displaying data in the SchedulerPro

Every Bryntum component uses [Store](#Core/data/Store) data containers for holding data. Store is then further
extended to have `ResourceStore` and `EventStore` etc.

Bryntum Scheduler Pro uses the following Stores to hold data.

| Store                                                                           | Description                                | 
|---------------------------------------------------------------------------------|--------------------------------------------|
| [`ResourceStore`](#SchedulerPro/view/SchedulerPro#config-resourceStore)                   | Holds a collection of resources            |
| [`EventStore`](#SchedulerPro/view/SchedulerPro#config-eventStore)                         | Holds a collection of events               |
| [`AssignmentStore`](#SchedulerPro/view/SchedulerPro#config-assignmentStore)               | Holds a collection of assignments          |
| [`DependencyStore`](#SchedulerPro/view/SchedulerPro#config-dependencyStore)               | Holds a collection of dependencies         |
| [`TimeRangeStore`](#SchedulerPro/view/SchedulerPro#config-timeRangeStore)                 | Holds a collection of time ranges          |
| [`ResourceTimeRangeStore`](#SchedulerPro/view/SchedulerPro#config-resourceTimeRangeStore) | Holds a collection of resource time ranges |

A store uses a [Model](#Core/data/Model) as the blueprint for each row (called record) it holds.

| Store                                                              | Model                                                               | 
|--------------------------------------------------------------------|---------------------------------------------------------------------|
| [`ResourceStore`](#Scheduler/data/ResourceStore)                   | [`ResourceModel`](#Scheduler/model/ResourceModel)                   |
| [`EventStore`](#Scheduler/data/EventStore)                         | [`EventModel`](#Scheduler/model/EventModel)                         |
| [`AssignmentStore`](#Scheduler/data/AssignmentStore)               | [`AssignmentModel`](#Scheduler/model/AssignmentModel)               |
| [`TimeRangeStore`](#Scheduler/data/TimeRangeStore)                 | [`TimeRangeModel`](#Scheduler/model/TimeRangeModel)                 |
| [`ResourceTimeRangeStore`](#Scheduler/data/ResourceTimeRangeStore) | [`ResourceTimeRangeModel`](#Scheduler/model/ResourceTimeRangeModel) |

Similar to the `Store`, `Model` is also extended as `ResourceModel`, `EventModel` and so on.

## Working with data

Bryntum Scheduler Pro offers multiple ways to work with data, depending on your setup:

- [Using inline or preloaded data](#SchedulerPro/guides/data/displayingdata.md#using-inline-or-preloaded-data)
- [Loading remote data over HTTP(S)](#SchedulerPro/guides/data/displayingdata.md#loading-remote-data-over-https)
- [Using CrudManager](#SchedulerPro/guides/data/displayingdata.md#using-crudmanager)
- [Responding to Store data requests](#SchedulerPro/guides/data/displayingdata.md#responding-to-store-data-requests-advanced-usage)

If you're using inline data, or data already loaded in a custom way, you can input it directly into the SchedulerPro 
instance. For backend server data, an API call can fetch the data. We’ll cover this in more detail later.

## The SchedulerPro project

The SchedulerPro's stores are linked to each other using a project. The project can be thought of as the complete dataset
available to the SchedulerPro: all events, resources, assignments under a single "parent".

The project is responsible for:

* Making the stores available to the SchedulerPro
* Calculating dates and durations asynchronously using its calculation engine
* Keeping references between records up to date (e.g., which resources an event is assigned to)
* Optionally working as a CrudManager

You will learn more about it in a while studying
[Using inline or preloaded data](#SchedulerPro/guides/data/displayingdata.md#using-inline-or-preloaded-data).

In normal UI usage, you might not need to interact much with the project, but it's good to know it's there.
If needed, you can access it using `schedulerpro.project`.

## Using inline or preloaded data

If you have inline data, or data already loaded in a custom way, you can supply it directly when creating a schedulerpro. It
is expected to be an array of JavaScript/JSON objects.

```javascript
const schedulerpro = new SchedulerPro({
    resources : [
        { id : 1, name : 'Batman' },
        { id : 2, name : 'Wolverine' },
        /*...*/
    ],

    events : [
        { id : 1, resourceId : 1, name : 'Fight crime', startDate : new Date(2018,4,1,9,00), endDate : new Date(2018,4,1,17,00) },
        { id : 2, resourceId : 1, name : 'Attend banquet', startDate : new Date(2018,4,1,20,00), endDate : new Date(2018,4,1,23,00) },
        { id : 3, resourceId : 2, name : 'Drink beer', startDate : new Date(2018,4,1,9,00), duration : 8, durationUnit : 'hour' },
        /*...*/
    ]
});
```

If you need more control over the created stores, you can supply store config objects (for info on available configs,
see [API docs](#Core/data/Store#configs)):

```javascript
const schedulerpro = new SchedulerPro({
    resourceStore : {
        sorters : [
            { field : 'name' }      
        ],
        data : [
            { id : 1, name : 'Superman' },
            { id : 2, name : "Batman" },
            { id : 3, name : "Spiderman" },
            { id : 4, name : "Hulk" },
            /*...*/
        ] 
    },
    /*...*/
});
```

The above example will sort the resources in ascending order. Alternatively, you can supply an already existing 
store instance:

```javascript
const resourceStore = new ResourceStore({
    someConfig : "...",
    data       : [
        { id : 1, name : 'Batman' },
        /*...*/
    ]
});

const schedulerpro = new SchedulerPro({
    resourceStore
});
```

Another option is to use `project`:

```javascript
// Inline project data
const schedulerpro = new SchedulerPro({
  project : {
    events      : [/*...*/],
    resources   : [/*...*/],
    assignments : [/*...*/]
  }
});

// - or -

const project = new ProjectModel({
  events      : [/*...*/],
  resources   : [/*...*/],
  assignments : [/*...*/]
});

const schedulerpro = new SchedulerPro({
  project
});
```

This will create a `ResourceStore` and an `EventStore` holding the data. You can access the stores later:

```javascript
schedulerpro.resourceStore.sort('name');
schedulerpro.eventStore.removeAll();
```

To view the data, use:

```javascript
console.log(schedulerpro.resourceStore.toJSON());
console.log(schedulerpro.eventStore.toJSON());
```

If the data is not available at configuration time, and you do not want to use the remote loading capabilities described
below, you can load data any custom way you want and then plug it into the store later:

```javascript
const schedulerpro = new SchedulerPro({
    /*...*/
});

// Using native fetch to load data
const response = await fetch('backend/loadResources.php');
const data = await response.json();

// Maybe do some custom processing before plugging into schedulerpro's store
data.forEach((row, index) => {
    row.index = index;
    row.someValue = Math.random();
    /*...*/
});

// Plug it in as inline data
schedulerpro.resourceStore.data = data;
```

## Loading remote data over HTTP(S)

Both `ResourceStore` and `EventStore` are based on [`AjaxStore`](#Core/data/AjaxStore), which can
load remote data. There are multiple options to load remote data. You can supply a store config
containing a `readUrl`:

```javascript
const schedulerpro = new SchedulerPro({
    resourceStore : {
        readUrl : 'backend/loadResources.php', 
        autoLoad : true // Load upon creation
    }
});
```

Or create the store prior to creating the SchedulerPro:

```javascript
const resourceStore = new ResourceStore({
   readUrl : 'backend/loadResources.aspx'
});

const schedulerpro = new SchedulerPro({
    resourceStore
});

store.load();
```

The data returned from the backend is expected to have the following format by default:

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Batman" }
  ]
}
```

## Using CrudManager

SchedulerPro ships with a helpful class called `CrudManager`, that allows you to load (and later sync) multiple stores in a 
single request to the backend. Set it up like this:

```javascript
const schedulerpro = new SchedulerPro({
    crudManager : {
        autoLoad : true,
        autoSync : true,
        loadUrl  : 'backend/load.php',
        syncUrl  : 'backend/sync.php'
    }
});
```

For more information, see the 
[CrudManager guide](#SchedulerPro/guides/data/crud_manager_project.md) and the
[API docs](#Scheduler/data/CrudManager).

## Responding to Store data requests (advanced usage)

If you do not use an [AjaxStore](#Core/data/AjaxStore), and you need to use lazy loading, remote sorting, remote
filtering and/or remote paging, there is a third option. If any of [lazyLoad](#Core/data/Store#config-lazyLoad),
[remoteSort](#Core/data/Store#config-remoteSort), [remoteFilter](#Core/data/Store#config-remoteFilter) or
[remotePaging](#Core/data/Store#config-remotePaging) configs are set to `true` on a non-AjaxStore, the store will
request data when needed.

The lazy loading functionality has its [own guide](#Scheduler/guides/data/lazyloading.md). For remote sorting, filtering and
paging, please read on.

The [requestData](#Core/data/Store#config-requestData) function will be called when the Store needs new data, which
will happen:

* for [remoteSort](#Core/data/Store#config-remoteSort), on a sort operation.
* for [remoteFilter](#Core/data/Store#config-remoteFilter), on a filter operation.
* for [remotePaging](#Core/data/Store#config-remotePaging), when current page is changed.

When implementing this, it is expected that what is returned is an object with a `data` property containing the
records requested. What is requested will be specified in the `params` object, which will differ depending on the
source of the request.

For [remotePaging](#Core/data/Store#config-remotePaging), the params object will contain a `page` and a `pageSize`
param. It is expected for the implementation of this function to provide a `data` property containing the number of
records specified in the `pageSize` param starting from the specified `page`. It is also required, to include a `total`
property which reflects the total amount of records available to load.

````javascript
class MyStore extends Store {
   static configurable = {
       remotePaging : true    
   } 

   requestData({page, pageSize}){
      const start = (page - 1) * pageSize;
      const data = allRecords.splice(start, start + pageSize);

      return {
         data,
         total : allRecords.length
      }
   }
}
````

If [remoteSort](#Core/data/Store#config-remoteSort) is active, the params object will contain a `sorters` param, 
containing a number of sorter objects. The sorter objects will look like this:

```javascript
{
    "field": "name",
    "ascending": true
}
```

Use the `sorters` param to sort the data before returning:

```javascript
const store = new Store({
   remoteSort   : true, 
   remotePaging : true,
   requestData({ sorters, page, pageSize }){
      const sortedRecords = [...allRecords];

      sorters?.forEach(sorter => sortedRecords.sort((a,b) => {
         const { field, ascending } = sorter;

         if (!ascending) {
             ([b, a] = [a, b]);
         }

         return a[field] > b[field] ? 1 : (a[field] < b[field] ? -1 : 0)
      });

      const start = (page - 1) * pageSize;
      const data = sortedRecords.splice(start, start + pageSize);

      return {
         data,
         total : allRecords.length
      }

   }
})
```

If [remoteFilter](#Core/data/Store#config-remoteFilter) is active, the params object will contain a `filters` param,
containing a number of filter objects. The filter objects will look like this:

```javascript
{
    "field": "country",
    "operator": "=",
    "value": "sweden",
    "caseSensitive": false
}
```

Use the `filters` to filter the data before returning:

```javascript
const store = new Store({
   remoteFilter : true,
   remoteSort   : true,
   remotePaging : true,

   requestData({ filters, sorters, page, pageSize }){
      let filteredRecords = [...allRecords];

      filters?.forEach(filter => {
         const { field, operator, value, caseSensitive } = filter;

         if(operator === '='){
             filteredRecords = filteredRecords.filter(r => r[field] === value);
         }
         else {
             /// ... implement other filter operators
         }
      });

      sorters?.forEach(sorter => filteredRecords.sort((a,b) => {
         const { field, ascending } = sorter;

         if (!ascending) {
             ([b, a] = [a, b]);
         }

         return a[field] > b[field] ? 1 : (a[field] < b[field] ? -1 : 0)
      }));

      const start = (page - 1) * pageSize;
      const data = filteredRecords.splice(start, start + pageSize);

      return {
         data,
         total : filteredRecords.length
      }

   }
})
```

### Framework 2-way binding

For some framework users, where the `data` property of the SchedulerPro has been bound to a state-monitored data source,
implementing the [requestData function](#Core/data/Store#config-requestData) is not a viable option. In these cases,
it is better to add a listener to the [requestData event](#Core/data/Store#event-requestData) instead.

The main difference is that a [requestData event](#Core/data/Store#event-requestData) listener cannot return the data
directly. Instead, the data property should be updated (which will be done by the framework), and if the Store is paged,
the [totalCount property](#Core/data/Store#property-totalCount) be set (will not be done by the framework).

<div class="framework-tabs">
<div data-name="js">

```javascript
const store = new Store({
    remoteFilter : true,
    remoteSort   : true,
    remotePaging : true,
    listeners: {
        requestData({
            source,
            filters,
            sorters,
            page,
            pageSize
        }) {
            let filteredRecords = [...allRecords];

            filters?.forEach(filter => {
                const {
                    field,
                    operator,
                    value,
                    caseSensitive
                } = filter;

                if (operator === '=') {
                    filteredRecords = filteredRecords.filter(r => r[field] === value);
                }
                else {
                    /// ... implement other filter operators
                }
            });

            sorters?.forEach(sorter => filteredRecords.sort((a, b) => {
                const {
                    field,
                    ascending
                } = sorter;

                if (!ascending) {
                    ([b, a] = [a, b]);
                }

                return a[field] > b[field] ? 1 : (a[field] < b[field] ? -1 : 0)
            }));

            const start = (page - 1) * pageSize;
            const data = filteredRecords.splice(start, start + pageSize);

            source.data = data;
            source.totalCount = filteredRecords.length;
        }
    }
})
```

</div>
<div data-name="react">

```typescript
const App = props => {
    const schedulerproprops = {
        remoteFilter : true,
        remoteSort   : true,
        remotePaging : true,
    }

    function App() {
        const ref = useRef<BryntumSchedulerPro>();

        // Data managed by Redux
        const data = useSelector((state : RootState) => state.data.rows);
        const total = useSelector((state: RootState) => state.data.total);
        const dispatch : AppDispatch = useDispatch();

        useEffect(() => {
            const schedulerpro = gridRef.current.instance;
            const store = schedulerpro.store as Store;

            // Listen to the Store's requestData function to be able to intercept data requests
            store.on({
                requestData({ page, pageSize, sorters, filters } : { page:number; pageSize:number; sorters:Array<any>; filters:Array<any> }) {
                    // dispatch is a Redux thing, and loadData is a Redux data slice
                    dispatch(loadData({ page, pageSize, sorters, filters }));
                }
            });

            store.loadPage(1, {});
        }, []);

        return (
            <BryntumSchedulerPro
                ref={ref}
                {...schedulerproProps}
                data={data}
            />
        );
    }
}
```

</div>
<div data-name="vue">

```typescript
<template>
    <bryntum-schedulerpro
        ref="schedulerproRef"
        v-bind="schedulerproProps"
        :data="data"
    />
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { useSelector, useDispatch } from 'vuex';
    import { BryntumSchedulerPro } from '@bryntum/schedulerpro-vue-3';

    const schedulerproRef = ref(null);
    const schedulerproProps = {
        store : {
            remoteFilter: true,
            remoteSort: true,
            remotePaging: true,
    }
};

    // Data managed by Vuex
    const data = useSelector((state) => state.data.rows);
    const dispatch = useDispatch();

    onMounted(() => {
        const schedulerpro = schedulerproRef.value.instance;
        const store = schedulerpro.store;

        // Listen to the Store's requestData function to be able to intercept data requests
        store.on({
            requestData({ page, pageSize, sorters, filters }) {
            dispatch('loadData', { page, pageSize, sorters, filters });
        },
    });

    store.loadPage(1, {});
});
</script>
```

</div>
<div data-name="angular">

```typescript
import { Component, OnInit, ViewChild } from '@angular/core';
import { BryntumGridComponent } from '@bryntum/grid-angular';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-my-component',
    template: `
    <bryntum-grid #gridRef [store]="storeConfig!" [data]="data!"></bryntum-grid>
  `,
})
export class MyComponent implements OnInit {
    @ViewChild('schedulerproRef') schedulerproRef!: BryntumSchedulerProComponent;
    data: any[] = []; //
    storeConfig: any = {
        remoteFilter: true,
        remoteSort: true,
        remotePaging: true,
    };

    constructor(private store: Store) {} // Inject NgRx Store

    ngOnInit(): void {
        const schedulerpro = this.schedulerproRef.instance;
        const bryntumStore = schedulerpro.store;

        // Listen to the Store's requestData function to be able to intercept data requests
        bryntumStore.on({
            requestData({ page, pageSize, sorters, filters }) {
                this.store.dispatch({ type: '[Data] Load Data', payload: { page, pageSize, sorters, filters } });
            },
        });

        bryntumStore.loadPage(1, {});
    }
}
```

</div>
</div>

## Customizing SchedulerPro stores

There are multiple ways to customize a SchedulerPro store. The easiest way is to pass a configuration object 
in the `SchedulerPro` instance:

```javascript
const schedulerpro = new SchedulerPro({
    // other config
    assignmentStore : {
        allowNoId : false,
        createUrl : '/create.php',
        readUrl   : '/read.php',
        updateUrl : '/update.php',
        deleteUrl : '/delete.php'
    }
});
```

Another way is to create a new store instance with custom configurations, useful for reusing it in multiple places:

```javascript
const customAssignmentStore = new AssignmentStore({
    allowNoId : false,
    createUrl : '/create.php',
    readUrl   : '/read.php',
    updateUrl : '/update.php',
    deleteUrl : '/delete.php'
});
```

Next, assign it in the SchedulerPro instance:

```javascript
const schedulerpro = new SchedulerPro({
    // other config
    assignmentStore : customAssignmentStore
});
```

You can subclass it if you are going to use it in multiple places or to organize the code better:

```javascript
class CustomEventStore extends EventStore {
    static $name = 'CustomEventStore';
    static configurable = {
        allowNoId : false,
        createUrl : '/create.php',
        readUrl   : '/read.php',
        updateUrl : '/update.php',
        deleteUrl : '/delete.php',
        tree         : true
    };
}
```

Then create a new instance of it and pass it the `SchedulerPro` instance:

```javascript
const customEventStore = new CustomEventStore();

const schedulerpro = new SchedulerPro({
    // other config
    eventStore : customEventStore
});
```

You can confirm it doing `console.log(schedulerpro.eventStore)`.

## Populating multiple stores at once

If your app doesn't use `CrudManager` (nor `AjaxStore`) to load data, you can still use it to populate all SchedulerPro 
stores in a single call with data fetched through other means. Depending on your setup, this might be more convenient 
than populating one store at the time.

To enable this, you need to configure your SchedulerPro with an "inactive" `CrudManager`, by not supplying any urls for it:

```javascript
const schedulerpro = new SchedulerPro({
    crudManager : {},
    ...
})
```

You can then populate all stores at once by calling `loadCrudManagerData()`:

```javascript
schedulerpro.crudManager.loadCrudManagerData(data);
```

The data is expected to follow the `CrudManager` format, with one section per store being populated (can be JSON):

```javascript
{
   resources : {
      rows : [ ... ]
   },
   events : {
      rows : [ ... ]
  },
  // ... more stores ... 
}
```

For example:

```javascript
schedulerpro.crudManager.loadCrudManagerData({
   events : {
      rows : [
         { id : 1, name : 'Important meeting', startDate : '2053-10-23', duration : 1 }, 
         { id : 2, name : 'Travel', startDate : '2053-10-24', duration : 4 }
      ]
   },
   resources : {
      rows : [
         { id : 1, name : 'Hillinghead' },
         { id : 2, name : 'Hasan' }
      ]
   },
   assignments : {
      rows : [
         { id : 1, resourceId : 1, eventId : 1 },
         { id : 2, resourceId : 1, eventId : 2 },
         { id : 3, resourceId : 2, eventId : 2 }
      ]
   }
});
```

<div class="note">
Note that for SchedulerPro the <code>project</code> is its <code>crudManager</code>. So the above call could be written 
as <code>schedulerpro.project.loadCrudManagerData(...)</code> instead. 
</div>

## ResourceStore and ResourceModel

As mentioned earlier, a SchedulerPro uses a `ResourceStore` to hold instances of `ResourceModel`. In a horizontal
schedule this represents the rows. The model describes what data each record contains (fields). By
default `ResourceModel` defines only three fields:

* name
* eventColor
* eventStyle

The `name` field is what it sounds like, a text field for a resource name. For more information on `eventColor`
and `eventStyle`, read the guide on [Styling](#SchedulerPro/guides/customization/styling.md).

## EventStore and EventModel

A SchedulerPro also requires an `EventStore` to hold instances of `EventModel`. Records in this store represents the bars
displayed in the schedule. There are multiple predefined fields, the most important ones being (
see [EventModel in API docs](#Scheduler/model/EventModel) for a complete list):

| Fields          | Description                                                                              |
|-----------------|------------------------------------------------------------------------------------------|
| `resourceId`    | Which resource this event is assigned to. Only valid with single assignment              |
| `name`          | Event name, displayed in the event bars by default                                       |
| `startDate`     | Start date, either as a date or a parseable date string                                  |
| `endDate`       | An event should either have an endDate or a duration. The missing one will be calculated |
| `duration`      | Duration, added to startDate to determine endDate. Remember to also specify durationUnit |
| `durationUnit`  | The unit in which the duration is given. Needed to make the calculation correct          |

## Defining additional fields

In many applications you will want to extend the built-in models with additional fields. There is a few different ways
of achieving this, and while this section uses `ResourceModel` for the examples they apply to all models.

### Autogenerated fields

The properties of the first record in your data will be turned into fields on the model:

```javascript
const resourceStore = new ResourceStore({
    data : [
        { name : 'Wolverine', powers : 'Regeneration' },
        { name : 'Deadpool', powers : 'Yes I have, great powers' }   
    ]
});
```

The code above will create a `ResourceStore` with two records, based on a generated `ResourceModel` containing the
added `powers` field (name is already there by default).

### Custom Model

If you need more control over the fields a model contains, you have two options. If you do not need to reuse the Model
you can simply specify the additional fields when creating the store:

```javascript
const resourceStore = new ResourceStore({
    fields : ['powers', 'affiliation'],
    data : [
        { name : 'Wolverine', powers : 'Regeneration' },
        /*...*/
    ]
});
```

You can also create a subclass of a `Model` and define the fields you need on it:

```javascript
class SuperHero extends ResourceModel {
    static fields = [
        // New custom fields:
        'powers', 
        'affiliation' 
    ];
}

const resourceStore = new ResourceStore({
    modelClass : SuperHero,
    data : [/*...*/]
}); 
```

See the API docs for [Model](#Core/data/Model) for more information on defining and mapping fields.

### Models are reactive!

Fields are turned into setters on the records, which makes them reactive. For example:

```javascript
const schedulerpro = new SchedulerPro({
    events : [
        { id : 3, resourceId : 2, name : 'Drink beer', startDate : new Date(2018,4,1,9,00), duration : 8, durationUnit : 'hour' },
    ]
});

schedulerpro.eventStore.first.duration = 10; 
```

The above will update the schedulerpro on the fly, giving Wolverine more time to drink beer.


<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>