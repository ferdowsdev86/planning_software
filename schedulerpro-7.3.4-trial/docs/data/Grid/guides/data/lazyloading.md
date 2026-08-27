# Lazy data loading (infinite scroll)

Enabling lazy loading of Grid records makes it possible to load the dataset in chunks when they are scrolled into view,
instead of loading the complete dataset at once.

Begin by setting the [lazyLoad](#Core/data/Store#config-lazyLoad) config on the Store to `true` to enable this
behaviour. You will also need something that initiate the first load, either use 
[autoLoad](#Core/data/Store#config-autoLoad) or call the [load](#Core/data/Store#function-load) function manually.

The Store will now report to the Grid that there is more records in the store than the ones that has been loaded. When
the Grid scrolls close to those records, the Store will initiate a new load request and respond to the Grid with a
promise that resolves to the loaded record. While the promise is unresolved, the row will be rendered with a "skeleton"
placeholder, indicating that the row is being loaded.

## Using an AjaxStore

If your store is an [AjaxStore](#Core/data/AjaxStore) you only need to configure
the [readUrl](#Core/data/AjaxStore#config-readUrl), and then you are done. At least on the frontend. For backend
implementation please read that chapter a bit further down this page.

```javascript
new Grid({
    store: {
        // This will create an AjaxStore
        readUrl: 'backend/read',
        // This will activate the lazy load functionality
        lazyLoad: true,
        // This will load the Store initially upon creation
        autoLoad: true
    }
});
```

## Using a regular Store

If you are using a regular [Store](#Core/data/Store), then you will need to implement
the [requestData](#Core/data/Store#config-requestData) function with your own
data loading logic. This function will be called each time the Store gets requests for records that has not yet been
loaded.

[requestData](#Core/data/Store#config-requestData) will be called with a single object argument containing
a `startIndex` and a `count` value. For a
detailed explanation of `startIndex` and `count`, read the "Record indexes and count" chapter below.

```javascript
class MyStore extends Store {
    static configurable = {
        lazyLoad: true,
        autoLoad: true
    };

    async requestData({
        startIndex,
        count
    }) {
        const response = await fetchData({
            startIndex,
            count
        });

        // The requestData function is expected to return an object
        // with a data property, which value contains all the records
        return {
            data: response.data,
            // And optionally, but recommended, is to provide a total
            // count of all available records
            total: response.totalCount
        }
    }
}

new Grid({
    store: new MyStore()
});
```

## Using a Tree store

If the Store is configured with [tree](#Core/data/Store#config-tree) set to `true` there are some very important
differences to know about:

1. For the lazy load functionality to recognize that a store is expecting tree data, the
   [tree](#Core/data/Store#config-tree) config must be set to `true`. The [autoTree](#Core/data/Store#config-autoTree) 
   config is not supported.
2. The [isFullyLoaded](#Core/data/Model#field-isFullyLoaded) field can be set from the backend, indicating that a
   [TreeNode](#Core/data/mixin/TreeNode) should not initiate any more load requests. If omitted, it will be set to
   `true` automatically when a load request returns a smaller number of children than asked for.

When using a Tree store, a load request will be made in the following scenarios:
1. The initial load request, either by [autoLoad](#Core/data/Store#config-autoLoad) or a separate [load](#Core/data/Store#function-load) call.
2. When a [TreeNode](#Core/data/mixin/TreeNode) is rendered and:
    * it has [expanded](#Core/data/Model#field-expanded) set to `true` and
      [isFullyLoaded](#Core/data/Model#field-isFullyLoaded) set to `false`
    * is the last child of a parent which has [isFullyLoaded](#Core/data/Model#field-isFullyLoaded) set to `false`
3. A TreeNode with [expanded](#Core/data/Model#field-expanded) set to `false` is manually or programmatically expanded

It is allowed, and in most cases recommended, to include nested data in the server responses. Please read more in the
upcoming chapters, which some have a section named "Tree store differences".

## Record indexes and Chunks

The Store will initiate a request for data when a record index is requested but not already loaded. This request will
include more records, as it would be poor performance to load one record at a time (configurable). 

`startIndex` will be calculated by subtracting [chunkSize](#Core/data/Store#config-lazyLoad) from the requested record's
index in the Store.

`count` will be calculated by adding [chunkSize](#Core/data/Store#config-lazyLoad) to the requested record's index in
the Store and subtracting the `startIndex`.

As the default `chunkSize` is set to 100, a normal request will be for a total of 200 records. But, the range can be
smaller if parts of the range is already loaded.

The lazy loading functionality is completely dependent on record indexes. That makes the sorting of the records very
important. Please read the upcoming three chapters to learn more.

### Tree store differences

For a Tree store, each level of children will be loaded independently. In addition to the params mentioned above, a
`parentId` param will also be included in the request. For the top level nodes, the `parentId` will be set to `root`.
Also, the default [chunkSize](#Core/data/Store#config-lazyLoad) is set to 50.

## Sorting and filtering

Local sorting and filtering is not supported when the store is lazy loaded. Remote sorting and filtering, however, is
supported. If you use an AjaxStore configured with remote sorting or filtering (which is done by setting
[filterParamName](#Core/data/AjaxStore#config-filterParamName) or
[sortParamName](#Core/data/AjaxStore#config-sortParamName)), the sorter and/or filter information will be available in 
the fetch request parameters.

If you do not use an AjaxStore, you should configure the Store with [remoteSort](#Core/data/Store#config-remoteSort)
or [remoteFilter](#Core/data/Store#config-remoteFilter). This will add a `sorters` and/or a `filters` param to the
[requestData](#Core/data/Store#config-requestData) call.

```javascript
class MyStore extends Store {
    static configurable = {
        remoteSort:true,
        remoteFilter:true,
        lazyLoad: true,
        autoLoad: true
    };

    async requestData({
        startIndex,
        count,
        sorters,
        filters
    }) {
        const response = await fetchData({
            startIndex,
            count,
            sorters,
            filters
        });
        
        return {
            data: response.data,
            total: response.totalCount // This should be the total count after filtering
        }
    }
}

new Grid({
    store: new MyStore()
});
```

A `filter` or a `sort` action on the Store will clear all loaded records and a new load request will be made. This is
because a `sort` or a `filter` action will change the record's indexes, which makes the loaded dataset invalid.

## Adding and removing

Adding and removing records also affects the indexes of the complete dataset. It is important that the backend always is
synced with the Store, which is why an `add` or `remove` action that has **not yet been synced** to the server, will
suspend all further load actions until the sync is completed.

When adding a record, it will be added to the end of the complete dataset. In this case it is important that a `total`
count is provided in the load request's response from the backend. Otherwise, the loaded dataset will be invalid, and a
complete refresh is required.

When inserting a record, you must be sure that the insertion index is exactly the same as the record will have when it
is requested in a `load` action. Otherwise, the loaded dataset will be invalid, and a complete refresh is required.

## Backend

Regardless of using AjaxStore or another solution, your backend must respond to the request params correctly. The
backend should respond to the `startIndex` and `count` param by performing a range extraction that starts with the
record *on* the `startIndex` and takes the number of records provided in `count`.

How you extract your data range is different in different programming languages. Sometimes you can use a `startIndex`
and a `count`, and other times you would need to use an `endIndex` instead of the `count`. That could look something
like this:
```
(python)

# Let us say that startIndex = 0 and count = 200

endIndex = startIndex + count               # endIndex would be 100 
records = allRecords[startIndex:endIndex]   # records would be [0, ..., 99]
```

Here is an (untested) example of a simple endpoint implementation using express.js with a MySQL server:

```javascript
app.get('/read', async(req, res) => {
    const
        {
            startIndex,
            count
        } = req.query, // Params provided by the client
        total = await new Promise(resolve => {
            connection.query('SELECT COUNT(*) from Records', (error, result) => resolve(result));
        }),
        data = await new Promise(resolve => {
            connection.query(`SELECT * from Records ORDER BY id LIMIT ${count} OFFSET ${startIndex}`,
                (error, results) => resolve(results));
        });

    // Return the expected JSON response
    res.json({
        success: true,
        total,
        data
    });
});
```

### Tree store differences

For Tree data, the requests will be more frequent and a bit different. Each parent will load its own children, which 
means that for every parent, there will be at least one request made (depending on child count and
[chunkSize](#Core/data/Store#config-lazyLoad)).

The initial load request will have `parentId` set to `root`. This request should be responded to with the records that
have no parent, and is within the `startIndex` and `count` of the top tree level. When these "roots" are rendered into 
the Grid, they will in turn create additional requests to load "children" of their own. To avoid a lot of initial
requests, it is recommended to include nested children in the initial `root` request.

If the load request gets fewer rows than asked for, it will be interpreted as that parent is fully loaded and the
[isFullyLoaded](#Core/data/Model#field-isFullyLoaded) field will be set to `true`. To be able to return fewer root 
rows than asked for, add a `isFullyLoaded : false` to the response object.

And to avoid additional child requests for parents with all their children included, the same
[isFullyLoaded](#Core/data/Model#field-isFullyLoaded) can be set to `true` on the actual data row object.

Here is what an initial response can look like, with the goal of having only one initial load request:

```json
 {
   "success": true,
   "total": 100000,
   "isFullyLoaded" : false,
   "data": [
      {"id": 1, "parentId": null, "expanded": true, "isFullyLoaded": true, children": [
         {"id": 10, "parentId": 1, "expanded": true, "isFullyLoaded: true, children": [
            {"id": 100, "parentId": 10},
            {"id": 101, "parentId": 10},
            ...16 more
         ]},
         {"id": 11, "parentId": 1, "expanded": true, "isFullyLoaded": true, "children": [
            {"id": 110, "parentId": 11},
            {"id": 111, "parentId": 11},
            ...11 more
         ]}
      ]},
      {"id": 2, "parentId": null, "expanded": true, "isFullyLoaded": true, "children": [
         {"id": 20, "parentId": 2, "expanded": true, "isFullyLoaded": true, "children": [
            {"id": 200, "parentId": 20},
            {"id": 201, "parentId": 20},
            ...21 more
         ]},
         { "id": 21, "parentId": 2, "expanded": true, "children": [
            {"id": 210, "parentId": 21},
            {"id": 211, "parentId": 21},
            ...4 more
         ]}
      ]},
      {"id": 3, "parentId": null, "expanded": false},
      {"id": 5, "parentId": null, "expanded": false},
      {"id": 6, "parentId": null, "expanded": true },
      {"id": 7, "parentId": null, "expanded": true }
   ]
}
```

It is currently not supported to include nested children in the `data` array. The children must be nested inside their
parent's `children` array.


## Not supported

There are a number of Grid features, functions, and configs that are either not supported at all or only work in a 
limited way. Such information is available in the corresponding documentation. Please note that support will 
continuously be added where it makes sense to be added. Please let us know of the functionality that lacks support and 
is most important to you.

LazyLoading is currently not supported in Calendar, Gantt nor TaskBoard.


<p class="last-modified">Last modified on 2026-07-22 10:39:04</p>