# Understanding structure

Understanding the structure of the request and response bodies is vital to working smoothly with data.
The structure of requests and responses varies depending on the type of request, the changes made,
and how the request is made.

Bryntum Grid doesn't use any additional stores. We only use `AjaxStore`, which makes things straightforward.

## AjaxStore request and response structure

The data in an `AjaxStore` is structured based on the request type or operation.

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

To read more, visit [the guide to using `AjaxStore`](#Grid/guides/data/ajaxstore.md).



<p class="last-modified">Last modified on 2026-07-22 10:46:48</p>