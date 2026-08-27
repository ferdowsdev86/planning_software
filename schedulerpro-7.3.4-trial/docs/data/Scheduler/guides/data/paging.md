# Remote paging

Enabling remote paging on the Scheduler makes it possible to split the dataset into pages and load them one at a 
time. The main difference between a paged Scheduler and one using [lazy loading](#Scheduler/guides/data/lazyloading.md),
is that the dataset is replaced, rather than continuously aggregated. And also, there is some kind of paging controller
available in the UI.

There are two main paths to take when implementing paging in the Scheduler, either you use the 
[CrudManager](#Scheduler/data/CrudManager), or you do not.

## Not using CrudManager

If you are not using the [CrudManager](#Scheduler/data/CrudManager), you will need to configure each store separately.
Currently, these Scheduler stores supports paging:
* [ResourceStore](#Scheduler/data/ResourceStore)
* [EventStore](#Scheduler/data/EventStore)
* [AssignmentStore](#Scheduler/data/AssignmentStore)
* [TimeRangeStore](#Scheduler/data/TimeRangeStore)
* [ResourceTimeRangeStore](#Scheduler/data/ResourceTimeRangeStore)

### ResourceStore
The [ResourceStore](#Scheduler/data/ResourceStore) is used to populate the "rows" of the Scheduler. This Store is the 
basis for the other Store's pages as well. If the ResourceStore's current page changes, the other Stores will change 
page as well.

```javascript
new Scheduler({
    resourceStore: {
        // This will create an AjaxStore
        readUrl: 'backend/resources/read',
        // This will activate the paging functionality
        remotePaging: true,
        // This will load the Store initially upon creation
        autoLoad: true
    }
});
```

### The other stores
Begin by setting the [remotePaging](#Core/data/Store#config-remotePaging) config on the Store to `true` to enable this
behaviour.

#### Using an AjaxStore

If your store is an [AjaxStore](#Core/data/AjaxStore) you only need to configure the
[readUrl](#Core/data/AjaxStore#config-readUrl), and then you are done (at least on the frontend).

```javascript
new Scheduler({
    eventStore: {
        // This will create an AjaxStore
        readUrl: 'backend/events/read',
        // This will activate the paging functionality
        remotePaging: true
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
therefore not possible to have the EventStore's remotePaging `false` and the AssignmentStore's remotePaging `true`.
* For [TimeRangeStore](#Scheduler/data/TimeRangeStore) it is called when the timespan of the Scheduler changes, and the
new timespan has not yet been loaded.
* For [ResourceTimeRangeStore](#Scheduler/data/ResourceTimeRangeStore) it is called when resourceTimeRanges for a 
resource in a certain timespan is requested, and has not yet been loaded. 

[requestData](#Core/data/Store#config-requestData) will be called with a single object argument containing
a `page` and a `pageSize` value, and also a `startDate` and an `endDate` value. For a detailed explanation of these 
values, please read the 'Resource pages and dates' chapter below.

```javascript
class MyEventStore extends EventStore {
    static configurable = {
        remotePaging: true
    };

    async requestData({ page, pageSize, startDate, endDate }) {
        const response = await fetchData({
            page,
            pageSize,
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

#### Resource pages and dates

For resources, only a single page of data is loaded at any given time. When it comes to events, resourceTimeRanges or 
assignments it is a bit more complicated. When a [EventStore](#Scheduler/data/EventStore), for example, gets a request 
for events for a specified resource and a specified timespan, a load request will be made containing four parameters:
* `page` - The resource page
* `pageSize` - The resource page size
* `startDate` - The start date of the timespan
* `endDate` - The end date of the timespan

If the [ResourceStore](#Scheduler/data/ResourceStore) has remote `filters` or `sorters` those will be applied to the 
other stores requests as well. It will use the [filterParamName](#Core/data/AjaxStore#config-filterParamName) or
[sortParamName](#Core/data/AjaxStore#config-sortParamName) configured on the 
[ResourceStore](#Scheduler/data/ResourceStore) as parameter name, but if they are identical to those configured on the 
*other* store, the names will be prepended with the text "resource". For example, if
[sortParamName](#Core/data/AjaxStore#config-sortParamName) is identical on both the
[ResourceStore](#Scheduler/data/ResourceStore) and the [EventStore](#Scheduler/data/EventStore), a
[sortParamName](#Core/data/AjaxStore#config-sortParamName) of `sort` will be changed to `resourceSort`, .

This "two-dimensional" request range will then be remembered, so when a new request is made, the 
[EventStore](#Scheduler/data/EventStore) knows that it has or has not already loaded events for that range, and can act 
accordingly. When the [ResourceStore](#Scheduler/data/ResourceStore), however, requests a new page, the "other Stores"
will also have their data cleared and reloaded.

## Backend

For each data request you need to fetch records corresponding to the specified parameters:
1. The record should have a `resourceId` in the resource range (`page` and `pageSize`). Ignore for timeRanges.
2. The record should either have a `startDate` or an `endDate` in the date range (`startDate` and `endDate`).

<div class="note">
The `endDate` is interpreted as "exclusive", meaning that the comparing date must be less or greater, 
but not equal.
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
[lazyLoad](#Scheduler/data/CrudManager#config-remotePaging) to `true` and see to it that you have a 
[loadUrl](#Scheduler/data/CrudManager#config-loadUrl) configured. Also, you will either have to set 
[autoLoad](#Scheduler/data/CrudManager#config-autoLoad) to `true` or call the 
[load](#Scheduler/data/CrudManager#function-load) function manually.

```javascript
new Scheduler({
    crudManager: {
        loadUrl: 'backend/events/read',
        // This will activate the remote paging functionality
        remotePaging: true,
        // This will initiate the first load upon creation
        autoLoad: true,
    }
});
```

The [CrudManager](#Scheduler/data/CrudManager) will initiate a load request either when a new page is requested, or when
[EventStore](#Scheduler/data/EventStore) requests more records. Then it will perform a load request to the specified
[loadUrl](#Scheduler/data/CrudManager#config-loadUrl) and add or replace the data from the response to the affected 
Stores.

Data for the Stores that currently has no paging support, can either be supplied in the first load request, or set
manually.

Please read the chapter about [Resource paging and dates](####resource-paging-and-dates) as it applies when using the
[CrudManager](#Scheduler/data/CrudManager) as well.

### Backend

When implementing a backend that serves the [CrudManager](#Scheduler/data/CrudManager), you first need to read the 
[CrudManager guide](#Scheduler/guides/data/crud_manager.md). Here is a simple example of a (pseudo) JavaScript read
endpoint.

```javascript
const { 
    page,
    pageSize,
    startDate,
    endDate,
    requestId
    }           = JSON.parse(params), // Params from the client
    startIndex  = (page - 1) * pageSize,
    // Extracting the resources that's requested
    resources   = ALL_RESOURCES.slice(startIndex, startIndex + pageSize),
    resourceIds = resources.map(resource => resource.id),
    // Extracting the events that's requested
    events      = ALL_EVENTS.filter(event => resourceIds.includes(event.resourceId) 
            && ((event.startDate >= startDate && event.startDate < endDate) 
            || (event.endDate > startDate && event.endDate <= endDate)));

return {
    responseText : JSON.stringify({
        success      : true,
        requestId,
        events       : loadEvents(startIndex, pageSize, new Date(startDate), new Date(endDate)),
        resources    : loadResources(startIndex, pageSize),
        assignments  : singleAssignments ? undefined : loadAssignments(startIndex, pageSize, new Date(startDate), new Date(endDate)),
        dependencies : { rows : [{ id : 1, from : 1, to : 2 }] }
    })
};
```

The params which are sent to the backend also contains an array of `id`s of the Stores that is requested. On
the first load, all stores managed by the [CrudManager](#Scheduler/data/CrudManager) will be included in the array.
After that, only the supported stores will be included. If the timespan of the Scheduler changes, a request will be
initiated from the [EventStore](#Scheduler/data/EventStore), and in those requests the `stores` param will exclude the
[ResourceStore](#Scheduler/data/ResourceStore) as well. You need **not** provide data for stores that is not present in
the `stores` param.

## User interface

The Bryntum package contains a [PagingToolbar](#Core/widget/PagingToolbar) which can be added to the Scheduler. 

```javascript
new Scheduler({
    resourceStore: {
        readUrl: 'backend/resources/read',
        remotePaging: true,
    },
        eventStore: {
        readUrl: 'backend/events/read',
        remotePaging: true
    },
    // Adds a paging toolbar which controls the resourceStore's paging
    bbar: {
        type: 'pagingtoolbar',
        store: 'resourceStore'
    }
});
```


<p class="last-modified">Last modified on 2026-07-22 10:39:14</p>