# Understanding the Store

The primary data container in Bryntum is the `Store`. Stores hold the data that powers all Bryntum widgets. Items
within stores are often called records. A record is an instance of the [Model](#Core/data/Model)
or one of the `Model` subclasses.

The following code provides a basic example of a `Store`:

```javascript
new Grid({
  store : {
    data: [
      { id : 1, name : "ABBA", country : "Sweden" },
      { id : 2, name : "Beatles", country : "UK" }
    ]
  }
});
```

You can also use stores to load remote data with `autoLoad` and `readUrl`:

```javascript
// Remote data
const store = new AjaxStore({
  autoLoad: true, // auto loads the data when store is initiated
  readUrl: "data.json",
});

new Grid({
  store: store,
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

You don't need to use the `children` property to load tree data in Bryntum Grid. As long as your Grid has nested data,
it can be named anything. For example, in the blog post about
[creating nested data table](https://bryntum.com/blog/creating-nested-data-tables-using-bryntum-grid/), the example
uses tree data without the `children` property.

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

Alternatively, you can turn on the `filter` feature to let the user apply their own filters on the Grid component.

<div class="external-example" data-file="Grid/guides/readme/filter.js"></div>

You may want to take a look at our [filtering demo](../examples/filterbar).

To learn more, visit our [guide to using a `Store`](#Grid/guides/data/storebasics.md). You can also take a look at
our [features](#Grid/guides/basics/features.md) documentation.

<div class="note">

The multiple stores (such as <code>ResourceStore</code>) that extend from the <code>Store</code> class all inherit the <code>filter</code> property
from <code>Store</code>.

</div>

Continue reading: [Interacting with the server](#Grid/guides/understanding-data/server-interaction.md)


<p class="last-modified">Last modified on 2026-07-22 10:46:48</p>