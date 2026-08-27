# Displaying data in a Grid

Every Bryntum component uses [Store](#Core/data/Store) data containers for holding data.

A store uses a [Model](#Core/data/Model) as the blueprint for each row (called record) it holds.

In this section, the focus will be on the fundamental process of presenting data within the Grid. 
For a comprehensive understanding of the Store and its functionalities, 
refer to [Using a store](#Core/guides/data/storebasics.md).

This section outlines the available approaches to populate a Grid with data, that includes three methods:
- Using inline or preloaded data
- Loading remote data over HTTP(S)
- Responding to Store data requests

## Using inline or preloaded data

If you have inline data, or data already fully loaded in a custom way, you can supply it directly when creating a grid:

<div class="framework-tabs">
<div data-name="js">

```javascript
const grid = new Grid({
    columns : [/*...*/],
    data : [
        { id : 1, name : 'Batman' },
        { id : 2, name : 'Wolverine' },
        /*...*/
    ] 
});
```

</div>
<div data-name="react">

```javascript
const App = props => {
    const [data, setData] = useState([
        { id : 1, name : 'Batman' },
        { id : 2, name : 'Wolverine' },
        ...
    ]);

    return <BryntumGrid data={data} />
}
```

</div>
<div data-name="vue">

```html
<bryntum-grid :data="data" />
```

```javascript
export default {
  setup() {
    return {
      data : reactive([
        { id : 1, name : 'Batman' },
        { id : 2, name : 'Wolverine' },
        ...
      ])
    };
  }
}
```

</div>
<div data-name="angular">

```html
<bryntum-grid [data]="data"></bryntum-grid>
```

```typescript
@Component()
export class AppComponent {
    data = [
        { id : 1, name : 'Batman' },
        { id : 2, name : 'Wolverine' },
        ...
    ]
}
```

</div>
</div>

Another option if you need to configure the store is to supply a store config object (for info on available configs, see
API docs for [Store](#Core/data/Store#configs)):

<div class="framework-tabs">
<div data-name="js">

```javascript
const grid = new Grid({
    store : {
        sorters : [
            { field : 'name' }      
        ],
        data : [
            { id : 1, name : 'Batman' },
            ...
        ] 
    }
});
```

</div>
<div data-name="react">

```javascript
const App = props => {
    const [store, setStore] = useState({
        sorters : [
            { field : 'name' }      
        ],
        data : [
            { id : 1, name : 'Batman' },
            ...
        ] 
    });

    return <BryntumgRid store={store} />
}
```

</div>
<div data-name="vue">

```html
<bryntum-grid :store="store" />
```

```javascript
export default {
  setup() {
    return {
      store : reactive({
          sorters : [
              { field : 'name' }
          ],
          data : [
              { id : 1, name : 'Batman' },
              ...
          ]
      })
    };
  }
}
```

</div>
<div data-name="angular">

```html
<bryntum-grid [store]="store"></bryntum-grid>
```

```typescript
@Component()
export class AppComponent {
    store = {
        sorters : [
            { field : 'name' }      
        ],
        data : [
            { id : 1, name : 'Batman' },
            ...
        ] 
    }
}
```

</div>
</div>

A third option is to supply an already existing `Store` instance:

<div class="framework-tabs">
<div data-name="js">

```javascript
const store = new Store({
   someConfig : "...",
   data : [
       { id : 1, name : 'Batman' },
       /*...*/
   ]  
});

const grid = new Grid({
   store
});
```

</div>
<div data-name="react">

```javascript
const App = props => {
    const myStore = new Store({
       someConfig : "...",
       data : [
           { id : 1, name : 'Batman' },
           /*...*/
       ]
    });

    const [store, setStore] = useState(myStore);

    return <bryntum-grid store={store} />
}
```

</div>
<div data-name="vue">

```html
<bryntum-grid :store="store" />
```

```javascript
export default {
  setup() {
    const myStore = new Store({
       someConfig : "...",
       data : [
           { id : 1, name : 'Batman' },
           /*...*/
       ]
    });

    return {
      store : myStore
    };
  }
}
```

</div>
<div data-name="angular">

```html
<bryntum-grid [store]="store"></bryntum-grid>
```

```typescript
@Component()
export class AppComponent {
    store = new Store({
        sorters : [
            { field : 'name' }      
        ],
        data : [
            { id : 1, name : 'Batman' },
            ...
        ] 
    })
}
```

</div>
</div>


Inline data is expected to be an array of JavaScript objects. If no model/fields are defined for the store 
[more info](#Grid/guides/data/storebasics.md) the properties of the first entry in the array are used as fields 
(`id` and `name` in the examples above).

If the data is not available at configuration time, and you do not want to use the remote loading capabilities described
below, you can load data any custom way you want and then plug it into the store later:

```javascript
const grid = new Grid({
    columns : [/*...*/]
});

// Using native fetch to load data
const response = await fetch('backend/load.php');
const data = await response.json();

// Maybe do some custom processing before plugging into grids store
data.forEach((row, index) => {
    row.index = index;
    row.someValue = Math.random();
    /*...*/
});

// Plug it in as inline data
grid.store.data = data;
```

## Loading remote data over HTTP(S)

The easiest way to load remote data is to use and [AjaxStore](#Grid/guides/data/ajaxstore.md). Provide it with a 
`readUrl` and it takes care of the loading. There are a few different ways to set it up. Either supply a store config
containing a `readUrl`:

<div class="framework-tabs">
<div data-name="js">

```javascript
const grid = new Grid({
    store : {
        // When Grid finds readUrl in the store config it will create an AjaxStore
        readUrl : 'backend/load.php',
        // Load upon creation
        autoLoad : true 
    }
});
```

</div>
<div data-name="react">

```javascript
const App = props => {
    const [store, setStore] = useState({
        // When Grid finds readUrl in the store config it will create an AjaxStore
        readUrl : 'backend/load.php',
        // Load upon creation
        autoLoad : true 
    });

    return <bryntum-grid store={store} />
}
```

</div>
<div data-name="vue">

```html
<bryntum-grid :store="store" />
```

```javascript
export default {
  setup() {
    return {
      store : reactive({
         // When Grid finds readUrl in the store config it will create an AjaxStore
         readUrl : 'backend/load.php',
         // Load upon creation
         autoLoad : true
      })
    };
  }
}
```

</div>
<div data-name="angular">

```html
<bryntum-grid [store]="store"></bryntum-grid>
```

```typescript
@Component()
export class AppComponent {
    store = {
        // When Grid finds readUrl in the store config it will create an AjaxStore
        readUrl : 'backend/load.php',
        // Load upon creation
        autoLoad : true 
    }
}
```

</div>
</div>

Or create the store prior to creating the grid:

<div class="framework-tabs">
<div data-name="js">

```javascript
const store = new AjaxStore({
   readUrl : 'backend/load.aspx'
});

const grid = new Grid({
   store
});

store.load();
```

</div>
<div data-name="react">

```javascript
const App = props => {
    const myStore = new AjaxStore({
        readUrl : 'backend/load.aspx'
    });

    return <bryntum-grid store={myStore} />
}
```

</div>
<div data-name="vue">

```html
<bryntum-grid :store="store" />
```

```javascript
export default {
  setup() {
    const myStore = new AjaxStore({
        readUrl : 'backend/load.aspx'
    });

    return {
      store : myStore
    };
  }
}
```

</div>
<div data-name="angular">

```html
<bryntum-grid [store]="store"></bryntum-grid>
```

```typescript
@Component()
export class AppComponent {
    store = new AjaxStore({
        readUrl : 'backend/load.aspx'
    })
}
```

</div>
</div>

The data returned from the backend is expected to have the following format:

```json
{
    "success" : true,
    "data" : [  
        { "id" : 1, "name" : "Batman" },
        { "..." : "..." }
    ]
}
```

## Responding to Store data requests (advanced usage)

If you do not use an [AjaxStore](#Core/data/AjaxStore), and you need to use lazy loading, remote sorting, remote 
filtering and/or remote paging, there is a third option. If any of [lazyLoad](#Core/data/Store#config-lazyLoad), 
[remoteSort](#Core/data/Store#config-remoteSort), [remoteFilter](#Core/data/Store#config-remoteFilter) or 
[remotePaging](#Core/data/Store#config-remotePaging) configs are set to `true` on a non-AjaxStore, the store will
request data when needed.

The lazy loading functionality has its [own guide](#Grid/guides/data/lazyloading.md). For remote sorting, filtering and
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
containing a number of sorters objects. The sorter objects will look like this:

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

For some framework users, where the `data` property of the Grid has been bound to a state-monitored data source, 
implementing the [requestData function](#Core/data/Store#config-requestData) is not a viable option. In these cases, 
it is better to add a listener to the [requestData event](#Core/data/Store#event-requestData) instead.

The main difference is that a [requestData event](#Core/data/Store#event-requestData) listener cannot return the data
directly. Instead, the [data property](#Grid/view/Grid#property-data) should be updated (which will be done by
the framework), and if the Store is paged, the [totalCount property](#Core/data/Store#property-totalCount) be set (will
not be done by the framework).

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
import { BryntumDemoHeader, BryntumGrid } from '@bryntum/grid-react';
import { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

const App = props => {
    const gridProps = {
        store : {
            remoteFilter: true,
            remoteSort: true,
            remotePaging: true,
        }
    }

    function App() {
        const gridRef = useRef<BryntumGrid>();
        
        // Data managed by Redux
        const data = useSelector((state : RootState) => state.data.rows);
        const total = useSelector((state: RootState) => state.data.total);
        const dispatch : AppDispatch = useDispatch();

        useEffect(() => {
            const grid = gridRef.current.instance;
            const store = grid.store as Store;

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
            <BryntumGrid
                ref={gridRef}
                {...gridProps}
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
    <bryntum-grid
        ref="gridRef"
        v-bind="gridConfig"
        :data="data"
    />
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { useSelector, useDispatch } from 'vuex';
    import { BryntumGrid } from '@bryntum/grid-vue-3';

    const gridRef = ref(null);
    const gridConfig = {
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
        const grid = gridRef.value.instance;
        const store = grid.store;
        
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
    @ViewChild('gridRef') gridRef!: BryntumGridComponent;
    data: any[] = []; //
    storeConfig: any = {
        remoteFilter: true,
        remoteSort: true,
        remotePaging: true,
    };

    constructor(private store: Store) {} // Inject NgRx Store

    ngOnInit(): void {
        const grid = this.gridRef.instance;
        const bryntumStore = grid.store;

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


<p class="last-modified">Last modified on 2026-07-22 10:39:04</p>