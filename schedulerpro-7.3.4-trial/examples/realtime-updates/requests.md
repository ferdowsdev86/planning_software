# Login

Login is mainly meant to tell other users who joined the project, only for demo purposes.
So strict validation and checking registration is not required. Every user is allowed. One
should only provide name.

### Request
```json
{
  "command" : "login",
  "data"    : {
    "user"     : "Alex",
    "password" : "optional"
  }
}
```

### Response

Successful response. Client unique ID is returned only to the sender. Other clients may receive same message
but without client id.
```json
{
  "command" : "login",
  "data"    : {
    "user" : "Alex",
    "id"   : "client-1"
  }
}
```

Failure response. This should only be sent to the sender
```json
{
  "command" : "login",
  "error"   : "smth wrong"
}
```

# Projects API

Picking project was a good addition to the demo. Server should have few projects available
for editing.

## List projects

Returns list of projects this user can work with. Every project, I suppose
### Request
```json
{
  "command" : "list_projects"
}
```

### Response
Maybe wrap data array to an object? Your choice.

```json
{
  "command" : "list_projects",
  "data"    : [
    {
      "id"   : 1,
      "name" : "Project 1"
    }
  ]
}
```

## Pick project

When user picks a project he is subscribed to that project updates. User includes project
id to every request for server to know context.

### Request
```json
{
  "command" : "dataset",
  "data"    : { "project" : 1 }
}
```

### Response

Response should contain project data and revision id which matches this project state. Client
will use this revision to set as his base.

```json
{
  "command" : "dataset",
  "data"    : {
    "revision"     : "server-12",
    "project_data" : {
      "tasks"     : [],
      "resources" : [] 
    }
  }
}
```

# Changes API

Changes request and response may contain several revisions. It all depends on the app
state and logic on changes batching. Usually we will be sending a single change, but it
should be possible to send few at once.

### Outgoing message format
```json
{
  "command" : "project_changes",
  "data"    : {
    "project"   : 1,
    "revisions" : [
      {
        "revision" : "local-1",
        "changes"  : {
          "tasks" : {
            "added" : [
              { "$PhantomId" : "_phantom1" }
            ]
          }
        } 
      }
    ]
  }
}
```

### Response message format

Every client will receive same message from the server, like they all subscribe to the same stream.
Clients will see incoming revisions and decide what to do with them. This is a minimal required set of fields:

- revision - real id of this revision like it is defined by the server.
- localRevision - id of the revision sent by client. ignored unless client id is a match.
- client - id of the client. client updates own revisions.
- changes - actual set of changes in this revision.

```json
{
  "command" : "project_changes",
  "data"    : {
    "project" : 1,
    "revisions" : [
      {
        "revision"      : "server-1",
        "localRevision" : "local-1",
        "client"        : "client-1",
        "changes"       : {
          "tasks" : {
            "added" : [
              { "$PhantomId" : "_phantom1", "id" : 1 }
            ]
          }
        }
      },
      {
        "revision"      : "server-2",
        "localRevision" : "local-1",
        "client"        : "client-2",
        "changes"       : {
          "tasks" : {
            "added" : [
              { "$PhantomId" : "_phantom1", "id" : 2 }
            ]
          }
        }
      }
    ]
  }
}
```


## Request update

If client was disconnected and worked offline for some time, client should request list of revisions since his
last confirmed. E.g. if his last server revision was `server-2` and current is `server-4`, client should load them
first. He should not send those changes first, because changes may contain conflicts. Client should resolve them first.

### Request

```json
{
  "command" : "update",
  "data"    : {
    "fromRevision" : "server-2"
  }
}
```

### Response

In response, we can just send messages which client skipped.

```json
{
  "command": "project_changes",
  "data": {
    "revisions": [
      {
        "revision": "server-3",
        "changes": {}
      },
      {
        "revision": "server-4",
        "changes": {}
      }
    ]
  }
}
```
