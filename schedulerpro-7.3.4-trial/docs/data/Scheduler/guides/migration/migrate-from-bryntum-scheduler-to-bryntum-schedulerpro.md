# Upgrade from Bryntum Scheduler to Bryntum Scheduler Pro

[Bryntum Scheduler Pro](https://bryntum.com/products/schedulerpro/) is an extension of the [Bryntum Scheduler](https://bryntum.com/products/scheduler/) UI component that has additional features 
and a powerful scheduling engine that can [automatically schedule](https://bryntum.com/products/schedulerpro/docs/guide/engine/schedulerpro_events_scheduling#automatic-event-scheduling) events based on their constraints, dependencies, 
and resource availability. This means that an event's [startDate](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/EventModel#field-startDate) and [endDate](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/EventModel#field-endDate) may change based on the event 
constraints when it's loaded or added to a project.

Additional Bryntum Scheduler Pro features include:

- Travel time
- Resource Calendars
- Highlighting features
- Custom event grouping
- Event splitting
- Nested events

Learn more about the differences between these two UI components in our comparison article, 
[Scheduler vs. Scheduler Pro](https://bryntum.com/products/schedulerpro/scheduler-vs-schedulerpro/).

This guide will show you how to upgrade from a Bryntum Scheduler to a Bryntum Scheduler Pro. We'll do the following:

- Migrate the database to the Bryntum Scheduler Pro data structure.
- Update the server API endpoints.
- Update the client-side code.
- Add Scheduler Pro features.
- Test the migration implementation.

## Getting started

We'll describe how to migrate from Bryntum Scheduler to Bryntum Scheduler Pro using an existing Bryntum Scheduler 
starter project. The process we follow should help you migrate an existing Scheduler project, or you can set up the 
starter app to work through the guide step by step.

If you're using the starter project, clone the 
[Bryntum Scheduler starter repository](https://github.com/bryntum/upgrade-bryntum-scheduler-to-bryntum-schedulerpro-starter) 
and follow the instructions in the `README.md` file to install the dependencies. The starter uses vanilla JavaScript on 
the client side and Node.js with REST API endpoints on the server side. The endpoints interact with a MySQL client to 
perform CRUD operations on the database.

Following the migration, we expect the Bryntum Scheduler Pro to display the same data as this Bryntum Scheduler, along 
with some extra data:

![Bryntum Scheduler](data/Scheduler/images/migrate-from-scheduler-to-schedulerpro/scheduler.png)

## Migrate the database to the Scheduler Pro data structure

We'll first migrate the existing database so that its data structure is compatible with Bryntum Scheduler Pro. We'll add 
some columns and tables to take advantage of the extra Scheduler Pro features, and some example data to demonstrate 
these features.

If you followed the instructions in the starter repository `README.md` file, you will have configured your database 
already and populated it with some data.

The `scheduler_events` table should look like this:

![Scheduler events database table](data/Scheduler/images/migrate-from-scheduler-to-schedulerpro/scheduler-events.png)

The `scheduler_resources` table should look like this:

![Scheduler resources database table](data/Scheduler/images/migrate-from-scheduler-to-schedulerpro/scheduler-resources.png)

The `scheduler_dependencies` table should look like this:

![Scheduler dependencies database table](data/Scheduler/images/migrate-from-scheduler-to-schedulerpro/scheduler-dependencies.png)

### Create database tables

To demonstrate how you can assign an event to multiple resources, we'll create a `scheduler_assignments` table and use 
it to show the resources that events are assigned to. You can assign an event to multiple resources in both Bryntum 
Scheduler and Bryntum Scheduler Pro.

We'll also create a `scheduler_calendars` table that we'll use to restrict tasks to specific times and resources to 
demonstrate how the Bryntum Scheduler Pro **highlighting calendars** feature helps you to visualize scheduling logic. In 
the completed Scheduler Pro project, you'll only be able to drag events to specific available time slots.

Run the following query to create the `scheduler_assignments` table for assignments data.

```sql
USE bryntum_scheduler_pro;

create TABLE `scheduler_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eventId` int NOT NULL,
  `resourceId` int NOT NULL,
  `units`      float(11, 2) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX (`eventId`),
  CONSTRAINT `fk_scheduler_assignments_events` FOREIGN KEY (`eventId`) REFERENCES `scheduler_events`(`id`) ON DELETE CASCADE,
  INDEX (`resourceId`) ,
  CONSTRAINT `fk_scheduler_assignments_resources` FOREIGN KEY (`resourceId`) REFERENCES `scheduler_resources`(`id`) ON DELETE CASCADE
);
```

The data in this table will be used by the Bryntum Scheduler Pro [AssignmentStore](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/data/AssignmentStore) to show which resources are 
allocated to scheduled events.

Run the following query to populate the `scheduler_assignments` table with example data:

```sql
INSERT INTO `scheduler_assignments` (eventId, resourceId)
SELECT id, resourceId
FROM `scheduler_events`;
```

The starter project we're working with uses a `resourceId` field in the 
[EventsStore](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/data/EventStore) to assign events to
resources, but this approach can only assign an event to a single resource. Bryntum Scheduler Pro uses a 
multi-assignment model by default, so we'll use the AssignmentStore instead.

Since we no longer need it, we can now delete the `resourceId` column from the `scheduler_events` table.

First drop the foreign key constraint in the `scheduler_events` table:

```sql
ALTER TABLE `scheduler_events`
DROP FOREIGN KEY `fk_scheduler_events_resourceId`;
```

Now remove the column:

```sql
ALTER TABLE `scheduler_events`
DROP COLUMN `resourceId`;
```

Now create a `scheduler_calendars` table:

```sql
create TABLE `scheduler_calendars` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `intervals` json                   DEFAULT null,
  `unspecifiedTimeIsWorking` boolean DEFAULT FALSE,
  PRIMARY KEY (`id`)
);
```

We'll use the calendar data to restrict tasks to specific times and resources as shown in our demo, 
[Highlighting Event Calendars](https://bryntum.com/products/schedulerpro/examples/highlight-event-calendars/).

Insert some example data into the table:

```sql
INSERT INTO `scheduler_calendars` (id, name, intervals, unspecifiedTimeIsWorking)
VALUES
    ('workweek', 'Work week', '[{"recurrentStartDate":"on Sat","recurrentEndDate":"on Mon","isWorking":false}]', FALSE),
    ('firstdayhalf', 'First day half', '[{"name":"Available","startDate":"2024-01-29T09:00:00","endDate":"2024-01-29T12:00:00","isWorking":true}]', FALSE),
    ('seconddayhalf', 'Second day half', '[{"name":"Available","startDate":"2024-01-29T12:00:00","endDate":"2024-01-29T16:00:00","isWorking":true}]', FALSE),
    ('allday', 'All day', '[{"name":"Available","startDate":"2024-01-29T09:00:00","endDate":"2024-01-29T15:00:00","isWorking":true}]', FALSE),
    ('vaccination', 'Vaccination slots',
    '[
        {"name":"Morning slot","recurrentStartDate":"at 9:00","recurrentEndDate":"at 10:00","isWorking":true},
        {"name":"Lunch slot","recurrentStartDate":"at 11:00","recurrentEndDate":"at 12:00","isWorking":true},
        {"name":"Afternoon slot","recurrentStartDate":"at 13:00","recurrentEndDate":"at 14:00","isWorking":true},
        {"name":"Late afternoon slot","recurrentStartDate":"at 15:00","recurrentEndDate":"at 16:00","isWorking":true}
    ]', FALSE);
```

Once we've completed the upgrade to Scheduler Pro, you'll only be able to drag tasks to specific slots in the scheduler. 
For example, tasks that are assigned to the `vaccination` calendar can only be moved to a preset morning, lunch, 
afternoon, or late afternoon slot. You can learn more about the Bryntum Scheduler Pro calendar system in our 
[guide to calendars](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/basics/calendars).

### Add columns to existing database tables

The Bryntum Scheduler Pro **event buffer** feature is handy for visualizing additional times needed before and after an 
event, for example, travel time or room preparation and clean up. These additional times are calculated using two model 
fields, `preamble` and `postamble`.

For this example, we'll add the `preamble` and `postamble` columns to the `scheduler_events` table to store the travel 
time needed to get to and from a task.

Let's add these two columns, a `calendar` column to restrict drag-and-drop event editing to the times specified in the 
`scheduler_calendars` table, and a few other columns we need to the `scheduler_events` table:

```sql
ALTER TABLE `scheduler_events`
ADD `calendar` varchar(255) DEFAULT NULL,
ADD `direction` varchar(255) DEFAULT NULL,
ADD `manuallyScheduled` boolean DEFAULT FALSE,
ADD `unscheduled` boolean DEFAULT FALSE,
ADD `ignoreResourceCalendar` boolean DEFAULT FALSE,
ADD `constraintType` varchar(255) DEFAULT NULL,
ADD `constraintDate` datetime DEFAULT NULL,
ADD effort float(11, 2) unsigned DEFAULT NULL,
ADD effortUnit varchar(255) DEFAULT NULL,
ADD inactive boolean DEFAULT NULL,
ADD segments json DEFAULT null,
ADD effortDriven boolean DEFAULT FALSE,
ADD schedulingMode varchar(255) DEFAULT NULL,
ADD delayFromParent float(11, 2) unsigned DEFAULT NULL,
ADD showInTimeline boolean DEFAULT NULL,
ADD percentDone int NOT NULL DEFAULT 0,
ADD note varchar(255) DEFAULT NULL,
ADD `preamble` varchar(255) DEFAULT NULL,
ADD `postamble` varchar(255) DEFAULT NULL;
```

Add the following example [preamble](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/EventModel#field-preamble) and [postamble](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/EventModel#field-postamble) data:

```sql
UPDATE `scheduler_events`
SET `preamble` = CASE
                    WHEN `id` = 1 THEN '30min'
                    WHEN `id` = 9 THEN '1h'
                    ELSE ''
                END,
    `postamble` = CASE
                    WHEN `id` = 1 THEN '30min'
                    WHEN `id` = 9 THEN '45min'
                    ELSE ''
                END
WHERE `id` IN (1, 9);
```

Now add some example `calendar` data values to the events table:

```sql
UPDATE `scheduler_events`
SET `calendar` = CASE
                    WHEN `id` = 1 THEN 'allday'
                    WHEN `id` = 2 THEN 'firstdayhalf'
                    WHEN `id` = 3 THEN 'firstdayhalf'
                    WHEN `id` = 4 THEN 'vaccination'
                    WHEN `id` = 5 THEN 'firstdayhalf'
                    WHEN `id` = 6 THEN 'seconddayhalf'
                    WHEN `id` = 7 THEN 'vaccination'
                    WHEN `id` = 8 THEN 'vaccination'
                    WHEN `id` = 9 THEN 'allday'
                    WHEN `id` = 10 THEN 'seconddayhalf'
                    WHEN `id` = 11 THEN 'seconddayhalf'
                    WHEN `id` = 12 THEN 'seconddayhalf'
                    WHEN `id` = 13 THEN 'seconddayhalf'
                    ELSE calendar
                END
WHERE `id` IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13);
```

Finally, we need to add an extra field to the `scheduler_dependencies` table:

```sql
ALTER TABLE `scheduler_dependencies`
ADD active boolean DEFAULT NULL;
```

Now that the database is ready, we can update the server-side code.

## Update the server API endpoints

We'll update the API route handlers on the server for querying the `/load` and `/sync` paths.

### Handling data loading requests

We'll update the `/load` path API endpoint first. In the `serverConfig` function of the `server.js` file, replace the 
`/load` GET request handler with the following GET request handler:

```javascript
    app.get("/load", async (req, res) => {
    try {
      const [
        [resources],
        [events],
        [dependencies],
        [assignments],
        [calendars],
      ] = await Promise.all([
        db.query("SELECT * FROM scheduler_resources"),
        db.query("SELECT * FROM scheduler_events"),
        db.query("SELECT * FROM scheduler_dependencies"),
        db.query("SELECT * FROM scheduler_assignments"),
        db.query("SELECT * FROM scheduler_calendars"),
      ]);

      const calendarsData = calendars.map((calendar) => {
        const calendarObj = {
          id: calendar.id,
          name: calendar.name,
          intervals: calendar.intervals,
        };
        if (calendar?.unspecifiedTimeIsWorking) {
          calendarObj.unspecifiedTimeIsWorking =
            calendar.unspecifiedTimeIsWorking;
        }
        return calendarObj;
      });

      res.send({
        success: true,
        project: {
          calendar: "workweek",
        },
        resources: {
          rows: resources,
        },
        events: {
          rows: events,
        },
        dependencies: {
          rows: dependencies,
        },
        assignments: {
          rows: assignments,
        },
        calendars: {
          rows: calendarsData,
        },
      });
    } catch (error) {
      console.error({ error });
      res.send({
        success: false,
        message:
          "There was an error loading the resources, events, dependencies, and assignments data.",
      });
    }
  });
```

Here we add the data from the `scheduler_assignments` and `scheduler_calendars` tables to the data sent to the client as 
JSON.

To check that the endpoint works, open the root folder of the project in the terminal and run:

```shell
npm start
```

Now if you open the `http://localhost:1337/load` URL in a browser, you should see the Bryntum Scheduler Pro data in
JSON format.

### Handling persisting changes

We'll now update the `/sync` path API endpoint that's used to sync data changes in the scheduler with the database.

First, add the `assignments` property to the variables obtained from the `req.body` object:

```javascript
    const { requestId, resources, events, dependencies, assignments } =
      req.body;
```

In the `try` block, add the following variable at the top:

```javascript
      let eventMapping = {};
```

We'll use this variable to store the `id` of a newly created event. We'll use this `id` for the `eventId` value of the
assignment added when the event is created.

Replace the `if` statement in the `events` block with the following lines of code:

```javascript
      if (events) {
        const rows = await applyTableChanges("scheduler_events", events);
        if (rows) {
          if (events?.added) {
            rows.forEach((row) => {
              eventMapping[row.$PhantomId] = row.id;
            });
          }
          response.events = { rows };
        }
      }
```

When events are added, we map each event's `PhantomId` (see [Sync request structure](https://bryntum.com/products/schedulerpro/docs/guide/Scheduler/data/crud_manager#sync-request-structure)) to the `result.insertId`
returned by the `createOperation` function. The `insertId` is the `id` of the event added to the MySQL database.

Add the following `if` statement below the `if (events)` block we added before.

```javascript
      if (assignments) {
        if (events && events?.added) {
          assignments.added.forEach((assignment) => {
            assignment.eventId = eventMapping[assignment.eventId];
          });
        }
        const rows = await applyTableChanges(
          "scheduler_assignments",
          assignments
        );
        if (rows) {
          response.assignments = { rows };
        }
      }
```

When events are added, we set each added assignment's `eventId` to the `id` given to the event by the database.

Replace the `createOperation` function with the following lines of code:

```javascript
async function createOperation(added, table) {
  const results = await Promise.all(
    added.map(async (record) => {
      const {
        $PhantomId,
        exceptionDates,
        intervals,
        segments,
        ...data
      } = record;

      let insertData;
      if (table === "scheduler_events") {
        insertData = {
          ...data,
          exceptionDates: exceptionDates
            ? JSON.stringify(exceptionDates)
            : null,
          segments: segments ? JSON.stringify(segments) : null,
        };
      }
      if (table === "scheduler_dependencies") {
        insertData = {
          ...data,
          exceptionDates: exceptionDates
            ? JSON.stringify(exceptionDates)
            : null,
        };
      }
      if (table === "scheduler_calendars") {
        insertData = {
          ...data,
          intervals: intervals ? JSON.stringify(intervals) : null,
        };
      }
      if (
        table === "scheduler_resources" ||
        table === "scheduler_assignments"
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

We add the `intervals` and `segments` values to the variables extracted from the event record and convert any object 
values to JSON strings before inserting them into the database.

Replace the `updateOperation` function with the following lines of code:

```javascript
function updateOperation(updated, table) {
  return Promise.all(
    updated.map(
      ({
        id,
        exceptionDates,
        segments,
        intervals,
        ...data
      }) => {
        let insertData;
        if (table === "scheduler_events") {
          insertData = {
            ...data,
            exceptionDates: exceptionDates
              ? JSON.stringify(exceptionDates)
              : null,
            segments: segments ? JSON.stringify(segments) : null,
          };
        }
        if (table === "scheduler_dependencies") {
          insertData = {
            ...data,
            exceptionDates: exceptionDates
              ? JSON.stringify(exceptionDates)
              : null,
          };
        }
        if (table === "scheduler_calendars") {
          insertData = {
            ...data,
            intervals: intervals ? JSON.stringify(intervals) : null,
          };
        }
        if (
          table === "scheduler_resources" ||
          table === "scheduler_assignments"
        ) {
          insertData = data;
        }

        return db.query("UPDATE ?? set ? where id = ?", [
          table,
          insertData,
          id,
        ]);
      }
    )
  );
}
```

Our API endpoints are now ready for Bryntum Scheduler Pro to use.

## Update the client-side code

Now we'll update and set up the client-side code. Uninstall Bryntum Scheduler and install Bryntum Scheduler Pro by 
following [step 1](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/quick-start/javascript-npm#access-to-npm-registry) 
and [step 4](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/quick-start/javascript-npm#install-component) 
of the [vanilla JavaScript with npm set-up guide](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/quick-start/javascript-npm).

### Update the server to mount the Bryntum Scheduler Pro package directory

We need to make one more change to our server to mount the Bryntum Scheduler Pro package directory to the server 
configuration so that the server can handle the `./schedulerpro.css`, `./svalbard-light.css` and 
`./schedulerpro.module.js` paths that we'll use for Scheduler Pro imports.

In the `server.js` file, remove the following lines of code:

```javascript
app.use(
  express.static(path.join(__dirname, "/node_modules/@bryntum/scheduler"))
);
```

Replace them with the following lines of code:

```js
app.use(
  express.static(path.join(__dirname, "/node_modules/@bryntum/schedulerpro"))
);
```

### Update the HTML file

Now locate the following `link` tag in the `index.html` file:

```html
<link rel="stylesheet" href="./scheduler.css">
```

Replace it with the following `link` tag:

```html
<link rel="stylesheet" href="./schedulerpro.css">
```

### Convert the Scheduler component to a Scheduler Pro component

Delete the `eventModel.js` file in the `lib` folder. Create a file called `TaskWithCalendar.js` in the `lib` folder, and 
add the following lines of code to it:

```javascript
import {
  DateHelper,
  EventModel,
  StringHelper,
} from "../schedulerpro.module.js";

// A custom task class with a few extra fields
export default class TaskWithCalendar extends EventModel {
  static fields = [
    "patient",
    "confirmed",
    "requiredRole",
    // override field defaultValue to hours
    { name: "durationUnit", defaultValue: "h" },
  ];

  get firstCalendarInterval() {
    return this.calendar?.intervalStore.first;
  }

  get calendarInfo() {
    const { calendar, firstCalendarInterval } = this;

    if (firstCalendarInterval.isRecurrent()) {
      return StringHelper.encodeHtml(calendar.name);
    }
    return `${DateHelper.format(
      firstCalendarInterval.startDate,
      "MMM Do"
    )} - ${DateHelper.format(this.firstCalendarInterval.endDate, "MMM Do")}`;
  }
}

TaskWithCalendar.initClass();
```

This custom task class adds extra fields to the `EventModel` we'll use in the Scheduler Pro. We use the word task as an 
alias for event to better match the Bryntum Gantt naming conventions so that you can integrate Bryntum Scheduler Pro 
with Bryntum Gantt projects and visualize Gantt tasks in a powerful way (like in this 
[Bryntum Gantt with Scheduler Pro demo](https://bryntum.com/products/gantt/examples/gantt-schedulerpro)).

In the `main.js` file, replace the imports with the following:

```javascript
import TaskWithCalendar from "./lib/TaskWithCalendar.js";
import {
  DateHelper,
  SchedulerPro,
  StringHelper,
} from "./schedulerpro.module.js";
```

Make the `scheduler` variable a `SchedulerPro` instance:

```javascript
const scheduler = new SchedulerPro({
```

### Replace the Crud Manager with a project

Delete the `crudManager` variable and the `crudManager` property in the `scheduler` config. Replace the `crudManager` 
property with the following `project` property:

```javascript
  project: {
    calendar: "workweek",
    eventModelClass: TaskWithCalendar,
    // Configure urls used by the built-in CrudManager
    transport: {
      load: {
        url: "http://localhost:1337/load",
      },
      sync: {
        url: "http://localhost:1337/sync",
      },
    },
    autoLoad: true,
    autoSync: true,
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: true,
  },
```

We use the [`project`](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/model/ProjectModel) property instead of the `crudManager` property as the Scheduler Pro `project` has built-in 
[Crud Manager]( https://bryntum.com/products/schedulerpro/docs/api/Scheduler/crud/AbstractCrudManagerMixin) 
functionality. We recommend using the `project` property to sync data between Scheduler Pro and a backend.

### Add Scheduler Pro features

Add the following to the `features` property of the `scheduler`:

```javascript
    eventBuffer: true,
```

The [`eventBuffer`](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/feature/EventBuffer) feature allows us to show the travel time to and from a task, as defined by the `preamble` and 
`postamble` fields of a task.

Add the following feature property:

```javascript
    calendarHighlight: {
      calendar: "event",
      // This method should return the available resources for one or more events
      collectAvailableResources({ eventRecords }) {
        return getAvailableResources(eventRecords[0]);
      },
    },
```

The [`calendarHighlight`](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/feature/CalendarHighlight) 
feature allows us to visualize 
[calendars](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/CalendarModel) for an event or 
resource calendar (controlled by the [calendar](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/feature/CalendarHighlight#config-calendar) config). The calendars are highlighted when a user is creating, 
dragging, or resizing a task.

Define the `getAvailableResources` function at the top of the file:

```javascript
function getAvailableResources(eventRecord) {
  return scheduler.resourceStore.query(
    (resourceRecord) =>
      resourceRecord.role === eventRecord.requiredRole ||
      !eventRecord.requiredRole
  );
}
```

This function shows us available time slots for resources (health care workers in this case), where the resource role 
matches the event's required role. The possible roles in the example data are technician, nurse, or doctor.

Now add the following `eventDrag` feature property:

```javascript
    eventDrag: {
      // This method is used to validate drag-drop operations
      validatorFn({ eventRecords, newResource, startDate, endDate }) {
        const task = eventRecords[0],
          { calendar } = task,
          valid =
            (!calendar || calendar.isWorkingTime(startDate, endDate, true)) &&
            getAvailableResources(task).includes(newResource),
          message = valid ? "" : "No available slot";

        return {
          valid,
          message:
            (valid ? "" : '<i class="b-icon fa-exclamation-triangle"></i>') +
            message,
        };
      },
      // Affect snapping on drag, making events snap to the vertical center of each resource
      snapToPosition({ resourceRecord, eventRecord, snapTo }) {
        if (scheduler.snap) {
          const row = scheduler.getRowFor(resourceRecord);
          if (row) {
            const eventElement =
                scheduler.getElementFromEventRecord(eventRecord),
              eventHeight = eventElement.offsetHeight,
              rowCenter = row.top + row.height / 2,
              distanceFromCenter = Math.abs(
                snapTo.y + eventHeight / 2 - rowCenter
              );

            if (distanceFromCenter < 15) {
              snapTo.y = rowCenter - eventHeight / 2;
            }
          }
        }
      },
    },
```

The [`validatorFn`](https://bryntum.com/products/schedulerpro/docs/api/Scheduler/feature/EventDrag#config-validatorFn) function is called when a task is being edited using drag-and-drop functionality and after the 
drop is made. We use this function to validate the task's new position: It returns `true` if the new position is valid 
and `false` if not. If the new position is not valid, the drag-and-drop edit cannot be made.

In our example, the new position is valid if the start and end dates of the task being edited are within the working 
hours of the calendar. We use the [`isWorkingTime`](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/CalendarModel#function-isWorkingTime) function of the [CalendarModel](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/model/CalendarModel) to determine this. The 
`getAvailableResources` function determines if the event's required role matches the resource role.

Now add the following `listeners` config property below the `columns` config property:

```javascript
  listeners: {
    eventSelectionChange() {
      const { selectedEvents } = this,
        { calendarHighlight } = this.features;

      if (!calendarHighlight.disabled && selectedEvents.length > 0) {
        calendarHighlight.highlightEventCalendars(selectedEvents);
      } else {
        calendarHighlight.unhighlightCalendars();
      }
    },
  },
```

The `eventSelectionChange` function is used to highlight the available time slots in a resource when a task is selected.

Finally, replace the `eventEdit` config property with the following `taskEdit` property:

```javascript
   taskEdit: {
      items: {
        generalTab: {
          items: {
            resourcesField: {
              required: true,
            },
            patientField: {
              type: "text",
              name: "patient",
              label: "Patient",
              // Place after name field
              weight: 150,
              required: true,
            },
            requiredRoleField: {
              type: "combo",
              name: "requiredRole",
              label: "Required role",
              weight: 170,
              items: ["Doctor", "Nurse", "Technician"],
              labelCls: "label-text-wrap",
              required: true,
            },

            preambleField: {
              name: "preamble",
              label: "Travel to",
              unit: "h",
            },
            postambleField: {
              name: "postamble",
              label: "Travel from",
              unit: "h",
            },
            confirmedField: {
              type: "checkbox",
              name: "confirmed",
              label: "Appointment confirmed?",
              cls: "confirmedField",
              weight: 700,
            },
          },
        },
      },
    },
```

The Scheduler Pro task editor is a more feature-rich version of the Scheduler event editor. Here we customize the task
editor using the [`TaskEdit`](https://bryntum.com/products/schedulerpro/docs/api/SchedulerPro/feature/TaskEdit) feature.

## Test the migration implementation

Run the development server:

```shell
npm start
```

Open `http://localhost:1337/`, and you should see the migrated data from the Scheduler loaded into the Scheduler 
Pro:

<video controls width="100%">
<source src="Scheduler/migration-schedulerpro.mp4" type="video/mp4">
Sorry, your browser doesn't support embedded videos.
</video>

Note that the Scheduler Pro has extra features that the Scheduler did not have:

- Dependencies that affect scheduling.
- Advanced task editor.
- Highlighting of event calendar availability.
- Travel time to and from tasks.
- Splitting events.

You can see a full list of the extra features in our comparison article, [Scheduler vs. Scheduler Pro](https://bryntum.com/products/schedulerpro/scheduler-vs-schedulerpro/).


<p class="last-modified">Last modified on 2026-07-22 10:51:34</p>