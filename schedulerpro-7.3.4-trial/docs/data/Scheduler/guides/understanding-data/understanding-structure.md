# Understanding structure

Understanding the structure of the request and response bodies is vital to working smoothly with data.
The structure of requests and responses varies depending on the type of request, the changes made,
and how the request is made.

## Crud Manager structure

The `crudManager` data is structured as follows:

### Load response

All `loadUrl` responses are sent in a JSON format. The example below demonstrates how a `loadUrl` response is structured:

```javascript
{
    "success" : true,

    "events" : {
        "rows" : [
            {
                "id"   : 11,
                "name" : "Meeting with CEO",
            },
        ]
    },

    "resources" : {
        "rows" : [
            {
                "id"   : 1,
                "name" : "Mats"
            },
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
}
```

This structure includes all the Bryntum component's stores.
For each store, the data objects are contained in a `rows` array:

```javascript
{
  "success" : true,

  "resources": {
    "rows": [ {}, {}, {} ]
  },
  "assignments": {
    "rows": [ {}, {}, {} ]
  },
  "dependencies": {
    "rows": [ {}, {}, {} ]
  },

}
```

### Sync request

The `syncUrl` is a single endpoint that is used for multiple request types.
Because the same endpoint is used for create, update, and delete operations,
the operation type is defined in the request body.

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

In the example request above, the following changes were made:

- An event with the ID `9001` was removed.
- An event with the ID `50` was updated (`startDate`).
- A new event with the name `New event` was added.
- A new resource with the name `Steven Grant` was added.

The request sends changes under `added`, `updated`, and `removed`.
These changes can then be handled on the backend using checks.

### Sync response

The sync request looks simple. If no additional changes are made on the server, a short response
is sent:

```json
{
    "success"   : true,
    "requestId" : 124,
    "revision"  : 6
}
```

If new information is added on the server, such as a server-generated `id`, 
Bryntum components expect the additional data to be returned in the response.

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
}
```

Each store has two possible sections: `rows` and `removed`.

You can read more about the sync response structure in the
[Crud Manager guide](#Scheduler/guides/data/crud_manager.md#sync-response-structure).

## AjaxStore request and response structure

The data in all the stores (such as `ResourceStore`) are structured the same way.

### Read records

When using `readUrl`, the response structure is expected in one of the following formats.

The response can be an array of data:

```json
[
    { "id" : 1, "name" : "Han" },
    { "id" : 2, "name" : "Luke" }
]
```

Alternatively, the response can be an object with the following format:

```json
{
    "success" : true,
    "data"    : [
        { "id" : 1, "name" : "Leia" },
        { "id" : 2, "name" : "Lando" }
    ]
}
```

### Create records

When a `createUrl` endpoint is hit, the request and response are structured as follows:

<div class="docs-tabs" data-name="Communication">
<div>
    <a>Request</a>
    <a>Response</a>
</div>
<div>

The request structure looks like this:

```json
{
  "data": [
    {
      "id": "_generatedModelClass_6f71edf1-9755-42b9-ab7f-a035f385fdca",
      "name": "Han"
    },
    {
      "id": "_generatedModelClass_0c7840d3-995f-4b6f-a664-d3ab05352395",
      "name": "Leia"
    }
  ]
}
```

</div>
<div>

The response structure looks like this: 

```json
{
  "data": [
    {
      "id": 1,
      "name": "Han"
    },
    {
      "id": 2,
      "name": "Leia"
    }
  ]
}
```

The server is expected to respond with the same records as the request and to include any
new fields created on the server (such as the server-generated <code>id</code>).
</div>
</div>

### Update records

Records are updated in the same way that they are created (using `createUrl`),
but a `POST` request is made to `updateUrl`:

<div class="docs-tabs" data-name="Communication">
<div>
    <a>Request</a>
    <a>Response</a>
</div>
<div>

The request structure is as follows:

```json
{
  "data": [
    { "name": "Kylo", "id": 1 },
    { "name": "Rey", "id": 2 }
  ]
}
```

</div>
<div>

The response structure is as follows:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Kylo"
    },
    {
      "id": 2,
      "name": "Rey"
    }
  ]
}
```
</div>
</div>

### Remove records

Records are removed using the simplest structure: A `POST` call is made to `deleteUrl`.

<div class="docs-tabs" data-name="Communication">
<div>
    <a>Request</a>
    <a>Response</a>
</div>
<div>

The request includes only the <strong>IDs</strong> of the deleted records:

```json
{ "ids": [1, 2] }
```

</div>
<div>

The response includes a <code>success</code> property:

```json
{
    "success" : true
}
```
</div>
</div>



<p class="last-modified">Last modified on 2026-07-22 10:51:35</p>