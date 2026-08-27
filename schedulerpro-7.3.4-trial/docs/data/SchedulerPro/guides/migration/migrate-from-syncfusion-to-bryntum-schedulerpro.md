# Migrate from Syncfusion Scheduler to Bryntum Scheduler Pro

Syncfusion Scheduler and [Bryntum Scheduler Pro](https://bryntum.com/products/schedulerpro/) are 
commercial project management UI components for scheduling tasks. 

This tutorial will show you how to migrate from Syncfusion Scheduler to Bryntum Scheduler Pro.

The Bryntum Scheduler Pro is an extension of the Bryntum Scheduler with more features, like highlighting calendars and
time spans, a scheduling engine, and additional widgets. You can learn more about the differences between Bryntum
Scheduler and Bryntum Scheduler Pro in
[our comparison](https://bryntum.com/products/schedulerpro/scheduler-vs-schedulerpro/).

We'll migrate an existing Syncfusion Scheduler application by following these steps:

- Migrate the database to the Bryntum Scheduler Pro data structure.
- Update the backend API endpoints.
- Update the client-side code.
- Test the migration implementation.

After migration, we'll create an extra dependencies SQL table to show you how to add event dependencies to your Bryntum
Scheduler Pro and demonstrate how to add travel time to an event. Dependencies and travel time are some of the features
available on the Bryntum Scheduler Pro that the Syncfusion Scheduler and Bryntum Scheduler do not have.

## Getting started

We'll use an existing Syncfusion Scheduler starter project that has a separate frontend and backend. The
[frontend starter GitHub 
repository](https://github.com/bryntum/syncfusion-scheduler-migration-bryntum-schedulerpro-frontend-starter)
 web application uses TypeScript. The
[backend starter GitHub 
repository](https://github.com/bryntum/syncfusion-scheduler-migration-bryntum-schedulerpro-backend-starter)
 is a Node.js backend server that uses Express and has API endpoints for performing CRUD operations on a MySQL database.

<div class="note">
In this tutorial, we'll use the 
<a href="https://github.com/bryntum/syncfusion-scheduler-migration-bryntum-schedulerpro-frontend-starter">
frontend starter GitHub repository</a> and 
<a href="https://github.com/bryntum/syncfusion-scheduler-migration-bryntum-schedulerpro-backend-starter">
backend starter GitHub repository</a> as a starting point to show you how to migrate to a Bryntum Scheduler Pro. 
If you want to follow these tutorial steps exactly, please clone the repositories first and install the applications 
following the instructions in the <code>README.md</code> files. Your code will differ slightly if you use a frontend 
framework such as React, Angular, or Vue.
</div>

Following migration, the Bryntum Scheduler Pro should display the same data as the existing Syncfusion Scheduler:

![Syncfusion Scheduler starter app](data/SchedulerPro/images/migrate-from-syncfusion-schedulerpro/syncfusion.png)

Notice that the Syncfusion Scheduler has a blocked lunchtime where events can't be scheduled, and two buttons on the top
left that you can use to
[customize the order of overlapping 
events](https://ej2.syncfusion.com/javascript/documentation/schedule/appointments#customize-the-order-of-the-overlapping-events)
.

If you click the "Sort by priority" button, events that are high priority (colored red) will be placed above
overlapping low priority events. We'll customize the Bryntum Scheduler Pro to have these same features.

## Migrate the database to the Bryntum Scheduler Pro data structure

To migrate the existing database to the Bryntum Scheduler Pro data structure, we'll create new tables for the Bryntum
Scheduler Pro and then insert data from the existing Syncfusion Scheduler tables into the new tables.

### Create database tables compatible with Bryntum Scheduler Pro

If you followed the instructions in the backend starter `README.md`
 file, your database is already configured and populated with some data.

The `appointments` table should look like this:

![Syncfusion Scheduler appointments MySQL table 
data](data/SchedulerPro/images/migrate-from-syncfusion-schedulerpro/syncfusion-appointments-db-table.png)

The `resources` table should look like this:

![Syncfusion Scheduler resources MySQL table 
data](data/SchedulerPro/images/migrate-from-syncfusion-schedulerpro/syncfusion-resources-db-table.png)

We'll create four separate tables now for the Bryntum Scheduler Pro data. A little later in the tutorial, we'll create a
fifth table when we add extra features to the Bryntum Scheduler Pro.

First, in MySQL Workbench, make sure that you set the `syncfusion_scheduler` table for use:

```sql
USE syncfusion_scheduler;
```

Run the following query to create the `bryntum_schedulerpro_resources`
 table for the resources data:

```sql
create TABLE `bryntum_schedulerpro_resources`
(
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `eventColor` varchar(255) DEFAULT NULL,
  `readOnly` boolean DEFAULT FALSE,
  `expanded` boolean DEFAULT FALSE,
  PRIMARY KEY (`id`)
);
```

Create the `bryntum_schedulerpro_events`
 table with the following query:

```sql
create TABLE `bryntum_schedulerpro_events`
(
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `readOnly` boolean DEFAULT FALSE,
  `timeZone` varchar(255) DEFAULT NULL,
  `draggable`boolean DEFAULT TRUE,
  `resizable`varchar(255) DEFAULT null,
  `children` varchar(255) DEFAULT null,
  `allDay` boolean DEFAULT FALSE,
  `duration` float(11, 2) unsigned DEFAULT NULL,
  `durationUnit` varchar(255) DEFAULT 'hour',
  `startDate`datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `exceptionDates` json DEFAULT null,
  `recurrenceRule` varchar(255) DEFAULT null,
  `cls`varchar(255) DEFAULT null,
  `eventColor` varchar(255) DEFAULT null,
  `eventStyle` varchar(255) DEFAULT null,
  `iconCls` varchar(255) DEFAULT null,
  `style` varchar(255) DEFAULT null,
  `calendar` varchar(255) DEFAULT NULL,
  `direction`varchar(255) DEFAULT NULL,
  `manuallyScheduled` boolean DEFAULT FALSE,
  `unscheduled` boolean DEFAULT FALSE,
  `ignoreResourceCalendar` boolean DEFAULT FALSE,
  `constraintType` varchar(255) DEFAULT NULL,
  `constraintDate` datetime DEFAULT NULL,
  `effort` float(11, 2) unsigned DEFAULT NULL,
  `effortUnit` varchar(255) DEFAULT NULL,
  `inactive` boolean DEFAULT NULL,
  `segments` json DEFAULT null,
  `effortDriven` boolean DEFAULT FALSE,
  `schedulingMode` varchar(255) DEFAULT NULL,
  `delayFromParent` float(11, 2) unsigned DEFAULT NULL,
  `showInTimeline` boolean DEFAULT NULL,
  `percentDone` int NOT NULL DEFAULT 0,
  `note` varchar(255) DEFAULT NULL,
  `preamble` varchar(255) DEFAULT NULL,
  `postamble`varchar(255) DEFAULT NULL,
  `priority` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
```

The `priority`
 field is a custom field.

Create the `bryntum_schedulerpro_assignments`
 table with the following query:

```sql
create TABLE `bryntum_schedulerpro_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eventId` int NOT NULL,
  `resourceId` int NOT NULL,
  `units` float(11, 2) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX (`eventId`),
  CONSTRAINT `fk_bryntum_schedulerpro_assignments_events` FOREIGN KEY (`eventId`) 
  REFERENCES `bryntum_schedulerpro_events`(`id`) ON DELETE CASCADE,
  INDEX (`resourceId`) ,
  CONSTRAINT `fk_bryntum_schedulerpro_assignments_resources` FOREIGN KEY (`resourceId`) 
  REFERENCES `bryntum_schedulerpro_resources`(`id`) ON DELETE CASCADE
);
```

Create the `bryntum_schedulerpro_calendars`
 table with the following query:

```sql
create TABLE `bryntum_schedulerpro_calendars` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `intervals` json DEFAULT null,
  `unspecifiedTimeIsWorking` boolean DEFAULT FALSE,
  PRIMARY KEY (`id`)
);
```

We'll use the calendar to set the lunchtime in the new scheduler.

### Migrate the existing Syncfusion data into the new tables

Run the following query to insert the existing data from the `resources`
 table into the newly created `bryntum_schedulerpro_resources`
 table:

```sql
INSERT INTO `bryntum_schedulerpro_resources` (id, name, eventColor)
SELECT Id, Text, Color
FROM `resources`;
```

Next, run the following query to insert the existing data from the `appointments`
 table into the newly created `bryntum_schedulerpro_events`
 table:

```sql
INSERT INTO bryntum_schedulerpro_events (
		id,
		name,
		allDay,
		startDate,
		endDate,
		recurrenceRule,
		Priority
)
SELECT
		Id,
		Subject,
		IsAllDay,
		StartTime,
		endTime,
		RecurrenceRule,
		priority
FROM appointments
WHERE IsBlock IS NOT true;
```

Run the following query to insert the existing data from the `appointments`
 table into the newly created `bryntum_schedulerpro_calendars`
 table:

```sql
INSERT INTO bryntum_schedulerpro_calendars (id, name, unspecifiedTimeIsWorking, intervals)
VALUES (
    'regular',
    'Regular', 
    TRUE,
    (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT(
        'name', Subject,
        'recurrentStartDate', CONCAT('at ', TIME_FORMAT(StartTime, '%H:%i')),
        'recurrentEndDate', CONCAT('at ', TIME_FORMAT(EndTime, '%H:%i')),
        'isWorking', FALSE
    ) SEPARATOR ', '), ']')
     FROM appointments
     WHERE IsBlock = true
    )
);
```

We use the Syncfusion Scheduler "Lunch" event to create the calendar interval.

As the Syncfusion Scheduler `resourceId`
 property is a JSON object that can contain one or many resource IDs, we would need to write a complex MySQL query to
create an assignment for each resource ID. Instead, we'll add data to the `bryntum_schedulerpro_assignments`
 table using a Node.js script and the
[MySQL2](https://github.com/sidorares/node-mysql2)
 library.

Create a file called `migrateData.js`
 in the root directory of the backend Syncfusion Scheduler project and add the following lines of code to it:

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
    "SELECT Id, ResourceId FROM appointments WHERE IsBlock IS NOT true;"
  );

  // Step 2: Parse the JSON and prepare data for insertion
  const assignmentsToInsert = [];
  for (const appointment of appointments) {
    const resourceIdVal = appointment.ResourceId;
    const resourceIds = Array.isArray(resourceIdVal)
      ? resourceIdVal
      : [resourceIdVal];

    for (const resourceId of resourceIds) {
      assignmentsToInsert.push([appointment.Id, resourceId]);
    }
  }

  // Step 3: Insert data into `bryntum_schedulerpro_assignments`
  if (assignmentsToInsert.length > 0) {
    await db.query(
      "INSERT INTO bryntum_schedulerpro_assignments (eventId, resourceId) VALUES ?",
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
 table into the newly created `bryntum_schedulerpro_assignments`
 table.

Open your terminal in the project root folder and run the following command to execute the migration script:

```shell
node migrateData.js
```

<div class="note">
Please note that the Bryntum Scheduler Pro has more data models out of the box than we demonstrate in this guide, 
for example, time ranges, resource time ranges, and so on. To keep this guide short, we don't create tables for 
all possible data models. To support other models on the database level, please see the <code>sql/setup.sql</code> 
file included with the <a href="https://bryntum.com/download/?product=schedulerpro">
Bryntum Scheduler Pro CrudManager demo</a>.
</div>

Now that the database is ready, we can update our backend code.

## Set up the server side

We'll create two new API route handlers on the server, `/api/load`
 and `/api/sync`
. The `/api/load`
 path will read the data from the database and send it to the Bryntum Scheduler Pro. Changes on the client-side Bryntum
Scheduler Pro will be persisted to the database using the `/api/sync`
 path.

### Set up the data-loading endpoint

To create the `/api/load`
 API endpoint, add the following HTTP GET request handler to the `server.js`
 file:

```javascript
app.get("/api/load", async (req, res) => {
  try {
    const [[resources], [events], [assignments], [calendars]] =
      await Promise.all([
        db.query("SELECT * FROM bryntum_schedulerpro_resources"),
        db.query("SELECT * FROM bryntum_schedulerpro_events"),
        db.query("SELECT * FROM bryntum_schedulerpro_assignments"),
        db.query("SELECT * FROM bryntum_schedulerpro_calendars"),
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
      calendars: {
        rows: calendars,
      },
    });
  } catch (error) {
    console.error({ error });
    res.send({
      success: false,
      message:
        "There was an error loading the Scheduler Pro data.",
    });
  }
});
```

The route handler function reads data from the Bryntum Scheduler Pro data tables and sends the data to the client as
JSON. The JSON response is structured to match the
[response format](#Scheduler/guides/data/crud_manager.md#response-format)
 expected by Bryntum Scheduler Pro.

If the backend project is not already running, open the root folder in the terminal and run the following command to
check that the endpoint works:

```shell
npm start
```

Now if you open
`http://localhost:1338/api/load`
 in a browser, you should see the Bryntum Scheduler Pro data in JSON format.

### Set up the changes-saving endpoint

Now make another route on the server that will handle HTTP POST requests to the `/api/sync`
 route. The client-side Bryntum Scheduler Pro will use a
[`project`](#SchedulerPro/model/ProjectModel)
 property that has a built-in
[CrudManager](#Scheduler/crud/AbstractCrudManagerMixin)
. The CrudManager will send data changes via POST requests to the
`/api/sync
`
 endpoint when changes are made to the Scheduler. We'll use this endpoint to keep the data in the database in sync with
the client-side UI data.

Add the following HTTP POST `/api/sync`
 route to the bottom of the `server.js`
 file:

```javascript
app.post("/api/sync", async function (req, res) {
  const { requestId, resources, events, assignments, calendars } = req.body;
  try {
    const response = { requestId, success: true };
    let eventMapping = {};

    if (resources) {
      const rows = await applyTableChanges(
        "bryntum_schedulerpro_resources",
        resources
      );
      if (rows) {
        response.resources = { rows };
      }
    }

    if (events) {
      const rows = await applyTableChanges(
        "bryntum_schedulerpro_events",
        events
      );
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
        "bryntum_schedulerpro_assignments",
        assignments
      );
      if (rows) {
        response.assignments = { rows };
      }
    }

    if (calendars) {
      const rows = await applyTableChanges(
        "bryntum_schedulerpro_calendars",
        calendars
      );
      if (rows) {
        response.calendars = { rows };
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
body and then sends the data changes to the `applyTableChanges` helper function. The `eventMapping` variable is used 
to store the `id` of a created event. We'll use this `id` for the `eventId` value of the assignment added when an 
event is created.

Define the `applyTableChanges` helper function at the bottom of the `server.js` file:

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
 helper function checks what type of CRUD operation must be performed and the database table it should be performed on,
and then calls the relevant CRUD helper function. Let's create these CRUD helper functions.

Define the `createOperation` function at the bottom of the `server.js` file:

```javascript
async function createOperation(added, table) {
  const results = await Promise.all(
    added.map(async (record) => {
      const { $PhantomId, exceptionDates, segments, ...data } = record;

      let insertData;
      if (table === "bryntum_schedulerpro_events") {
        insertData = {
          ...data,
          exceptionDates: exceptionDates
            ? JSON.stringify(exceptionDates)
            : null,
          segments: segments ? JSON.stringify(segments) : null,
        };
      }
      if (table === "bryntum_schedulerpro_calendars") {
        insertData = {
          ...data,
          intervals: intervals ? JSON.stringify(intervals) : null,
        };
      }
      if (
        table === "bryntum_schedulerpro_resources" ||
        table === "bryntum_schedulerpro_assignments"
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
The <code>$PhantomId</code> is a phantom identifier, an auto-generated, unique client-side value used to identify 
a record. You should not persist the phantom identifier on the server. The <code>createOperation</code> function 
returns the 
phantom identifier and the ID assigned by the database, and the client-side Bryntum Scheduler Pro will update the ID 
in the data store to the ID assigned by the database. Read more about phantom identifiers in our 
<a href="#Scheduler/guides/data/crud_manager.md#sync-request-structure">
docs</a>. 
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
      if (table === "bryntum_schedulerpro_events") {
        insertData = {
          ...data,
          exceptionDates: exceptionDates
            ? JSON.stringify(exceptionDates)
            : null,
        };
      }
      if (
        table === "bryntum_schedulerpro_resources" ||
        table === "bryntum_schedulerpro_assignments"
      ) {
        insertData = data;
      }

      return db.query("UPDATE ?? set ? where id = ?", [table, insertData, id]);
    })
  );
}
```

We now have the API endpoints needed for a Bryntum Scheduler Pro.

## Update the client-side code

Now that the backend code is ready, we'll update and set up the frontend code.

Install the Bryntum Scheduler Pro in the frontend application by following
[step 1](#SchedulerPro/guides/quick-start/javascript-npm.md#access-to-npm-registry)
 and
[step 4](#SchedulerPro/guides/quick-start/javascript-npm.md#install-component)
 of the
[vanilla JavaScript with npm setup guide](#SchedulerPro/guides/quick-start/javascript-npm.md)
.

Open the `src/styles/styles.css`
 file and replace the styles with the following styles:

```css
@import "../../node_modules/@bryntum/schedulerpro/schedulerpro.css";
@import "../../node_modules/@bryntum/schedulerpro/svalbard-light.css";

body,
html {
  margin: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Poppins, 'Open Sans', Helvetica, Arial, sans-serif;
  font-size: 14px;
}

#Scheduler {
  height: 100%;
}
```

Next, set up the Bryntum Scheduler Pro component. Replace the code in the `src/app/app.ts`
 file with the following lines of code:

```typescript
import { SchedulerPro, StringHelper } from "@bryntum/schedulerpro";
import CustomEventModel from "../lib/CustomEventModel";

// Event layout config that we will update at runtime
const eventLayout = {
    type    : 'stack',
    // Specify order of all groups
    weights : {
        high  : 1,
        low   : 2
    },
    groupBy : ''
};

const schedulerPro = new SchedulerPro({
  appendTo: "Scheduler",
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
  eventLayout,
  features: {
    eventBuffer: true,
    taskEdit: {
      items: {
        generalTab: {
          items: {
            // Customize task editor to handle new model field
            priorityField: {
              type: "combo",
              store: {
                data: [
                  { id: "high", text: "High" },
                  { id: "low", text: "Low" },
                ],
              },
              name: "priority",
              label: "Priority",
              editable: false,
              weight: 250,
            },
          },
        },
      },
    },
  },
  // Enable recurring events (recurrence rules are specified per event in the dataset)
  enableRecurringEvents: true,
  eventRenderer(args) {
    const { renderData } = args;
    const eventRecord = args.eventRecord as CustomEventModel;
    if (eventRecord.priority === "high") {
      renderData.eventColor = "red";
    }

    renderData.iconCls = eventRecord.isRecurring
      ? "fa fa-sync"
      : eventRecord.isOccurrence
      ? "fa fa-sync"
      : "fa fa-calendar";
    return StringHelper.xss`${eventRecord.name}`;
  },
  project: {
    calendar: "regular",
    eventModelClass: CustomEventModel,
    // Configure urls used by the built-in CrudManager
    transport: {
      load: {
        url: "http://localhost:1338/api/load",
      },
      sync: {
        url: "http://localhost:1338/api/sync",
      },
    },
    autoLoad: true,
    autoSync: true,
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: true,
  },
  columns: [{ text: "Name", field: "name", width: 130 }],

  tbar: [
    {
      type: "buttonGroup",
      toggleGroup: true,
      defaults: {
        width: "12em",
      },
      items: [
        {
          type: "button",
          ref: "none",
          text: "No sorting",
          pressed: true,
        },
        {
          type: "button",
          ref: "priority",
          text: "Sort by priority",
        },
      ],
      onAction({ source: button }) {
        const { ref } = button;
        eventLayout.groupBy = ref === "priority" ? "priority" : "";
        schedulerPro.eventLayout = Object.assign({}, eventLayout);
      },
    },
  ],
});
```

We've created a Bryntum Scheduler Pro component and set it up to load data from the backend `/api/load`
 API endpoint on the initial load of the web page using the project CrudManager. We also specify that the `/api/sync`
 endpoint will be used when any create, update, or delete operation takes place to keep the client-side data and
database data in sync.

Note that the CrudManager makes the Bryntum Scheduler Pro more efficient to update compared to the Syncfusion Scheduler,
as changing the data does not cause a refetch of all the data.

The
[task editor](#SchedulerPro/widget/SchedulerTaskEditor)
 has an extra combo input added for the custom priority field. The
`eventLayout` 
config and toolbar buttons are used to customize the order of overlapping events. If the "Sort by priority" button is
clicked, the events are grouped by the custom priority field. The "high" priority value has a lower weight, so it will
be placed on top of overlapping "low" priority events.

We need to create the imported `CustomEventModel`
. Create a `lib`
 folder in the `src`
 folder and create a file called `CustomEventModel.ts`
 inside it. Add the following lines of code to `CustomEventModel.ts`
:

```typescript
import { EventModel } from "@bryntum/schedulerpro";

export default class CustomEventModel extends EventModel {
  declare priority: "low" | "high";

  static override get fields() { 
    return [
      { name: "durationUnit", defaultValue: "h" },
      { name: "priority", defaultValue: "low" },
    ];
  }
}
```

We add the custom "priority" field to the array of defined fields for this custom event model that extends the Bryntum
Scheduler Pro event model.

We use the TypeScript `declare`
 keyword to let the TypeScript compiler know that the custom `priority`
 field exists on the class.

The TypeScript `override`
 keyword is used to indicate that the `get fields()`
 static method is being overridden. It adds a Type check to see if the method being overridden exists on the base class
 `EventModel`
.

## Test the migration implementation

Open the root folders of the backend and frontend apps and run the development server for each using the following
command:

```shell
npm start
```

Open
`http://localhost:4000`
, and you should see the migrated data from Syncfusion Scheduler loaded into the Bryntum Scheduler Pro:

![Bryntum Scheduler Pro with migrated 
data](data/SchedulerPro/images/migrate-from-syncfusion-schedulerpro/bryntum-schedulerpro.png)

Changes you make to the Bryntum Scheduler Pro will be persisted to your MySQL database. You can create an event by
clicking and dragging in an empty cell or right-clicking in an empty cell and selecting "Add event" from the popup. You
can edit or delete an event by right-clicking on it and selecting the appropriate list item from the popup.

You can also edit or delete a resource. You would need to implement this manually for the Syncfusion Scheduler.

## Adding Bryntum Scheduler Pro features: Dependencies and travel time

Now we'll add two features specific to Bryntum Scheduler Pro: Dependencies and travel time.

First create a SQL table for dependencies. Run the following SQL query in your MySQL Workbench desktop application:

```sql
create TABLE `bryntum_schedulerpro_dependencies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from` int DEFAULT NULL,
  `to` int DEFAULT NULL,
  `fromEvent` int DEFAULT NULL,
  `toEvent` int DEFAULT NULL,
  `fromSide` varchar(10) DEFAULT 'right',
  `toSide` varchar(10) DEFAULT 'left',
  `type` int DEFAULT NULL,
  `cls` varchar(255) DEFAULT NULL,
  `lag` float DEFAULT 0,
  `lagUnit` varchar(255) DEFAULT 'hour',
  `exceptionDates` json  DEFAULT null,
  `active` boolean DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX (`from`),
  CONSTRAINT `fk_bryntum_schedulerpro_dependencies_from_event` FOREIGN KEY (`from`) 
  REFERENCES `bryntum_schedulerpro_events`(`id`) ON DELETE CASCADE,
  INDEX (`to`),
  CONSTRAINT `fk_bryntum_schedulerpro_dependencies_to_event` FOREIGN KEY (`to`) 
  REFERENCES `bryntum_schedulerpro_events`(`id`) ON DELETE CASCADE
);
```

In the backend application `/api/load`
 API endpoint route handler function, add the dependencies to the data queried from the database:

```javascript
    const [[resources], [events], [assignments], [calendars], [dependencies]] =
      await Promise.all([
        db.query("SELECT * FROM bryntum_schedulerpro_resources"),
        db.query("SELECT * FROM bryntum_schedulerpro_events"),
        db.query("SELECT * FROM bryntum_schedulerpro_assignments"),
        db.query("SELECT * FROM bryntum_schedulerpro_calendars"),
        db.query("SELECT * FROM bryntum_schedulerpro_dependencies"),
      ]);
```

Add the following `dependencies`
 property to the `res.send`
 object:

```javascript
      dependencies: {
        rows: dependencies,
      },
```

In the `/api/sync`
 API endpoint route handler function, add `dependencies`
 to the objects destructured from the request body:

```javascript
  const { requestId, resources, events, assignments, calendars, dependencies } = req.body;
```

Add the following `if`
 statements in the `try`
 block, above the `res.send(response);`
 line:

```javascript
    if (dependencies) {
      const rows = await applyTableChanges(
        "bryntum_schedulerpro_dependencies",
        dependencies
      );
      if (rows) {
        response.dependencies = { rows };
      }
    }
```

Add the following `if`
 block to the `createOperation`
 and `updateOperation`
 helper functions below the other `if`
 blocks:

```javascript
      if (table === "bryntum_schedulerpro_dependencies") {
        insertData = {
          ...data,
          exceptionDates: exceptionDates
            ? JSON.stringify(exceptionDates)
            : null,
        };
      }
```

You'll now be able to add dependencies between events:

![Bryntum Scheduler Pro - adding a 
dependency](data/SchedulerPro/images/migrate-from-syncfusion-schedulerpro/bryntum-schedulerpro-dependencies.gif)

The Bryntum Scheduler Pro is set up to add travel time for events. To add travel time to an event, open the task editor
and add times to the preamble and postamble fields:

![Bryntum Scheduler Pro - adding travel time to an 
event](data/SchedulerPro/images/migrate-from-syncfusion-schedulerpro/bryntum-schedulerpro-travel-time.gif)



<p class="last-modified">Last modified on 2026-07-22 10:39:19</p>