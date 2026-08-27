# Lazy data loading (infinite scroll)

Enabling lazy loading on the Scheduler makes it possible to load the different datasets in chunks when they rendered
into view, instead of loading and replacing the datasets completely.

Before continuing reading, please read the Grid's [lazy loading guide](#Grid/guides/data/lazyloading.md) as it covers
the basics of the lazy loading functionality.

There are two main paths to take when implementing lazy load support, either you use the 
[CrudManager](#Scheduler/data/CrudManager), or you do not.

## Not using CrudManager

If you are not using the [CrudManager](#Scheduler/data/CrudManager), you will need to configure each store separately.
Currently, these Scheduler stores supports lazy loading:
* [ResourceStore](#Scheduler/data/ResourceStore)
* [EventStore](#Scheduler/data/EventStore)
* [AssignmentStore](#Scheduler/data/AssignmentStore)
* [TimeRangeStore](#Scheduler/data/TimeRangeStore)
* [ResourceTimeRangeStore](#Scheduler/data/ResourceTimeRangeStore)

### ResourceStore
The [ResourceStore](#Scheduler/data/ResourceStore) is used to populate the "rows" of the Scheduler. Please read the 
Grid's [lazy loading guide](#Grid/guides/data/lazyloading.md) for a detailed explanation of the basics of lazy loading 
which fully applies to the [ResourceStore](#Scheduler/data/ResourceStore).

```javascript
new Scheduler({
    resourceStore : {
        // This will create an AjaxStore
        readUrl: 'backend/resources/read',
        // This will activate the lazy load functionality
        lazyLoad: true,
        // This will load the Store initially upon creation
        autoLoad: true
    }
});
```

### The other stores
Begin by setting the [lazyLoad](#Core/data/Store#config-lazyLoad) config on the Store to `true` to enable this
behaviour.

#### Using an AjaxStore

If your store is an [AjaxStore](#Core/data/AjaxStore) you only need to configure the
[readUrl](#Core/data/AjaxStore#config-readUrl), and then you are done (at least on the frontend).

```javascript
new Scheduler({
    eventStore: {
        // This will create an AjaxStore
        readUrl: 'backend/events/read',
        // This will activate the lazy load functionality
        lazyLoad: true
    }
});
```

#### Using a regular Store

If you are using a regular [Store](#Core/data/Store), then you will need to implement the 
[requestData](#Core/data/Store#config-requestData) function with your own data loading logic. How this function is
called is a little different depending on store type:
* For [EventStore](#Scheduler/data/EventStore) it is called when events for a resource in a certain timespan is 
requested, and has not yet been loaded.
* For [AssignmentStore](#Scheduler/data/AssignmentStore) it is called when the EvenStore's requestData is called. It is
therefore not possible to have the EventStore's lazyLoad `false` and the AssignmentStore's lazyLoad `true`.
* For [TimeRangeStore](#Scheduler/data/TimeRangeStore) it is called when the EvenStore's requestData is called. It is
  therefore not possible to have the EventStore's lazyLoad `false` and the TimeRangeStore's lazyLoad `true`.
* For [ResourceTimeRangeStore](#Scheduler/data/ResourceTimeRangeStore) it is called when resourceTimeRanges for a 
resource in a certain timespan is requested, and has not yet been loaded. 

[requestData](#Core/data/Store#config-requestData) will be called with a single object argument containing
a `startIndex` and a `count` value, and also a `startDate` and an `endDate` value. If the
[ResourceStore](#Scheduler/data/ResourceStore) is configured as a [tree](#Core/data/Store#config-tree), `startIndex`
and `count` will be replaced by a `resourceIds` array. For a detailed explanation of these values, please read the 
'Resource indexes and dates' chapter below.

```javascript
class MyEventStore extends EventStore {
    static configurable = {
        lazyLoad: true
    };

    async requestData({
        startIndex,
        count,
        startDate,
        endDate
    }) {
        const response = await fetchData({
            startIndex,
            count,
            startDate,
            endDate
        });

        // The requestData function is expected to return an object
        // with a data property, which value contains all the records
        return {
            data: response.data
        }
    }
}

new Scheduler({
    eventStore: new MyEventStore()
});
```

### ResourceStore as tree
If the [ResourceStore](#Scheduler/data/ResourceStore) is configured with
[tree](#Scheduler/data/ResourceStore#config-tree) set to `true` there are some very important differences to know about:

1. For the lazy load functionality to recognize that a store is expecting tree data, the
   [tree](#Scheduler/data/ResourceStore#config-tree) config must be set to `true`. The
   [autoTree](#Scheduler/data/ResourceStore#config-autoTree) config is not supported.
2. The [isFullyLoaded](#Core/data/Model#field-isFullyLoaded) field can be set from the backend, indicating that a 
   [TreeNode](#Core/data/mixin/TreeNode) should not initiate any more load requests. If omitted, it will be set to 
   `true` automatically when a load request returns a smaller number of children than asked for.


When using a Tree store, a load request will be made in the following scenarios:
1. The initial load request, either by [autoLoad](#Scheduler/data/ResourceStore#config-autoLoad) or a separate
   [load](#Scheduler/data/ResourceStore#function-load) call.
2. When a [TreeNode](#Core/data/mixin/TreeNode) is rendered and:
    * it has [expanded](#Core/data/Model#field-expanded) set to `true` and 
      [isFullyLoaded](#Core/data/Model#field-isFullyLoaded) set to `false`
    * is the last child of a parent which has [isFullyLoaded](#Core/data/Model#field-isFullyLoaded) set to `false`
3. A TreeNode with [expanded](#Core/data/Model#field-expanded) set to `false` is manually or programmatically expanded

It is allowed, and in most cases recommended, to include nested data in the server responses. Please read more in the
upcoming chapters.

#### Resource indexes and dates

For resources, the lazy loading depends on indexes to know what has been loaded and what has not. When it comes to 
events, resourceTimeRanges or assignments it is a bit more complicated. When a [EventStore](#Scheduler/data/EventStore),
for example, gets a request for events for a specified resource and a specified timespan, a load request will be made 
containing four parameters:
* `startIndex` - The resource start index
* `count` - The resource count
* `startDate` - The start date of the calculated timespan
* `endDate` - The end date of the calculated time span

If the [ResourceStore](#Scheduler/data/ResourceStore) is configured as a [tree](#Core/data/Store#config-tree), or, the
other store (i.e. the EventStore) is configured with 
[useResourceIds](#Scheduler/data/EventStore#config-lazyLoad) the load request will contain
these tree parameters instead:
* `resourceIds` - An array of ids for every resource in the resource range
* `startDate` - The start date of the calculated timespan
* `endDate` - The end date of the calculated time span

If the [ResourceStore](#Scheduler/data/ResourceStore) has remote `filters` or `sorters` those will be applied to the 
other stores requests as well. It will use the [filterParamName](#Core/data/AjaxStore#config-filterParamName) or
[sortParamName](#Core/data/AjaxStore#config-sortParamName) configured on the 
[ResourceStore](#Scheduler/data/ResourceStore) as parameter name, but if they are identical to those configured on the 
*other* store, the names will be prepended with the text "resource". For example, if
[sortParamName](#Core/data/AjaxStore#config-sortParamName) is identical on both the
[ResourceStore](#Scheduler/data/ResourceStore) and the [EventStore](#Scheduler/data/EventStore), a
[sortParamName](#Core/data/AjaxStore#config-sortParamName) of `sort` will be changed to `resourceSort`, .

The dates will be calculated using the current visible (rendered) timespan as a base. The duration specified in the 
Store's [lazyLoad](#Scheduler/data/EventStore#config-lazyLoad) config's properties `bufferUnit` and `bufferAmount` will
be subtracted from the visible start date and added to the visible end date. These values default to the full visible
timespan length. If you are using a [non-continuous timeaxis](#Scheduler/data/TimeAxis#config-continuous), you may have
to adjust these values manually.

This "two-dimensional" request range will then be remembered, so when a new request is made, the 
[EventStore](#Scheduler/data/EventStore) knows that it has or has not already loaded events for that range, and can act 
accordingly.

#### Sorting and filtering

Local sorting and filtering is not supported when the store is lazy loaded. Remote sorting and filtering, however, is
supported. If you use an AjaxStore configured with remote sorting or filtering (which is done by setting
[filterParamName](#Core/data/AjaxStore#config-filterParamName) or
[sortParamName](#Core/data/AjaxStore#config-sortParamName)), the sorter and/or filter information will be available in
the fetch request parameters.

If you do not use an AjaxStore, you should configure the Store with [remoteSort](#Core/data/Store#config-remoteSort)
or [remoteFilter](#Core/data/Store#config-remoteFilter). This will add a `sorters` and/or a `filters` param to the
[requestData](#Core/data/Store#config-requestData) call.

A `filter` or a `sort` action on the Store will clear all loaded records and a new load request will be made. This is
because a `sort` or a `filter` action will change the record's indexes, which makes the loaded dataset invalid.

## Backend

For each lazy load request you need to fetch records corresponding to the specified parameters:
1. The record should have a `resourceId` in the resource range (`startIndex` and `count`, or included in `resourceIds`).
   Ignore for timeRanges.
2. The record should either have a `startDate` or an `endDate` in the date range (`startDate` and `endDate`).

<div class="note">
The `endDate` is interpreted as "exclusive", meaning that the comparing date must be less or greater, but not
equal.
</div>

If you are using AjaxStore, the response(s) need to look like this:

```javascript
// Return the expected JSON response
res.json({
    success: true,
    data: events // Or timeRanges, or assignments etc...
});
```

## Using CrudManager

When you are using the [CrudManager](#Scheduler/data/CrudManager), things are a bit simpler. Set the 
[lazyLoad](#Scheduler/data/CrudManager#config-lazyLoad) to `true` and see to it that you have a 
[loadUrl](#Scheduler/data/CrudManager#config-loadUrl) configured. Also, you will either have to set 
[autoLoad](#Scheduler/data/CrudManager#config-autoLoad) to `true` or call the 
[load](#Scheduler/data/CrudManager#function-load) function manually.

```javascript
new Scheduler({
    crudManager: {
        loadUrl: 'backend/events/read',
        // This will activate the lazy load functionality
        lazyLoad: true,
        // This will initiate the first load upon creation
        autoLoad: true,
    }
});
```

The [CrudManager](#Scheduler/data/CrudManager) will initiate a load request either when the 
[ResourceStore](#Scheduler/data/ResourceStore) requests more records or when the 
[EventStore](#Scheduler/data/EventStore) requests more records. Then it will perform a load request to the specified
[loadUrl](#Scheduler/data/CrudManager#config-loadUrl) and add the data from the response to the affected Stores.

Data for the Stores that currently has no lazy load support, can either be supplied in the first load request, or set
manually.

Please read the chapter about [Resource indexes and dates](####resource-indexes-and-dates) as it applies when using the
[CrudManager](#Scheduler/data/CrudManager) as well.

### Backend

When implementing a backend that serves the [CrudManager](#Scheduler/data/CrudManager), you first need to read the 
[CrudManager guide](#Scheduler/guides/data/crud_manager.md). Here is a simple example of a (pseudo) JavaScript read
endpoint.

```javascript
const { 
    startIndex,
    count,
    startDate,
    endDate,
    requestId
    }           = JSON.parse(params), // Params from the client
    // Extracting the resources that's requested
    resources   = ALL_RESOURCES.slice(startIndex, startIndex + count),
    resourceIds = resources.map(resource => resource.id),
    // Extracting the events that's requested
    events      = ALL_EVENTS.filter(event => resourceIds.includes(event.resourceId) 
            && ((event.startDate >= startDate && event.startDate < endDate) 
            || (event.endDate > startDate && event.endDate <= endDate)));

return {
    responseText : JSON.stringify({
        success      : true,
        requestId,
        events       : loadEvents(startIndex, count, new Date(startDate), new Date(endDate)),
        resources    : loadResources(startIndex, count),
        assignments  : singleAssignments ? undefined : loadAssignments(startIndex, count, new Date(startDate), new Date(endDate)),
        dependencies : { rows : [{ id : 1, from : 1, to : 2 }] }
    })
};
```

The params which are sent to the backend also contains an array of `id`s of the Stores that is requested. On
the first load, all stores managed by the [CrudManager](#Scheduler/data/CrudManager) will be included in the array.
After that, only the lazy load supported stores will be included. If the timespan of the Scheduler changes, a request 
will be initiated from the [EventStore](#Scheduler/data/EventStore), and in those requests the `stores` param will
exclude the [ResourceStore](#Scheduler/data/ResourceStore) as well. You need **not** provide data for stores that is not
present in the `stores` param.

## Not supported

There is a number of Scheduler features, functions and configs that is either not supported at all or only works in a 
limited way. Such information is available in the corresponding documentation. Please note that support will 
continuously be added where it makes sense to be added. Please let us know of the functionality that lacks support and 
is most important to you.

LazyLoading is currently not supported in Calendar, Gantt nor TaskBoard.


<p class="last-modified">Last modified on 2026-07-22 10:39:14</p>