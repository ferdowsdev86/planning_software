# Using sparse indexes

As described in the [Grid guide](#Grid/guides/data/sparseindex.md), `Store` can use sparse indexes. This means that the
store will not update a continuous index of all records, but instead will only modify the `sparseIndex` property of
records that have been moved in the UI.

When a `Store` is to be used directly, just configure it with `useSparseIndex : true` to enable this feature:

```javascript
const store = new Store({
    useSparseIndex : true
});
```

In a `Scheduler` application, the stores are often added to a [CrudManager](#Scheduler/data/CrudManager), and by
default not configured to use `sparseIndex`. To enable this feature, the `useSparseIndex` config must be set to `true`
on the store instance. In many cases, this will be the `resourceStore` of the project:

```javascript
const crudManager = new CrudManager({
    resourceStore : {
        useSparseIndex : true
    }
});
```

Utilizing this feature is only meaningful in conjunction with persistent storage, as the sparse index values must be
saved and restored when loading data.

See also the [Crud Manager guide](#Scheduler/guides/data/crud_manager.md).

## How it works

See more detailed information in the `Grid` guide:
[Using sparse indexes](#Grid/guides/data/sparseindex.md#how-it-works).


<p class="last-modified">Last modified on 2026-07-22 10:39:14</p>