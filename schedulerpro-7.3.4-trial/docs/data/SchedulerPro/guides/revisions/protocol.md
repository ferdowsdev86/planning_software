# Revisions Feature Protocol Implementation

In this guide, we will describe the protocol used by the revisions feature messages. This protocol is implemented in
our public demo server and can be used as a reference for your own implementation. You can find implementation in this
repository: [Gantt WebSocket server](https://github.com/bryntum/gantt-websocket-server/). Please keep in
mind this server is for the demo purposes only, it is not intended for production use. It acts like a message broker
with some additional logic.

## Overview

The project model has two APIs to work with revisions: the
[revisionNotification](#SchedulerPro/model/ProjectModel#event-revisionNotification) event and the
[applyRevisions](#SchedulerPro/model/ProjectModel#function-applyRevisions) method.
These are channels for outgoing and incoming revisions. The project is not responsible for delivering messages over the
network. Implementation is entirely up to the developer, providing as much flexibility as possible.

Implementation requires two parts: server and frontend.

### Server Responsibilities:

1. Handle connections from clients, authorization, authentication, etc.
2. Receive revision messages from clients.
3. Store records, generate IDs for them, keep track of phantom IDs and real IDs. Read more about
[phantom id here](#SchedulerPro/guides/data/crud_manager_project.md#sync-request-structure).
4. Create a sequence of revisions, assign IDs to them.
5. Deliver revisions to clients in the same order.
6. Ensure every client in the network receives the same and complete sequence of revisions.

### Frontend Responsibilities:

1. Connect to the server, keep the connection alive, handle authorization, authentication, etc.
2. Receive revisions from the server and apply them to the project using the
[applyRevisions](#SchedulerPro/model/ProjectModel#function-applyRevisions) API.
3. Read revisions from the project using the
[revisionNotification](#SchedulerPro/model/ProjectModel#event-revisionNotification) event and send them to the server.

## Revision Structure

Incoming and outgoing revisions can be described by the following types:

```typescript
type RevisionId = string | number;

type StoreInputChange = {
    added?   : Record<string, any>[],
    updated? : Record<string, any>[],
    removed? : { id : any }[]
};

type ChangesInfo = {
    [key: string] : {
        $input? : StoreInputChange
    } & StoreInputChange;
};

type OutgoingRevision = {
    // Id of the client which made the changes
    clientId : any,

    // Unique id of the local revision
    localRevisionId : RevisionId,

    // Id of the revision which this revision resolves conflicts for
    conflictResolutionFor? : RevisionId,

    // Object with changes made by the client
    changes : ChangesInfo
}

type IncomingRevision = OutgoingRevision & {
    revisionId : RevisionId
}
```

## Mocked Frontend Implementation

Frontend implementation should be responsible for passing messages from the project to the server and vice versa.

Minimal implementation of the frontend part can be described by the following pseudocode:

```javascript
class WebsocketClientMock {
    async init(project) {
        this.project = project;

        this.clientId = await this.connect();

        this.project.on({
            revisionNotification : revision => {
                this.sendMessage(revision);
            }
        });
    }

    // This method accepts connection parameters and returns client id issued by the server
    connect(connectionInfo) {}

    // This is a project event handler
    sendMessage(revision) {}

    // This is a handler for incoming messages from the server
    receiveMessage(revisions) {
        this.project.applyRevisions(revisions);
    }
}

const websocketClient = new WebsocketClientMock();

websocketClient.init(project);
```

## Server Implementation

Server is responsible for handling connections from clients, receiving revision messages, storing data, generating IDs,
and distributing revision messages to clients.

### Ordering Revisions

**Clients should apply revisions in the same order**.

Server should organize incoming messages in a way which would allow sending revisions to clients in the same order. It
is crucial that every client has the same sequence of revisions because revision is not a snapshot of data. It is a
delta of changes from the previous revision. Revisions applied in a different order will produce different state of the
project.

### Generating Revision IDs

**Server should assign unique ID to every revision**.

Revision ID is required to track individual revisions, navigate them, and resolve conflicts correctly. Revision ID can
be any serializable value, like a number or string. It can be a sequence number or UUID string. Client does not use ID
to sort revisions. Client uses revision ID to checkout to specific state to apply next revision.

When client generates a revision it assigns a revision with a local unique ID. The client provides this ID along with
its own client ID. Server should generate its own ID for the revision, add it to the revision message, and send it to
every client.
```
// incoming message format
{ clientId : 'client-1', localRevisionId : 1, changes : { ... } }

// outgoing message format
{ clientId : 'client-1', localRevisionId : 1, revisionId : 1, changes : { ... } }
```

### Distributing Revisions

**Every client should receive every revision processed by the server**.

Server should broadcast every revision to every client after processing it, even to the client who sent the revision.
This is required to allow clients to assign correct IDs for new records they've created and assign the correct revision
ID to the local revision. Clients will use `localRevisionId` and `clientId` fields to track their own revisions from the
stream of incoming revisions.

### Matching Revision ID with the State of the Data

**When client connects and receives dataset corresponding to certain revision, it should receive all revisions that were
created after that one**.

Server is responsible for broadcasting messages to clients, but serving a complete dataset is optional. Depending on the
architecture, the server may or may not provide clients with initial project data. **There is only one requirement for
the new client**: when it receives the first revision it must have project in the state as if all previous revisions
are applied.

There are many possible solutions, to name a few:

- Server can persist the data along with last revision id. That way server can provide latest state of the project and
figure out which revisions to send to the client later.
- Server can have some base initial state and then combine all current revisions into one big revision for client to
apply. In this case server should also make sure changes object is valid (no duplicates, every record may only appear
once in the store changes object) and merged revisions do not have conflicts.

### Persisting the Data

**Server should generate IDs for new records and keep track of phantom IDs**.

Revision changes object contains changes for individual stores. Every store changes object can have the following keys:
`added`, `updated`, `removed`, and `$input`. When persisting changes, the server should only work with `added`,
`updated`, and `removed` keys. `$input` is a special key which contains modifications to the project data made by the
user. Other clients' project models will apply this input value and will produce the same change set.

**Note**: Client can send multiple revisions with the same record added multiple times. This is expected, because if
client made changes to the new record before applying revision with the real id generated for the new record, it will
consider record as new still. This is why it is important to keep track of phantom ids.

When saving new records server should look up `$PhantomId` in the storage (database). If the record is new:
1. Generate new id for the record.
2. Save `$PhantomId` of the record to be able to resolve real ID later. More information below.
3. Save all required fields.
4. Put `id` to the corresponding record in the `added` array.

If record is already saved:
1. Update all fields in the record.
2. Put `id` to the corresponding record in the `added` array.

Example:
```
// client sends two revisions with the same record
[
    {
        localRevisionId: 'local-1',
        clientId: 'client-1',
        changes: {
            tasks: {
                added: [
                    { $PhantomId: 'phantom-1', name: 'Task 1' }
                ]
            }
        }
    },
    {
        localRevisionId: 'local-2',
        clientId: 'client-1',
        changes: {
            tasks: {
                added: [
                    { $PhantomId: 'phantom-1', name: 'Task 1 (updated)' }
                ]
            }
        }
    }
]

// Server should broadcast these two revsions in response
[
    {
        revisionId: 'server-1',
        localRevisionId: 'local-1',
        clientId: 'client-1',
        changes: {
            tasks: {
                added: [
                    { $PhantomId: 'phantom-1', id : 1, name: 'Task 1' }
                ]
            }
        }
    },
    {
        revisionId: 'server-2',
        localRevisionId: 'local-2',
        clientId: 'client-1',
        changes: {
            tasks: {
                added: [
                    { $PhantomId: 'phantom-1', id : 1, name: 'Task 1 (updated)' }
                ]
            }
        }
    }
]
```

Both revisions contain `$PhantomId` and `id`. This is expected, clients will ignore the phantom id if
they don't have such record in the store. And client who added this record will use the phantom id to assign real id
to the existing record.

### Preparing Server Revision

**Server should process the revision before broadcasting it**.

The process of preparing the revisions consists of three steps: assigning a revision ID, persisting records, creating
real IDs, and updating changes object with real IDs.

We covered first two steps in the previous sections. Last step is to process the changes object and replace references
to phantom id everywhere: in the optional `$input` object and in the record fields.

When `$input` exists, it will always contain a subset of the project changes. For example:
```
{
    tasks : {
        $input : {
            added : [
                { $PhantomId : 'phantom-1', name : 'Task 1', orderedParentIndex : 0 }
            ]
        },
        added : [
            { $PhantomId : 'phantom-1', name : 'Task 1', orderedParentIndex : 0 }
        ],
        updated : [
            { id : 1, orderedParentIndex : 1 },
            { id : 2, orderedParentIndex : 2 }
        ]
    },
    dependencies : {
        $input : {
            updated: [{ id : 1, toTask : 'phantom-1' }]
        },
        updated: [{ id : 1, toTask : 'phantom-1' }]
    }
}
```

In this example we have added one task and updated one dependency to use the new task as target. You can see that
phantom id is referenced both in changes and in the input object. And in case of dependency it is also references in a
field value.

To correctly process this change object server should generate id for the new task and then replace every usage of the
phantom id (except for `$PhantomId` field) to use the real id. Correct response object should look like this:
```
{
    tasks : {
        $input : {
            added : [
                // id field added
                { $PhantomId : 'phantom-1', id : 3, name : 'Task 1', orderedParentIndex : 0 }
            ]
        },
        added : [
            // id field added
            { $PhantomId : 'phantom-1', id : 3, name : 'Task 1', orderedParentIndex : 0 }
        ],
        updated : [
            { id : 1, orderedParentIndex : 1 },
            { id : 2, orderedParentIndex : 2 }
        ]
    },
    dependencies : {
        $input : {
            // toTask field updated to use real id
            updated: [{ id : 1, toTask : 3 }]
        },
        // toTask field updated to use real id
        updated: [{ id : 1, toTask : 3 }]
    }
}
```

### Possible Message Storm

It is possible that different projects will produce revisions which constantly overwrite each other. This is an uncommon
situation, but it is possible. In this case, it would be beneficial for the server to disconnect one of the clients and
investigate the problem. Please report such cases to the Bryntum support and attach a log of messages.

Such situation was observed during testing, and it was caused by conflicting timezone information which forced
projects in different time zones to constantly recalculate same tasks to start according to the local timezone and local
non-working time.

### Complete Structure of the Client Revisions and Correct Server Revisions

Complete client revision:

```json
[
    {
        "clientId": "client-1",
        "localRevisionId": "local-1",
        "changes": {
            "tasks": {
                "$input": {
                    "added": [
                        { "$PhantomId": "phantom-1", "name": "Task 1", "orderedParentIndex": 0

 }
                    ]
                },
                "added": [
                    { "$PhantomId": "phantom-1", "name": "Task 1", "orderedParentIndex": 0 }
                ],
                "updated": [
                    { "id": 1, "orderedParentIndex": 1 },
                    { "id": 2, "orderedParentIndex": 2 }
                ]
            },
            "dependencies": {
                "updated": [{ "id": 1, "toTask": "phantom-1" }]
            }
        }
    },
    {
        "clientId": "client-1",
        "localRevisionId": "local-2",
        "changes": {
            "tasks": {
                "$input": {
                    "added": [
                        { "$PhantomId": "phantom-1", "name": "Task 1 (updated)" }
                    ]
                },
                "added": [
                    { "$PhantomId": "phantom-1", "name": "Task 1 (updated)" }
                ]
            },
            "dependencies": {
                "updated": [{ "id": 1, "active": false }]
            }
        }
    }
]
```

Complete server revision:

```json
[
    {
        "clientId": "client-1",
        "revisionId": "server-1",
        "localRevisionId": "local-1",
        "changes": {
            "tasks": {
                "$input": {
                    "added": [
                        { "$PhantomId": "phantom-1", "id": 3, "name": "Task 1", "orderedParentIndex": 0 }
                    ]
                },
                "added": [
                    { "$PhantomId": "phantom-1", "id": 3, "name": "Task 1", "orderedParentIndex": 0 }
                ],
                "updated": [
                    { "id": 1, "orderedParentIndex": 1 },
                    { "id": 2, "orderedParentIndex": 2 }
                ]
            },
            "dependencies": {
                "updated": [{ "id": 1, "toTask": 3 }]
            }
        }
    },
    {
        "clientId": "client-1",
        "revisionId": "server-2",
        "localRevisionId": "local-2",
        "changes": {
            "tasks": {
                "$input": {
                    "added": [
                        { "$PhantomId": "phantom-1", "id": 3, "name": "Task 1 (updated)" }
                    ]
                },
                "added": [
                    { "$PhantomId": "phantom-1", "id": 3, "name": "Task 1 (updated)" }
                ]
            },
            "dependencies": {
                "updated": [{ "id": 1, "active": false }]
            }
        }
    }
]
```


<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>