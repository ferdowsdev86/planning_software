# Using sparse indexes

`Store` can use sparse indexes. This means that the store will not update a continuous index of all records, but instead
will only modify the `sparseIndex` property of records that have been moved in the UI. This is particularly useful when
working with large datasets where re-ordering would usually cause re-indexing of a significant number of records. To
persist the order of records, the `sparseIndex` field must be persisted on the server. To avoid having to update a large
number of records when loading data for the first time, the `sparseIndex` should be generated in the backend through a
one-time database operation.

Utilizing this feature is only meaningful in conjunction with persistent storage, as the sparse index values must be
saved and restored when loading data.

To use this feature, set the `useSparseIndex` config to `true` when creating the store:

```javascript
const store = new AjaxStore({
    useSparseIndex : true,
    ...
});
```

## How it works

When this feature is enabled, an additional numeric field `sparseIndex` will be added to the store's `modelClass`. This
field will be populated with data from the backend if present, otherwise it will be automatically populated when records
are added to the store. The records will be initially sorted ascending by this field; records without a `sparseIndex`
value will be sorted to the end of the dataset and be updated with an incremental value.

When records are moved in the UI, only the `sparseIndex` field of the moved record will be updated. The new value will
be calculated as the average of the `sparseIndex` values of the records before and after the moved record, i.e. moving a
record between a predecessor with `sparseIndex : 3` and a successor with `sparseIndex : 4`, the moved record will be
updated with `sparseIndex : 3.5`. If the moved record is placed at the start or end of the dataset, the new value will
be the closest greater or smaller integer value from the `sparseIndex` of the adjacent record. Multiple records can be
moved at once, in which case the same logic applies, but the values will be distributed evenly within the `sparseIndex`
values of the records before and after the moved block: when moving three records between a predecessor with
`sparseIndex : 3` and a successor with `sparseIndex : 4`, the moved records will be updated with `sparseIndex` values of
`3.25`, `3.5` and `3.75`. Moving records to the start of the dataset will assign `sparseIndex` values of
`0`, `-1`, `-2` and so forth, or negative fractional numbers when inserting between records that already have negative
`sparseIndex` values.

When persisting the order of records, the `sparseIndex` field must be sent to the server. This can be done immediately
by configuring the store with `autoCommit : true`. Without `autoCommit`, it is up to the application to persist the
modified records to the storage. When loading data, the store must be sorted by the `sparseIndex` field to restore the
order of records. In most cases that is being handled by the feature plugin itself; the order in which the data arrives
is then not important.

## Sparse indexes in a `TreeStore`

`TreeNode` also supports sparse indexes. The `sparseIndex` field will be added to the `modelClass` of the store. One
notable difference: The `sparseIndex` values are only unique within their respective level in the tree. Moving nodes
within the same level will update the `sparseIndex` values of the moved nodes as described above. Moving nodes to a
different level will assign new `sparseIndex` values to the moved nodes, calculated based on the `sparseIndex` values of
the nodes in the target level. To persist a reconstructable order of nodes, the `parentId` field must then be synced
alongside with `sparseIndex`.

## Interaction with sorting, grouping, and filtering

When using sparse indexes, the store will automatically be sorted by the `sparseIndex` field. If the store is sorted
by another field, the sorting by `sparseIndex` will be suspended, while its values are kept untouched. When the store is
un-sorted, the sparse index sorting will be re-applied. Re-ordering records in a _sorted_ store would require _all_
`sparseIndex` values to be updated and persisted to the backend.

Note that re-ordering records when the store is sorted by another field will cancel the sorting, and the store will be
sorted by `sparseIndex` again, which might cause undesired UI updates. For that reason, it is *discouraged* to use
sorting on a store in conjunction with the `sparseIndex` feature, unless the sorting is applied only temporarily and the
application is aware of the implications. The same applies to filtering or grouping, which will also interact with the
`sparseIndex` ordering in similar, potentially undesirable ways.


<p class="last-modified">Last modified on 2026-07-22 10:39:04</p>