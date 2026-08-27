# Revision System

## Introduction

To ensure synchronization across multiple clients and maintain project consistency, we have adopted a system where all
changes from clients are routed through a central server. This server determines the correct order of changes, assigning
each message a revision ID for tracking purposes.

## Description

Certain project properties, like ordered trees, necessitate unanimous agreement among clients regarding the order of
changes. In a distributed system, the server plays a crucial role in imposing this order by consolidating all incoming
changes into a single queue. Each subsequent message is assigned an incremented revision ID. Clients track these
revisions and apply changes in the same order.

## Server Implementation

The server implementation is left to the discretion of the client. However, it must adhere to specific behaviors:

1. **Message Reception:** The server should receive messages from clients and put them in order.
2. **Propagation:** Upon receiving a message, the server should propagate it to all clients.
3. **Consistent Order:** Clients must receive messages in the same order, as defined by the server.
4. **Persistence Tracking:** The server should track which revisions are persisted, ensuring consistency across clients.
5. **Revision Listing:** The server should provide a list of revisions starting from a specified revision provided by a
client.
6. **Timezone Handling:** The server should either disregard timezone information or utilize calendars with timezone
data.

When referencing a revision on the server, we mean a changeset from a client. An ID is assigned to a changeset as
follows:
```
(project state) + (changeset with ID) = (new project state with ID)
```

Thus, a revision (rev N) represents both a specific project state and the changeset that transitions the project to this
state from the previous revision (rev N - 1).

### Requirements

#### Timezone Consistency

In a network with clients across different time zones using calendars with timezone information, ensuring consistent
start/end dates is essential. Clients must either adopt calendars with timezone data (allowing non-working time to be
in different time zones) or omit timezone information from tasks altogether.

Consider a task that lasts for 5 days with a calendar that defines non-working time as weekends in the local time zone.
Two clients in different time zones will have different start/end dates for this task and won't be able to come to an
agreement.

#### Handling Record Duplicates

When a client adds and immediately modifies a new record, resulting in two local revisions, the server must identify
and handle duplicate records. It should update existing records with the same Phantom ID instead of creating new ones,
necessitating tracking of Phantom IDs and real IDs for all records.

## Revision Algebra

### Definitions

- **S{N}:** Project state with revision ID N
- **C{N}:** Changeset with revision ID N

### Addition

Revisions can be advanced:
```
S0 + C1 -> S1
S1 + C2 -> S2
S0 + C1 + C2 -> S2
```

Applying a revision to itself does not alter the state:
```
S1 + C1 -> S1
S2 + C2 -> S2
```

Revisions must be applied in ascending order:
```
// Correct
S0 + C1 + C2 -> S2
// Applying changes in a different order may yield a different state
S0 + C2 + C1 -> S3
```

Revisions can only be applied to a specific revision N - 1:
```
S0 + C1 -> S1 // correct
S0 + C2 -> S3 // incorrect, unexpected state
```

### Subtraction

The same rules apply to subtraction, allowing revisions to be moved backward:
```
S2 - C2 -> S1
S1 - C1 -> S0
S2 - C2 - C1 -> S0
```

### Navigating revisions

Client tracks revisions and is able to navigate revisions back and forth to apply incoming changesets in the correct
order.

Assume client loaded initial dataset and then received few revisions from the server, in this case client will have the
following revision history:
```
S0 + C1 -> S1
S1 + C2 -> S2
S2 + C3 -> S3
```

Client may receive a set of server revisions in one go:
```
C2, C4, C5
```

In this case, client should apply revisions in the same order. To do it, it first should roll back C3, C2, then apply
C4, C5 and C3:
```
S3 - C3 + C4 + C5 + C3 -> S3* // S3* is not the same as S3
```

In this case client and server both would have same revision sequence.

### Client workflow

Assume server has the following list of revisions:
```
S0 -> S1 -> S2
```

Assume client was on S1 when it started making changes. Before applying incoming revision (S2) client has to process own
changes. Meaning client should send them to the server and assign a temporary revision ID to those. When changes are
sent, client can apply revisions it already received.

Client revisions:
```
S0 -> S1 -> TMP // S2 is in queue
```

When TMP is sent to a server, client rolls back to S1 and applies S2 on top:
```
TMP -> S1 -> S2 -> TMP
```

## Revisions in Practice

In practice, revisions are more nuanced. Consider two clients making changes within the same parent:
```
// Client 1
S0 + C1 -> S1

// Client 2
S0 + C2 -> S2

// Interchanged changes
S1 + C2 -> S3
S2 + C1 -> S3
```

State `S3` will be identical on both clients, but applying both `C1` and `C2` may lead to a new changeset `C3`. Both
clients will generate the same changeset, which ideally should be identical, and exchange it:
```
S1 + C2 -> S3 (emit C3)
S2 + C1 -> S3 (emit C4)

// Exchange and apply C3 and C4
S3 + C4 -> S3
S3 + C3 -> S3
```

Consider the following example:

```javascript
// Base state
const tasksData = [
    {
        id : 1,
        name : 'parent',
        expanded : true,
        percentDone : 0,
        duration : 2,
        children : [
            {
                id : 11,
                name : 'Child 1',
                duration : 2,
                percentDone : 0
            },
            {
                id : 12,
                name : 'Child 2',
                duration : 2,
                percentDone : 0
            }
        ]
    }
]

// Client 1 changes percent done on child 1
// This will set parent percent done to 25
taskStore.getById(11).percentDone = 50;

// Client 2 changes percent done on child 2
// This will set parent percent done to 50
taskStore.getById(12).percentDone = 100;
```

Clients will then apply the following server revisions:

```json
[
  {
    "revisionId": "server-1",
    "localRevisionId": "local-1",
    "clientId": "client-1",
    "changes": {
      "tasks": {
        "updated": [
          { "id" : 1, "percentDone": 25 },
          { "id" : 11, "percentDone": 50 }
        ]
      }
    }
  },
  {
    "revisionId": "server-2",
    "localRevisionId": "local-1",
    "clientId": "client-2",
    "changes": {
      "tasks": {
        "updated": [
          { "id" : 1, "percentDone": 50 },
          { "id" : 11, "percentDone": 100 }
        ]
      }
    }
  }
]
```

Upon applying these revisions, the parent task's percent done will be recalculated to 75. Consequently, both clients
will generate and exchange a new revision reflecting this change:

```json
[
  {
    "revisionId": "server-3",
    "localRevisionId": "local-2",
    "clientId": "client-1",
    "changes": {
      "tasks": {
        "updated": [
          { "id" : 1, "percentDone": 75 }
        ]
      }
    }
  },
  {
    "revisionId": "server-4",
    "localRevisionId": "local-2",
    "clientId": "client-2",
    "changes": {
      "tasks": {
        "updated": [
          { "id" : 1, "percentDone": 75 }
        ]
      }
    }
  }
]
```

## Client Implementation

Key concepts for client implementation:

1. **Initial Dataset:** Client loads the initial dataset and sets a `base` revision.
2. **Unique Identifier:** Each client is assigned a unique ID by the server for identifying its changes.
3. **Local Revisions:** Client records changes locally, automatically managed by STM.
4. **Revision Tracking:** Every revision is assigned a local ID.
5. **Transmission:** When sending changes, the client includes the changeset and local revision ID.
6. **Message Reception:** Server sends messages containing the client's local revision ID, client ID, and changeset.
7. **Conflict Resolution:** Clients resolve conflicts locally using predefined rules to maintain consistency.
8. **Project Inputs:** Clients provide project input information to prevent unnecessary change overrides.

### Determining Project Changeset Input

Clients send complete changesets in revisions, including user inputs. However, applying only the changeset risks
overwriting another user's changes. For instance, if there is a task with duration 1 which starts on January 1st and one
client sets duration to 2 and another moves task to January 2nd projects will generate following changesets:
```
// changes made by 1st client
{ "id": 1, "duration": 2, "endDate": "2020-01-03" }

// changes made by 2nd client
{ "id": 1, "constraintDate": "2020-01-02", "startDate": "2020-01-02", "endDate": "2020-01-03" }
```

When project receives 2nd changeset it will set both start date and end date to the task which is a signal to
recalculate duration. Duration will be calculated back to one day. Which effectively erases change from client 1. It
works same when we have a local revision and just rolled back and forth to apply remote revision.

To address this, clients provide the user-initiated input information, allowing project to differentiate between user
actions and changes, caused by them. For instance:

```json
[
  {
    "revisionId": "server-1",
    "localRevisionId": "local-1",
    "clientId": "client-1",
    "changes": {
      "tasks": {
        "$input": {
          "updated": [
            { "id": 1, "duration": 2 }
          ]  
        },
        "updated": [
          { "id": 1, "duration": 2, "endDate": "2020-01-03" }
        ]
      }
    }
  },
  {
    "revisionId": "server-2",
    "localRevisionId": "local-1",
    "clientId": "client-2",
    "changes": {
      "tasks": {
        "$input": {
          "updated": [
            {
              "id": 1,
              "constraintDate": "2020-01-02",
              "constraintType": "startnoearlierthan",
              "startDate": "2020-01-02"
            }
          ]
        },
        "updated": [
          {
            "id": 1,
            "constraintDate": "2020-01-02",
            "constraintType": "startnoearlierthan",
            "startDate": "2020-01-02",
            "endDate": "2020-01-03"
          }
        ]
      }
    }
  }
]
```

When client project receives a changeset with input, it only applies the input. **Calculated values are meant to be
persisted, project input is meant to be used by other projects**.

When these revisions are applied, project will first increase the duration, and then it will move task to Jan 2nd. After
that it will calculate another revision with no input and modified end date.

### Conflict Resolution

Simultaneous changes by multiple clients may introduce conflicts, such as circular dependencies. Clients resolve
conflicts locally based on predefined rules to ensure consistency across the network.

Consider the example of adding dependencies between tasks A and B simultaneously by two clients. First adds dependency
from A to B and second - from B to A. Both clients send changes to the server, resulting in revisions that may conflict.
Each client resolves the conflict locally before propagating the revised changeset.

Clients could be in a different state when applying revision with a conflict.

#### Client receives revision with a conflict

In the example above, client 1 will receive 2 revisions and apply them both. Algorithm would go as follows:

1. Checkout to base.
2. Apply remote revision based on own local revision.
3. Apply revision from client 2 which contains a conflict.
4. Resolve conflict by disabling the dependency and create a new local revision which contains dependency update.
5. Propagate revision to all clients.

#### Client receives revision and its local revision creates a conflict

Now lets say client 2 receives only one revision from the client 1 and does not receive revision for its own changes.
In this case client 2 will have a new record with only a phantom id. It means that if we try to create a revision with
a conflict resolution, the only information client 2 has at this point is the phantom id of the record. Such revision
cannot be propagated to other clients, because other clients cannot apply such revision with only a phantom id.

To solve this problem, algorithm would go as follows:

1. Checkout to base.
2. Apply revision from client 1.
3. Apply own revision which now contains a conflict.
4. Resolve conflict by disabling the dependency. This change should not be propagated to other clients.

After that client 2 can receive own revision from the server. In which case it will have to checkout back to first
revision and apply this new revision which contains a conflict. Now record has an ID and proper fixing revision can be
created.

## Conclusion

The revision system facilitates collaborative project management by providing a framework for tracking, applying, and
resolving changes across distributed clients. By adhering to the outlined principles and implementing robust conflict
resolution mechanisms, clients can maintain project consistency and integrity even in complex, multi-user environments.


<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>