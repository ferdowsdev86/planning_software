# Understanding the Store

The primary data container in Bryntum is the `Store`. Stores hold the data that powers all Bryntum widgets. Items
within stores are often called records. A record is an instance of the [Model](#Core/data/Model)
or one of the `Model` subclasses.

But you can't use `Store` itself in Bryntum Scheduler Pro. Instead, you have to use one of the subclasses that extend the
`Store` class, such as `AssignmentStore` or `ResourceStore`. We also refer to these subclasses as stores.

For example, you can use `ResourceStore` in a Bryntum Scheduler Pro:

```javascript
new SchedulerPro({
  resourceStore : {
    data: [
      { id : 1, name : "ABBA", country : "Sweden" },
      { id : 2, name : "Beatles", country : "UK" }
    ]
  }
});
```

Different stores are used for different Bryntum components.

Bryntum SchedulerPro uses the following Stores to hold data.

| Store                                                                                     | Description                                | 
|-------------------------------------------------------------------------------------------|--------------------------------------------|
| [`ResourceStore`](#SchedulerPro/view/SchedulerPro#config-eventStore)                      | Holds a collection of resources            |
| [`EventStore`](#SchedulerPro/view/SchedulerPro#config-eventStore)                         | Holds a collection of events               |
| [`AssignmentStore`](#SchedulerPro/view/SchedulerPro#config-assignmentStore)               | Holds a collection of assignments          |
| [`DependencyStore`](#SchedulerPro/view/SchedulerPro#config-dependencyStore)               | Holds a collection of dependencies         |
| [`TimeRangeStore`](#SchedulerPro/view/SchedulerPro#config-timeRangeStore)                 | Holds a collection of time ranges              |
| [`ResourceTimeRangeStore`](#SchedulerPro/view/SchedulerPro#config-resourceTimeRangeStore) | Holds a collection of resource time ranges |

A store uses a [Model](#Core/data/Model) as the blueprint for each row (called record) it holds.

| Store                                                              | Model                                                               | 
|--------------------------------------------------------------------|---------------------------------------------------------------------|
| [`ResourceStore`](#SchedulerPro/data/ResourceStore)                | [`ResourceModel`](#SchedulerPro/model/ResourceModel)                |
| [`EventStore`](#SchedulerPro/data/EventStore)                      | [`EventModel`](#SchedulerPro/model/EventModel)                      |
| [`AssignmentStore`](#SchedulerPro/data/AssignmentStore)            | [`AssignmentModel`](#SchedulerPro/model/AssignmentModel)            |
| [`DependencyStore`](#SchedulerPro/data/DependencyStore)            | [`DependencyModel`](#SchedulerPro/model/DependencyModel)            |
| [`TimeRangeStore`](#Scheduler/data/TimeRangeStore)                 | [`TimeRangeModel`](#Scheduler/model/TimeRangeModel)                 |
| [`ResourceTimeRangeStore`](#Scheduler/data/ResourceTimeRangeStore) | [`ResourceTimeRangeModel`](#Scheduler/model/ResourceTimeRangeModel) |

Similar to the `Store`, `Model` is also extended as `ResourceModel`, `EventModel` and so on.

<img src="SchedulerPro/store-structure.png" class="b-screenshot" alt="stores">

Although we recommend loading all your stores from a single endpoing, you can also load each store separately using 
`readUrl`.

```javascript
new SchedulerPro({
  assignmentStore : {
    autoLoad : true, // auto loads the data when store is initiated
    readUrl  : "data/assignment.json",
  }
});
```

## Data formats

Stores can accept arrays of JavaScript or JSON data in either of the following structures:

* Flat data
* Tree data

### Flat data

You can use non-hierarchical flat data in a `Store`, such as the following JavaScript array:

```javascript
[
  { id : 1, name : 'Dan Stevenson', city : 'Los Angeles', age : 24 },
  { id : 2, name : 'Talisha Babin', city : 'Paris', age : 27 },
  { id : 3, name : 'Maxim Gagarin', city : 'Moscow', age : 34 },
  { id : 4, name : 'Linda Johansson', city : 'Stockholm', age : 29 }
];
```

### Tree data

You can also put hierarchical tree data in a `Store` by using the `children` property to create nested relationships between
data objects. The following JavaScript object is an example of tree data:

```javascript
[
    {
        id       : 1,
        name     : "ABBA",
        country  : "Sweden",
        children : [
            { id : 2, name : "Agnetha" },
            { id : 3, name : "Bjorn" },
            { id : 4, name : "Benny" },
            { id : 5, name : "Anni-Frid" }
        ]
    }
]
```

<div class="note">

You can convert <a href="#Scheduler/guides/data/treedata.md#transforming-flat-data">flat data into tree data</a> by using the
<code>tree: true</code> and <code>transformFlatData: true</code> configuration options.
This allows a TreeStore to automatically structure records based on their <code>parentId</code>.

</div>

## Interacting with `Store` data

You can perform multiple actions on the information contained in stores,
such as filtering or sorting the data within a `Store` by one or more of its fields,
or finding and retrieving a specific record from within a `Store`.

For example, you can sort the `Store` data by one or more fields as follows:

```javascript
const store = new Store({
  sorters : [
    { field : 'age', ascending : false } // descending
  ]
});
```

You can also filter the records within a `Store` as follows:

```javascript
// filters the record to find the ones that have "powers : 'Martial arts'"
store.filter({ 
    property : 'powers', 
    value    : 'Martial arts'
});
```

Alternatively, you can turn on the `filter` feature to let the user apply their own filters on the SchedulerPro component.

<div class="external-example" data-file="Scheduler/guides/readme/filter.js"></div>

You may want to take a look at our [filtering demo](../examples-scheduler/filtering).

To learn more, visit our [guide to using a `Store`](#SchedulerPro/guides/data/storebasics.md). You can also take a look at
our [features](#SchedulerPro/guides/basics/features.md) documentation.

<div class="note">

The multiple stores (such as <code>ResourceStore</code>) that extend from the <code>Store</code> class all inherit the <code>filter</code> property
from <code>Store</code>.

</div>

Continue reading: [Interacting with the server](#SchedulerPro/guides/understanding-data/server-interaction.md)


<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>