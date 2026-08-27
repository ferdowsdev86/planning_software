# Migrate from Syncfusion Scheduler to Bryntum Scheduler

Syncfusion Scheduler and
[Bryntum Scheduler](https://bryntum.com/products/scheduler/)
 are commercial project management tools for scheduling tasks. This tutorial will show you how to migrate from a
Syncfusion Scheduler to a Bryntum Scheduler.

We'll migrate an existing Syncfusion Scheduler application by following these steps:

- Migrate the database to the Bryntum Scheduler data structure.
- Update the backend API endpoints.
- Update the client-side code.
- Test the migration implementation.

## Getting started

We'll use an existing Syncfusion Scheduler starter project with a separate frontend and backend. The
[frontend starter 
GitHub repository](https://github.com/bryntum/syncfusion-scheduler-migration-bryntum-scheduler-frontend-starter)
web application uses TypeScript. The
[backend starter GitHub
 repository](https://github.com/bryntum/syncfusion-scheduler-migration-bryntum-scheduler-backend-starter)
is a Node.js backend server that uses Express and has API endpoints for performing CRUD operations on a MySQL database.

<div class="note">
In this tutorial, we'll use the 
<a href="https://github.com/bryntum/syncfusion-scheduler-migration-bryntum-scheduler-frontend-starter">
frontend starter GitHub repository</a> 
and <a href="https://github.com/bryntum/syncfusion-scheduler-migration-bryntum-scheduler-backend-starter">
backend starter GitHub repository</a> as a starting point to show you how to migrate to a Bryntum Scheduler. 
If you want to follow the tutorial steps exactly, please clone the repositories first and install the applications 
following the instructions in the <code>README.md</code> files. Your code will differ slightly if you use a frontend 
framework such as React, Angular or Vue.
</div>

When the migration is complete, the Bryntum Scheduler will display the same data as the existing Syncfusion Scheduler:

![Syncfusion Scheduler starter app](data/Scheduler/images/migrate-from-syncfusion/syncfusion-scheduler.png)

## Migrate the database to the Bryntum Scheduler data structure

To migrate the existing database to the Bryntum data structure, we'll make new tables for the Bryntum Scheduler and then
insert data from the existing Syncfusion Scheduler tables into the new tables.

### Create database tables compatible with Bryntum Scheduler

If you followed the instructions in the backend starter `README.md`
 file, your database is already configured and populated with some data.

The `appointments`
 table should look like this:

![Syncfusion appointments MySQL 
table data](data/Scheduler/images/migrate-from-syncfusion/syncfusion-appointments-db-table.png)

The `resources`
 table should look like this:

![Syncfusion resources MySQL 
table data](data/Scheduler/images/migrate-from-syncfusion/syncfusion-resources-db-table.png)

We'll now create three separate tables with schema compatible with the Bryntum Scheduler implementation. We could create
two tables and use the
[`resourceId`](#Scheduler/model/mixin/EventModelMixin#field-resourceId)
property of the event store to link an event to a resource. We recommend using assignments in an
[AssignmentStore](#Scheduler/data/AssignmentStore)
instead because you can then assign an event to multiple resources.

Run the following query to create the `bryntum_scheduler_resources`
table for our resources data:

```sql
create TABLE `bryntum_scheduler_resources`
(
    `id`         int          NOT NULL AUTO_INCREMENT,
    `name`       varchar(255) NOT NULL,
    `eventColor` varchar(255) DEFAULT NULL,
    `readOnly`   boolean      DEFAULT FALSE,
    `expanded`   boolean      DEFAULT FALSE,
    PRIMARY KEY (`id`)
);
```

Create the `bryntum_scheduler_events`
table with the following query:

```sql
create TABLE `bryntum_scheduler_events`
(
    `id`             int          NOT NULL AUTO_INCREMENT,
    `name`           varchar(255) NOT NULL,
    `readOnly`       boolean               DEFAULT FALSE,
    `timeZone`       varchar(255)          DEFAULT NULL,
    `draggable`      boolean               DEFAULT TRUE,
    `resizable`      varchar(255)          DEFAULT null,
    `children`       varchar(255)          DEFAULT null,
    `allDay`         boolean               DEFAULT FALSE,
    `duration`       float(11, 2) unsigned DEFAULT NULL,
    `durationUnit`   varchar(255)          DEFAULT 'day',
    `startDate`      datetime              DEFAULT NULL,
    `endDate`        datetime              DEFAULT NULL,
    `exceptionDates` json                  DEFAULT null,
    `recurrenceRule` varchar(255)          DEFAULT null,
    `cls`            varchar(255)          DEFAULT null,
    `eventColor`     varchar(255)          DEFAULT null,
    `eventStyle`     varchar(255)          DEFAULT null,
    `iconCls`        varchar(255)          DEFAULT null,
    `style`          varchar(255)          DEFAULT null,
    PRIMARY KEY (`id`)
);
```

Create the `bryntum_scheduler_assignments`
 table with the following query:

```sql
create TABLE `bryntum_scheduler_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eventId` int NOT NULL,
  `resourceId` int NOT NULL,
  `units`      float(11, 2) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX (`eventId`),
  CONSTRAINT `fk_bryntum_scheduler_assignments_events` FOREIGN KEY (`eventId`) 
  REFERENCES `bryntum_scheduler_events`(`id`) ON DELETE CASCADE,
  INDEX (`resourceId`) ,
  CONSTRAINT `fk_bryntum_scheduler_assignments_resources` FOREIGN KEY (`resourceId`) 
  REFERENCES `bryntum_scheduler_resources`(`id`) ON DELETE CASCADE
);
```

### Migrate the existing Syncfusion data into the new tables

Run the following query to insert the existing data from the `resources`
 table into the newly created `bryntum_scheduler_resources`
 table:

```sql
INSERT INTO `bryntum_scheduler_resources` (id, name, eventColor)
SELECT id, Text, Color
FROM `resources`;
```

Next, run the following query to insert the existing data from the `appointments`
 table into the newly created `bryntum_scheduler_events`
 table:

```sql
INSERT INTO bryntum_scheduler_events (
		id,
		name,
		timeZone,
		allDay,
		startDate,
		endDate,
		recurrenceRule,
		eventColor
)
SELECT
		Id,
		Subject,
		StartTimezone,
		IsAllDay,
		StartTime,
		endTime,
		RecurrenceRule,
		Color
FROM appointments;
```

We'll add data to the `bryntum_scheduler_assignments`
 table using a Node.js script. Because the Syncfusion Scheduler `resourceId`
 property is a JSON object that can contain one or many resource IDs, creating an assignment for each resource ID would
require creating a complex MySQL query. It's easier to use Node.js and the
[MySQL2](https://github.com/sidorares/node-mysql2)
 library to migrate the data.

Create a file called `migrateData.js`
 in the root directory of the backend Syncfusion project and add the following lines of code to it:

```javascript
import dotenv from "dotenv";
import mysql from "mysql2/promise";

async function insertAssignmentsFromAppointments() {
  dotenv.config();

  const db = mysql.createPool({
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  });

  // Step 1: Fetch data from `appointments`
  const [appointments] = await db.query(
    "SELECT Id, ResourceId FROM appointments"
  );

  // Step 2: Parse the JSON and prepare data for insertion
  const assignmentsToInsert = [];
  for (const appointment of appointments) {
    const resourceIdVal = JSON.parse(appointment.ResourceId);
    const resourceIds = Array.isArray(resourceIdVal)
      ? resourceIdVal
      : [resourceIdVal];
    for (const resourceId of resourceIds) {
      assignmentsToInsert.push([appointment.Id, resourceId]);
    }
  }

  // Step 3: Insert data into `bryntum_scheduler_assignments`
  if (assignmentsToInsert.length > 0) {
    await db.query(
      "INSERT INTO bryntum_scheduler_assignments (eventId, resourceId) VALUES ?",
      [assignmentsToInsert]
    );
  }
  await db.end();
}

insertAssignmentsFromAppointments()
  .then(() => {
    console.log("Insertion complete.");
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
```

This script will insert the existing appointment IDs and the resource IDs for the appointments from the `appointments`
 table into the newly created `bryntum_scheduler_assignments`
 table. Open your terminal in the backend project root folder and run the following command to execute the migration
script:

```shell
node migrateData.js
```

<div class="note">
Please note that Bryntum Scheduler has more data models out of the box than we reference in this guide, for 
example, dependencies, time ranges, and so on. To keep this guide short, we don't make tables for all the data models. 
To support other models on the database level, please see the <code>sql/setup.sql</code> file included with the
 <a href="https://bryntum.com/download/?product=scheduler">Bryntum Scheduler CrudManager demo</a>.
</div>

Now that the database is ready, we can update our backend code.

## Set up the server side

We'll create two new API route handlers on the server, `/load`
 and `/sync`
. The `/load`
 path will read the data from the database and send it to the Bryntum Scheduler. Changes on the client-side Bryntum
Scheduler will be persisted to the database using the `/sync`
 path.

### Set up the data-loading endpoint

To create a `/load`
 API endpoint, add the following GET request handler to the `server.js`
 file:

```javascript
app.get("/api/load", async (req, res) => {
  try {
    const [[resources], [events], [assignments]] = await Promise.all([
      db.query("SELECT * FROM bryntum_scheduler_resources"),
      db.query("SELECT * FROM bryntum_scheduler_events"),
      db.query("SELECT * FROM bryntum_scheduler_assignments"),
    ]);

    res.send({
      success: true,
      resources: {
        rows: resources,
      },
      events: {
        rows: events,
      },
      assignments: {
        rows: assignments,
      },
    });
  } catch (error) {
    console.error({ error });
    res.send({
      success: false,
      message:
        "There was an error loading the resources, events, and assignments data.",
    });
  }
});
```

The GET request handler function reads data from the `bryntum_scheduler_resources`
, `bryntum_scheduler_events`
, and `bryntum_scheduler_assignments`
 tables using the MySQL2 Node.js client and sends it to the client-side Bryntum Scheduler as JSON. The JSON response is
structured to match the
[response format](#Scheduler/guides/data/crud_manager.md#response-format)
 expected by Bryntum Scheduler.

If the backend project is not already running, open the root folder in the terminal and run the following command to
check that the endpoint works:

```shell
npm start
```

Now if you open
`http://localhost:1338/api/load`
 in a browser, you should see the Bryntum Scheduler data in JSON format.

### Set up the changes-saving endpoint

Now make another route on the server that will handle HTTP POST requests to the `/api/sync`
 route. The client-side Bryntum Scheduler will use a
[Crud Manager](#Scheduler/guides/data/crud_manager.md)
 to send data changes via POST requests to the
`/api/sync
`
 endpoint when changes are made on the Scheduler. We'll use this endpoint to keep the data in the database in sync with
the client-side UI data.

Add the following HTTP POST `/api/sync`
 route to the bottom of the `server.js`
 file:

```javascript
app.post("/api/sync", async function (req, res) {
  const { requestId, resources, events, assignments } = req.body;

  try {
    const response = { requestId, success: true };
    let eventMapping = {};

    if (resources) {
      const rows = await applyTableChanges(
        "bryntum_scheduler_resources",
        resources
      );
      // if new data to update client
      if (rows) {
        response.resources = { rows };
      }
    }

    if (events) {
      const rows = await applyTableChanges("bryntum_scheduler_events", events);
      if (rows) {
        if (events?.added) {
          rows.forEach((row) => {
            eventMapping[row.$PhantomId] = row.id;
          });
        }
        response.events = { rows };
      }
    }

    if (assignments) {
      if (events && events?.added) {
        assignments.added.forEach((assignment) => {
          assignment.eventId = eventMapping[assignment.eventId];
        });
      }
      const rows = await applyTableChanges(
        "bryntum_scheduler_assignments",
        assignments
      );
      if (rows) {
        response.assignments = { rows };
      }
    }

    res.send(response);
  } catch (error) {
    console.error({ error });
    res.send({
      requestId,
      success: false,
      message: "There was an error syncing the data.",
    });
  }
});
```

The route handler function gets the data changes and the type of CRUD action to perform on the database from the request
body and then sends the data changes to the `applyTableChanges`
 helper function.

The `eventMapping`
 variable is used to store the `id`
 of a created event. We'll use this `id`
 for the `eventId`
 value of the assignment added when an event is created.

Define the `applyTableChanges`
 helper function at the bottom of the `server.js`
 file:

```javascript
async function applyTableChanges(table, changes) {
  let rows;
  if (changes.added) {
    rows = await createOperation(changes.added, table);
  }
  if (changes.removed) {
    await deleteOperation(changes.removed, table);
  }
  if (changes.updated) {
    await updateOperation(changes.updated, table);
  }
  return rows;
}
```

The `applyTableChanges`
 helper function checks what type of CRUD operation is to be performed and which database table it will be performed on,
and then calls the relevant CRUD helper function. Let's create these CRUD helper functions.

Define the `createOperation`
 function at the bottom of the `server.js`
 file:

```javascript
async function createOperation(added, table) {
  const results = await Promise.all(
    added.map(async (record) => {
      const { $PhantomId, exceptionDates, ...data } = record;

      let insertData;
      if (table === "bryntum_scheduler_events") {
        insertData = {
          ...data,
          exceptionDates: exceptionDates
            ? JSON.stringify(exceptionDates)
            : null,
        };
      }
      if (
        table === "bryntum_scheduler_resources" ||
        table === "bryntum_scheduler_assignments"
      ) {
        insertData = data;
      }
      const [result] = await db.query("INSERT INTO ?? set ?", [
        table,
        insertData,
      ]);
      // Return necessary data for client-side update
      return { $PhantomId, id: result.insertId, ...data };
    })
  );
  return results;
}
```

<div class="note"> 
The <code>$PhantomId</code>is a phantom identifier. It's an auto-generated, unique client-side value that's used to identify a 
record. You should not persist it on the server. We return the phantom identifier and the ID assigned by the database. 
The client-side Bryntum Scheduler will update the ID in the data store to use the ID assigned by the database. 
You can read more about phantom identifiers in our 
<a href="#Scheduler/guides/data/crud_manager.md#sync-request-structure">docs</a>.
</div>

Now add the `deleteOperation`
 and `updateOperation`
 CRUD helper functions to the bottom of the `server.js`
 file:

```javascript
function deleteOperation(deleted, table) {
  return db.query(
    `DELETE FROM ${table} WHERE id in (?)`,
    deleted.map(({ id }) => id)
  );
}
```

```javascript
function updateOperation(updated, table) {
  return Promise.all(
    updated.map(({ id, exceptionDates, ...data }) => {
      let insertData;
      if (table === "bryntum_scheduler_events") {
        insertData = {
          ...data,
          exceptionDates: exceptionDates
            ? JSON.stringify(exceptionDates)
            : null,
        };
      }
      if (
        table === "bryntum_scheduler_resources" ||
        table === "bryntum_scheduler_assignments"
      ) {
        insertData = data;
      }

      return db.query("UPDATE ?? set ? where id = ?", [table, insertData, id]);
    })
  );
}
```

We now have the API endpoints needed for a Bryntum Scheduler.

## Update the client-side code

Now we'll update and set up the frontend code.

Install the Bryntum Scheduler in the frontend application by following
[step 1](#Scheduler/guides/quick-start/javascript-npm.md#access-to-npm-registry)
 and
[step 4](#Scheduler/guides/quick-start/javascript-npm.md#install-component)
 of the
[vanilla JavaScript with npm setup guide](#Scheduler/guides/quick-start/javascript-npm.md)
.

Open the `src/styles/styles.css`
 file and replace the styles in it with the following styles:

```css
@import "../../node_modules/@bryntum/scheduler/scheduler.stockholm.css";

body,
html {
  margin: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Poppins, 'Open Sans', Helvetica, Arial, sans-serif;
  font-size: 14px;
}

#Schedule {
  height: 100%;
}
```

To set up the Bryntum Scheduler component, replace the code in the `src/app/app.ts`
 file with the following:

```typescript
import { Scheduler } from "@bryntum/scheduler";

const scheduler = new Scheduler({
  appendTo: "Schedule",
  startDate: new Date(2024, 3, 15, 9),
  endDate: new Date(2024, 3, 15, 21),
  viewPreset: {
    base: "hourAndDay",
    columnLinesFor: 0,
    headers: [
      {
        unit: "d",
        align: "center",
        dateFormat: "MMMM, DD ddd",
      },
      {
        unit: "h",
        dateFormat: "HH:mm A",
      },
    ],
  },
  crudManager: {
    loadUrl: "http://localhost:1338/api/load",
    syncUrl: "http://localhost:1338/api/sync",
    autoLoad: true,
    autoSync: true,
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: true,
  },
  columns: [{ text: "Name", field: "name", width: 130 }],
});
```

Here we create a Bryntum Scheduler component and set it up to load data from the backend `/api/load`
 API endpoint using the
[Crud Manager](#Scheduler/guides/data/crud_manager.md)
 on the initial load of the web page. We specify the
`/api/sync
`
 endpoint to be used when any create, update, or delete operation takes place to keep the client-side and database data
in sync.

Note that the Crud Manager makes the Bryntum Scheduler more efficient to update compared to the Syncfusion Scheduler, as
changing the data does not cause a refetch of all the data.

## Test the migration implementation

Open the root folders of the backend and frontend apps and run the development server for each using the following
command (if you are not already running the projects):

```shell
npm run start
```

Open
`http://localhost:4000`
, and you should see the migrated data from Syncfusion Scheduler loaded into the Bryntum Scheduler:

![Bryntum Scheduler with migrated data](data/Scheduler/images/migrate-from-syncfusion/bryntum-scheduler.png)

Changes you make to the Bryntum Scheduler will be persisted to your MySQL database. You can create an event by clicking
and dragging in an empty row or right-clicking in an empty row and selecting "Add event" from the popup. You can edit or
delete an event by right-clicking on it and selecting the appropriate list item from the popup.

You can also edit, delete, or copy a resource. You would need to implement this manually for the Syncfusion Scheduler.

## Bryntum Scheduler features

Bryntum Scheduler is more feature-rich than the Syncfusion Scheduler, with features like:

- [Undo and redo](../examples/undoredo/)
- [Dependencies between events](../examples/dependencies/)
- [Advanced filtering](../examples/fieldfilters/)
- [Time selection](../examples/time-selection/)
- [Rows with histograms](../examples/timelinehistogram/)

Browse our
[Scheduler demos](../examples/)
 to see how you can enhance your Bryntum Scheduler with these features and more.



<p class="last-modified">Last modified on 2026-07-22 10:39:14</p>