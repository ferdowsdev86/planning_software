# Migrating from Mobiscroll Scheduler to Bryntum Scheduler

[Bryntum Scheduler](https://bryntum.com/products/scheduler/) and [Mobiscroll Scheduler](https://demo.mobiscroll.com/javascript/timeline) are JavaScript UI components used for managing complex schedules. Mobiscroll and Bryntum components can integrate with frontend frameworks like React, Angular, and Vue. 

In this tutorial, we'll migrate a full-stack Mobiscroll Scheduler app to Bryntum Scheduler.

We'll do the following:

- Migrate the database.
- Update the server API endpoints.
- Update the frontend library imports and setup.
- Test the migration implementation.

## Getting started

We'll use an existing full-stack Mobiscroll Scheduler app as a starting point. The frontend code uses vanilla JavaScript, and the backend server is an Express.js Node app. 

Note that the Mobiscroll Scheduler is a Mobiscroll Calendar with the view set to [timeline](https://demo.mobiscroll.com/javascript/timeline). This view resembles the Bryntum Scheduler UI. 

We'll store the scheduler data in a MySQL database. The backend server has REST API endpoints that will be used to perform CRUD operations on the database. You may need to adjust the migration steps, depending on your project setup. 

If you want to follow along with this guide, clone the [Mobiscroll Scheduler backend Node app repo](https://github.com/bryntum/mobiscroll-to-bryntum-scheduler-backend-starter) and follow the instructions in the `README.md` file to create a local MySQL database, add example data to it, and connect it to the backend Node app. The repo has a `completed-scheduler` branch containing the code for the completed migration.

## Migrate the database to the Bryntum Scheduler data structure

We'll first migrate the database tables to make the database compatible with Bryntum Scheduler data. We'll create tables for the Bryntum Scheduler resources and events and then migrate the existing data from the Mobiscroll Scheduler tables to the Bryntum Scheduler tables.  

### Create database tables compatible with Bryntum Scheduler

After following the instructions in the [Mobiscroll Scheduler backend Node app repo](https://github.com/bryntum/mobiscroll-to-bryntum-scheduler-backend-starter) README file, you'll have a `resources` table that looks like this:

![Mobiscroll resources data in MySQL database](data/Scheduler/images/migrate-from-mobiscroll/mobiscroll-resources-sql.png)

There are four events in the `events` table:

![Mobiscroll events data in MySQL database](data/Scheduler/images/migrate-from-mobiscroll/mobiscroll-events-sql.png)

We'll now create resources and events tables with schemas compatible with the Bryntum Scheduler. Run the following query to create a `bryntum_scheduler_resource` table for our resources data:

```sql
create TABLE `bryntum_scheduler_resources`
(
    `id`         int          NOT NULL AUTO_INCREMENT,
    `name`       varchar(255) NOT NULL,
    `eventColor` varchar(255) DEFAULT NULL,
    `readOnly`   boolean      DEFAULT FALSE,
    PRIMARY KEY (`id`)
) ENGINE = INNODB
  AUTO_INCREMENT = 1;
```

The table fields represent a resource in the Bryntum Scheduler [ResourceStore](https://bryntum.com/products/scheduler/docs/api/Scheduler/data/ResourceStore). Other less-commonly used fields are also available for the Bryntum Scheduler that we have omitted here for simplicity. Learn about the available fields in the [Bryntum docs](https://bryntum.com/products/scheduler/docs/api/Scheduler/model/ResourceModel#fields).

Now run the following query to create a `bryntum_scheduler_events` table to store our events data:

```sql
create TABLE `bryntum_scheduler_events`
(
    `id`             int          NOT NULL AUTO_INCREMENT,
    `name`           varchar(255) NOT NULL,
    `readOnly`       boolean               DEFAULT FALSE,
    `resourceId`     int                   DEFAULT NULL,
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
    CONSTRAINT `fk_events_resourceId` FOREIGN KEY (`resourceId`) REFERENCES `bryntum_scheduler_resources` (`id`) ON DELETE CASCADE,
    INDEX (`resourceId`),
    PRIMARY KEY (`id`)
) ENGINE = INNODB
  AUTO_INCREMENT = 1;
```

Fields in this table represent an event in the Bryntum Scheduler [EventStore](https://bryntum.com/products/scheduler/docs/api/Scheduler/data/EventStore). Again, we have omitted some available fields here, but you can find out more about EventStore fields in the [Bryntum docs](https://bryntum.com/products/scheduler/docs/api/Scheduler/model/EventModel#fields). A Bryntum Scheduler can also use additional stores like [AssignmentStore](https://bryntum.com/products/scheduler/docs/api/Scheduler/data/AssignmentStore) and [DependencyStore](https://bryntum.com/products/scheduler/docs/api/Scheduler/data/DependencyStore). 

The `resourceId` field is a foreign key that references the `id` field in the `bryntum_scheduler_resources` table.

### Migrate the existing data from the Mobiscroll tables into the new database tables

Run the following query to insert the existing data from the `resources` table into the newly created `bryntum_scheduler_resources` table:

```sql
INSERT INTO bryntum_scheduler_resources (`id`, `name`, `eventColor`)
SELECT `id`, `name`, `color` as `eventColor`
FROM resources;
```

Next, run the following query to insert the existing data from the `events` table into the newly created `bryntum_scheduler_events` table:

```sql
INSERT INTO bryntum_scheduler_events (
    `id`,
    `name`,
    `readOnly`,
    `resourceId`,
    `timeZone`,
    `draggable`,
    `resizable`,
    `allDay`,
    `startDate`,
    `endDate`,
    `recurrenceRule`,
    `cls`,
    `eventColor`
)
SELECT
    `id`,
    `title` as `name`,
    NOT `editable` as `readOnly`,
    `resource` as `resourceId`,
    `timezone` as `timeZone`,
    `dragInTime` as `draggable`,
    `resize` as `resizable`,
    `allDay`,
    `start` as `startDate`,
    `end` as `endDate`,
    CASE 
      WHEN JSON_VALID(`recurring`) THEN
        CONCAT(
          'RRULE:FREQ=', IFNULL(JSON_UNQUOTE(JSON_EXTRACT(`recurring`, '$.repeat')), ''),
          ';UNTIL=', IFNULL(REPLACE(JSON_UNQUOTE(JSON_EXTRACT(`recurring`, '$.until')), '-', ''), ''),
          ';COUNT=', IFNULL(JSON_UNQUOTE(JSON_EXTRACT(`recurring`, '$.count')), ''), 
          ';BYSETPOS=', IFNULL(JSON_UNQUOTE(JSON_EXTRACT(`recurring`, '$.pos')), ''),
          ';BYDAY=', IFNULL(JSON_UNQUOTE(JSON_EXTRACT(`recurring`, '$.weekDays')), ''),
          ';BYMONTH=', IFNULL(JSON_UNQUOTE(JSON_EXTRACT(`recurring`, '$.month')), ''),
          ';INTERVAL=', IFNULL(JSON_UNQUOTE(JSON_EXTRACT(`recurring`, '$.interval')), '')
        )
      ELSE
        `recurring`
    END as `recurrenceRule`,
    `cssClass` as `cls`,
    `color` as `eventColor`
FROM events;
```

The [`recurring` field for the Mobiscroll Scheduler](https://demo.mobiscroll.com/javascript/timeline/recurring-events#) can be an [RRULE string expression](https://datatracker.ietf.org/doc/html/rfc5545#section-3.3.10) or a JavaScript object, which is why it has a type of `json`. The Bryntum Scheduler `recurrenceRule` field can only be a RRULE string. The Mobiscroll Scheduler `recurring` field data is inserted into the `recurrenceRule` field for the Bryntum Scheduler data as it is if it's a string. If it's valid JSON, an RRULE string expression is constructed.

Now that our database is ready, let's update the server APIs.

## Update the server API endpoints

We'll use the Bryntum Scheduler [Crud Manager](https://bryntum.com/products/scheduler/docs/guide/Scheduler/data/crud_manager) on the frontend and two API endpoints, `/load` and `/sync`, on the backend to load data from our database and persist data changes. The Crud Manager combines changes from all data stores into a single HTTP request, which helps to keep the state of the data consistent between the frontend and backend. Updating stores individually can lead to data inconsistencies if an HTTP request fails for one update but succeeds for another.   

### Handling data loading requests

Let's first create the `/load` API endpoint to get the resources and events data from our database. Add the following GET request handler to the bottom of the `server.js` file:

```javascript
app.get("/load", async (req, res) => {
  try {
    const [[resources], [events]] = await Promise.all([
      db.query("SELECT * FROM bryntum_scheduler_resources"),
      db.query("SELECT * FROM bryntum_scheduler_events"),
    ]);
    res.send({
      success: true,
      resources: {
        rows: resources,
      },
      events: {
        rows: events,
      },
    });
  } catch (error) {
    console.error({ error });
    res.send({
      success: false,
      message: "There was an error loading the resources and events data.",
    });
  }
});
```

The structure used for a successful load response is the expected Bryntum Scheduler [load response structure](https://bryntum.com/products/scheduler/docs/guide/Scheduler/data/crud_manager#load-response-structure).

To check that the endpoint works, start the dev server:

```bash
npm run dev
```

Open the following URL in your browser: `http://localhost:1338/load`. You should see a JSON response with the resources and events data.

### Handling changes persisting

We'll create a single API endpoint to handle updates to the Bryntum Scheduler. The API route handler for the API endpoint will handle POST requests and determine the CRUD operation to perform based on the request body object. Add the following route handler that will be used to keep the data in the database in sync with the Bryntum Scheduler data on the frontend:

```javascript
app.post("/sync", async function (req, res) {
  const { requestId, resources, events } = req.body;
  try {
    const response = { requestId, success: true };
    if (resources) {
      const rows = await applyTableChanges("bryntum_scheduler_resources", resources);
      // if new data to update client
      if (rows) {
        response.resources = { rows };
      }
    }
    if (events) {
      const rows = await applyTableChanges("bryntum_scheduler_events", events);
      // if new data to update client
      if (rows) {
        response.events = { rows };
      }
    }
    res.send(response);
  } catch (error) {
    console.error({ error });
    res.send({
      requestId,
      success: false,
      message: 'There was an error syncing the data.'
    });
  }
});
```

The `/sync` API route handler gets the resources and events data to update from the POST request body. The sync request from the Bryntum Crud Manager on the frontend has a specific [structure](https://bryntum.com/products/scheduler/docs/guide/Scheduler/data/crud_manager#sync-request-structure). The data from the sync request is passed to the `applyTableChanges` function. Let's add this function to the bottom of the `server.js` file:

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
  // if we get new data to update client
  return rows;
}
```

The `applyTableChanges` function takes in the changes to the resources or events stores as an argument. For each change in the store, the sync request has three optional properties to indicate the type of change made: `added`, `updated`, and `removed`. If a property is present, it contains an array of records that have changed. Depending on the type of change on the frontend, a `create`, `delete`, or `update` operation function is called to make the create, update, or delete query to the MySQL database using the `mysql2` client. 

Add the following `createOperation` function at the bottom of the `server.js` file:

```javascript
function createOperation(added, table) {
  return Promise.all(
    added.map(async (record) => {
      const { $PhantomId, exceptionDates, ...data } = record;
      // insert record
      const [result] = await db.query("INSERT INTO ?? set ?", [
        table,
        table === "bryntum_scheduler_resources" ? data :
        {
          ...data,
          exceptionDates: JSON.stringify(exceptionDates),
        },
      ]);
      // report to the client that we changed the record identifier
      return { $PhantomId, id: result.insertId };
    })
  );
}
```

The `$phantomId` identifier is a unique, autogenerated client-side value to identify a record and should not be used as an ID on the server. The backend should assign a new ID to the record, and the `createOperation` function will return it.

Add the following `deleteOperation` function at the bottom of the `server.js` file:

```javascript
function deleteOperation(deleted, table) {
  return db.query(
    `DELETE FROM ${table} WHERE id in (?)`,
    deleted.map(({ id }) => id)
  );
}
```

Now add the following `updateOperation` function at the bottom of the `server.js` file:

```javascript
function updateOperation(updated, table) {
  return Promise.all(
    updated.map(({ id, exceptionDates, ...data }) => {
      return db.query("UPDATE ?? set ? where id = ?", [
        table,
        table === "bryntum_scheduler_resources"
          ? data
          : {
              ...data,
              exceptionDates: JSON.stringify(exceptionDates),
            },
        id,
      ]);
    })
  );
}
```

We now have API endpoints that are compatible with a Bryntum Scheduler. 

The Mobiscroll Scheduler API endpoints only update events, while the Bryntum Scheduler `/sync` API endpoint updates resources and events, making adding, updating, and deleting resources easy. You would need to custom build this functionality for Mobiscroll Scheduler.

## Update the frontend: Add the Bryntum Scheduler component 

Clone the [Mobiscroll Scheduler frontend app repo](https://github.com/bryntum/mobiscroll-to-bryntum-scheduler-frontend-starter). The repo has a `completed-scheduler` branch containing the code for the completed migration. The app uses [Vite](https://vitejs.dev/), a development server and JavaScript bundler. 

Install the dependencies by running the following command:

```bash
npm install
```

Next, we need to get the Mobiscroll Scheduler CSS and JavaScript files. Go to the [Mobiscroll](https://mobiscroll.com/) home page. Enter your email in the navigation input or at the bottom of the page to create a Mobiscroll account and start your free trial. Go to the [Mobiscroll download page](https://download.mobiscroll.com) and click on the "Event calendar & scheduling" card. Select "JavaScript" in the "Pick a framework" section. This will download a `mobiscroll.javascript.trial.zip` file to your computer. Unzip the file and copy the `css` and `js` folders to the root folder of your Mobiscroll frontend app. The Mobiscroll `css` and `js` files are imported into the app in the `index.html` file.

Now run the local development server:

```bash
npm run dev
```

You'll see four events in the Mobiscroll Scheduler: 

![Mobiscroll Scheduler](data/Scheduler/images/migrate-from-mobiscroll/mobiscroll-scheduler-ui.png)

You'll remember that the Mobiscroll Scheduler is a Mobiscroll Calendar with the view set to [timeline](https://demo.mobiscroll.com/javascript/timeline). 

Install the Bryntum Scheduler by following [step 1](https://bryntum.com/products/scheduler/docs/guide/Scheduler/quick-start/javascript-npm#access-to-npm-registry) and [step 4](https://bryntum.com/products/scheduler/docs/guide/Scheduler/quick-start/javascript-npm#install-component) of the [vanilla JavaScript with npm set-up guide](https://bryntum.com/products/scheduler/docs/guide/Scheduler/quick-start/javascript-npm).

Go to the `index.html` file and comment out the `<script>` and `<link>` tags for `mobiscroll`, `moment.js`, and `moment-timezone`. Comment out all of the HTML tags in the `<body>`, except for the `<script type="module" src="/main.js"></script>` tag.

In the `style.css` file, replace the `body` and `html` selector styles with the following:

```css
body,
html {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Poppins, "Open Sans", Helvetica, Arial, sans-serif;
  font-size: 14px;
}
```

In the `main.js` file, comment out all of the code and add the following lines of code:

```javascript
import { CrudManager, Scheduler } from "@bryntum/scheduler";
import "@bryntum/scheduler/scheduler.stockholm.css";
import "./style.css";

const crudManager = new CrudManager({
  transport: {
    load: {
      url: "http://localhost:1338/load",
    },
    sync: {
      url: "http://localhost:1338/sync",
    },
  },
  autoLoad: true,
  autoSync: true,
  // This config enables response validation and dumping of found errors to the browser console.
  // It's meant to be used as a helper during development stage, so please set it to false for production systems.
  validateResponse: true,
});

const scheduler = new Scheduler({
  appendTo: document.body,
  date: new Date(2023, 6, 25),
  viewPreset: "day",
  crudManager,
  columns: [
    {
      type: "resourceInfo",
      text: "Name",
      width: 160,
    },
  ],
});
```

We create a Bryntum Scheduler instance and attach it to the `<body>` tag. We configure the `crudManager` to load and sync data from our MySQL database using the `/load` and `/sync` API endpoints. The server uses the [`cors`](https://www.npmjs.com/package/cors) library in the `server.js` file to allow cross-origin resource sharing with our frontend app.

## Test the migration implementation

Run the local development server:

```bash
npm run dev
```

You should see the migrated data from the Mobiscroll Scheduler in your Bryntum Scheduler: 

![Bryntum Scheduler](data/Scheduler/images/migrate-from-mobiscroll/bryntum-scheduler-ui.png)

Changes you make to the Bryntum Scheduler will be persisted to your MySQL database. You can create an event by clicking and dragging in an empty row or right-clicking in an empty row and selecting "Add event" from the popup. You can edit or delete an event by right-clicking on it and selecting the appropriate list item from the popup.  
 
You can also edit or delete a resource. You would need to implement this manually for the Mobiscroll Scheduler.

## Bryntum Scheduler features

Bryntum Scheduler out-of-the-box features are more numerous than Mobiscroll Scheduler and are super-easy to customize to suit your project's needs. Browse our [Scheduler demos](https://bryntum.com/products/scheduler/examples/) to see how you can enhance your Bryntum Scheduler with [advanced filtering](https://bryntum.com/products/scheduler/examples/fieldfilters/), [multi assignment](https://bryntum.com/products/scheduler/examples/multiassign/), and [time selection](https://bryntum.com/products/scheduler/examples/time-selection/).

Let's take a closer look at some Bryntum Scheduler features now.

### Event editor

The built-in Bryntum Scheduler [event editor](https://bryntum.com/products/scheduler/docs/api/Scheduler/feature/EventEdit) is easy to configure and allows you to edit [recurring events](https://bryntum.com/products/scheduler/docs/api/Scheduler/view/mixin/RecurringEvents). To learn more, take a look at our blog post [Customizing the event editor for Bryntum Scheduler](https://bryntum.com/blog/customizing-the-event-editor-for-bryntum-scheduler/).

While you can also create an event editor for Mobiscroll Scheduler, you'll need to do it manually using HTML, CSS, and JavaScript. See the Mobiscroll [add/edit/delete events](https://demo.mobiscroll.com/javascript/timeline/create-read-update-delete-CRUD) example for more.

### Undo and redo support

All Bryntum Scheduling products, including Bryntum Scheduler, come with built-in [undo and redo](https://bryntum.com/products/scheduler/docs/api/Scheduler/widget/UndoRedo) functionality so that you can undo and redo changes to Scheduler data. The Mobiscroll Scheduler does not have undo and redo functionality.

### Export functionality

Bryntum Scheduler supports exporting your schedule as a PNG, PDF, Excel file, or `.ics` (calendar) file. You can use the calendar file to add Bryntum Scheduler events to Google Calendar, Microsoft Outlook, or Apple Calendar, or you can [connect and sync Bryntum Scheduler to Microsoft Teams](https://bryntum.com/blog/how-to-connect-and-sync-bryntum-calendar-to-a-microsoft-outlook-calendar/). Mobiscroll Scheduler has printing and PDF export.

### Event tooltip

With the Bryntum Scheduler [`eventTooltip`](https://bryntum.com/products/scheduler/docs/api/Scheduler/feature/EventTooltip) feature, you can add an event tooltip when an event bar is clicked on or hovered over and customize the tooltip with a range of easy configuration options. 

Implementing and customizing the Mobiscroll [custom event tooltip](https://demo.mobiscroll.com/javascript/timeline/custom-event-tooltip) requires a lot more code and effort

### Time ranges

Use the Bryntum Scheduler [TimeRanges](https://bryntum.com/products/scheduler/docs/api/Scheduler/feature/TimeRanges) feature to highlight time ranges with ease in day or week views. While you can highlight time ranges in a Mobiscroll Scheduler too (using the [`colors`](https://demo.mobiscroll.com/javascript/scheduler/colored-cell-background) config property), the Bryntum Scheduler TimeRanges feature has more configuration options and is easier to customize.

### Dependencies

Bryntum Scheduler allows you to draw [dependencies](https://bryntum.com/products/scheduler/docs/api/Scheduler/feature/Dependencies) between events as you can see in this [dependencies demo](https://bryntum.com/products/scheduler/examples/dependencies/). While Mobiscroll Scheduler also has an event dependencies feature called [event connections](https://demo.mobiscroll.com/javascript/timeline/connecting-linking-events-arrows), the Bryntum Scheduler dependencies feature is more flexible (allowing you to change dependencies in the UI, for example) and is easier to customize.


<p class="last-modified">Last modified on 2026-07-22 10:39:14</p>