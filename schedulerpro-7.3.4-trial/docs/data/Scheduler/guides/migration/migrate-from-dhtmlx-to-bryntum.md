# Migrate from DHTMLX Scheduler to Bryntum Scheduler

[Bryntum Scheduler](https://bryntum.com/products/scheduler/) and [DHTMLX Scheduler](https://dhtmlx.com/docs/products/dhtmlxScheduler/) are commercial project management tools for scheduling events. In this tutorial, we'll migrate an existing implementation of a DHTMLX Scheduler with a [Timeline view](https://docs.dhtmlx.com/scheduler/timeline_view.html) over to Bryntum Scheduler.

Here are the steps we'll follow:

- Migrate the database to the Bryntum Scheduler data structure.
- Update the server API endpoints.
- Update the library import and set up.
- Test the migration implementation.

## Getting started

We'll use an existing DHTMLX Scheduler starter project, which uses vanilla JavaScript on the client side and Node.js with REST API endpoints on the server side. These endpoints interact with a MySQL client to perform CRUD operations on the database. Your [implementation](https://docs.dhtmlx.com/scheduler/howtostart_guides.html) may differ slightly depending on which client-side and server-side ([React](https://dhtmlx.com/docs/products/dhtmlxScheduler-for-React/), [Vue](https://dhtmlx.com/docs/products/dhtmlxScheduler-for-Vuejs/), or [Angular](https://dhtmlx.com/docs/products/dhtmlxScheduler-for-Angular/)) variants you used.

<div class="note">

We'll use a <a href="https://github.com/bryntum/migrate-dhtmlx-scheduler-to-bryntum-starter">DHTMLX Scheduler starter</a> application as a starting point and describe how to migrate it to a Bryntum Scheduler. If you want to follow this guide exactly, please clone the <a href="https://github.com/bryntum/migrate-dhtmlx-scheduler-to-bryntum-starter">DHTMLX Scheduler starter repository</a>
first and install the application following the instructions in the repository's <code>README.md</code> file.

</div>

Following the migration, we expect the Bryntum Scheduler to display the same data as this DHTMLX Scheduler:

![DHTMLX Scheduler](data/Scheduler/images/migrate-from-dhtmlx/dhtmlx.png)

## Migrate the database to the Bryntum Scheduler data structure

To begin our migration, we'll migrate the existing database so that its data structure is suitable for a Bryntum Scheduler. To do that we'll make new tables for the Bryntum Scheduler and then import data from the existing tables made for DHTMLX to the new tables.

### Create database tables compatible with Bryntum Scheduler

If you followed the instructions in the starter repository `README.md` file, you will have configured your database already and populated it with some data.

The `dhtmlx_scheduler_events` table should look like this:

![dhtmlx_scheduler_events database table](data/Scheduler/images/migrate-from-dhtmlx/dhtmlx-events-db-table.png)

The `dhtmlx_scheduler_resources` table should look like this:

![dhtmlx_scheduler_resources database table](data/Scheduler/images/migrate-from-dhtmlx/dhtmlx-resources-db-table.png)

We will now create two separate tables with schema compatible with Bryntum Scheduler.

Run the following query to create the `bryntum_scheduler_resources` table for the resources data:

```sql
create TABLE `bryntum_scheduler_resources`
(
    `id`         int          NOT NULL AUTO_INCREMENT,
    `name`       varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
);
```

Create the `bryntum_scheduler_events` table using the following query:

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
    CONSTRAINT `fk_bryntum_scheduler_events_resourceId` FOREIGN KEY (`resourceId`) REFERENCES `bryntum_scheduler_resources` (`id`) ON DELETE CASCADE,
    INDEX (`resourceId`),
    PRIMARY KEY (`id`)
);
```

The Bryntum Scheduler has more features than the DHTMLX Scheduler, which is why there are so many columns in the table.

### Migrate the existing data from the DHTMLX tables into the new tables

Run the following query to insert the existing data from the `dhtmlx_scheduler_resources` table into the newly created `bryntum_scheduler_resources` table:

```sql
INSERT INTO `bryntum_scheduler_resources` (id, name)
SELECT resource_id, resource_name
FROM `dhtmlx_scheduler_resources`;
```

Next, run the following query to insert the existing data from the `dhtmlx_scheduler_events` table into the newly created `bryntum_scheduler_events` table:

```sql
INSERT INTO `bryntum_scheduler_events` 
    (id, name, resourceId, startDate, endDate)
SELECT 
    id, 
    text, 
    resource_id, 
    start_date, 
    end_date 
FROM `dhtmlx_scheduler_events`;
```

<div class="note">

Please note that Bryntum Scheduler has more data models out of the box than we just made (dependencies, assignments, time ranges, etc.). We didn't make tables for all of them here, to simplify the guide. To support other models on the database level please see the <code>sql/setup.sql</code> file included with the <a href="https://bryntum.com/download/?product=scheduler">Bryntum Scheduler crudManager demo</a>.

</div>

Now that the database is ready we can start updating the server-side code.

## Update the server API endpoints

We are going to create two new API route handlers on the server for querying `/load` and `/sync` paths. The first will read the data from the database and send it to the Bryntum Scheduler. The second path will be used to persist changes made on the client side to the database.

### Handling data loading requests

First, let's add a `/load` path API endpoint. In the `serverConfig` function of `server.js` file, add the following GET request handler which fetches the data from the database using the MySQL Node.js client:

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

As you can see in the code, the handler reads data from the `bryntum_scheduler_resources` and `bryntum_scheduler_events` tables and sends the data to the client as JSON.

<div class="note">

Please note that in case of an error, the code just sends the error message as-is to the client without any processing, which is acceptable for demo purposes but should be changed for production systems.

</div>

To check that the endpoint works, open the root folder of the project in the terminal and run:

```bash
npm start
```

Now if you open `http://localhost:1337/load` URL in a browser you should see the Bryntum Scheduler data in JSON format.

### Handling persisting changes

DHTMLX sends HTTP request data encoded in the URL, but Bryntum sends data to the server in a POST request body that uses JSON format. To support that, add the following JSON `bodyParser` below the line `app.use(bodyParser.urlencoded({ extended: true }));` in the `server.js` file:

```javascript
app.use(bodyParser.json());
```

DHTMLX uses separate HTTP methods for each of the CRUD operations. With Bryntum, except for the read operation, we use a single POST request and determine the method and operation based on the request object. Add the following HTTP POST `/sync` route that will be used to keep the data in the database in sync with the changes on the client-side UI:

```javascript
  app.post("sync", async function (req, res) {
    const { requestId, resources, events } = req.body;
    try {
      const response = { requestId, success: true };
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
        const rows = await applyTableChanges(
          "bryntum_scheduler_events",
          events
        );
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
        message: "There was an error syncing the data.",
      });
    }
  });
```

Define the `applyTableChanges` function at the bottom of the `server.js` file:

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
  // if we got some new data to update client
  return rows;
}
```

The client-side Bryntum library will make a POST request to the `/sync` endpoint when changes are made to keep the data in the database in sync with the client-side UI. The code we added will handle the incoming POST request and inspect the request body to determine which action should be taken on a particular data model. We first determine which data model to apply a sync request to and then inspect the type of operation to perform. In this case, we check if the sync request body object has a key called `resources` or `events` and then call the `applyTableChanges` function. In the `applyTableChanges` function we check if the change operation is an `added`, `updated`, or `removed` operation in which case we perform the relevant create, update, or delete query using the MySQL client.

Define the `createOperation` function at the bottom of `server.js`:

```javascript
function createOperation(added, table) {
  return Promise.all(
    added.map(async (record) => {
      const { $PhantomId, exceptionDates, ...data } = record;
      // insert record
      const [result] = await db.query("INSERT INTO ?? set ?", [
        table,
        table === "resources"
          ? data
          : {
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

<div class="note">

The <code>$PhantomId</code> is a phantom identifier. It's an auto-generated, unique client-side value that's used to identify a record. You shouldn't persist it on the server. You can read more about it in our <a href="https://bryntum.com/products/scheduler/docs/guide/Scheduler/data/crud_manager#saving-data">docs</a>.

</div>

Add the `deleteOperation` and `updateOperation`  functions to the bottom of the `server.js` file:

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
      return db.query("UPDATE ?? set ? where id = ?", [
        table,
        table === "resources"
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

We've now added the API endpoints needed for our Bryntum Scheduler.

## Update library import and set up

Now that the server-side part is ready, we'll update and set up the client-side code.

Install the Bryntum Scheduler by following [step 1](https://bryntum.com/products/scheduler/docs/guide/Scheduler/quick-start/javascript-npm#access-to-npm-registry) and [step 4](https://bryntum.com/products/scheduler/docs/guide/Scheduler/quick-start/javascript-npm#install-component) of the [vanilla JavaScript with npm setup guide](https://bryntum.com/products/scheduler/docs/guide/Scheduler/quick-start/javascript-npm).

Open the `index.html` file and find the `<script>`, `<link>`, and `<style>` tags used for the DHTMLX Scheduler. Comment them out along with all the `<div>` HTML elements within the `<body>` HTML element. Make sure to comment out even the parent `<div id="dhtmlx_scheduler" class="dhx_cal_container" style='width:100%; height:100%;'>` HTML element.  Add the following code inside the `<head>` tag to import the Bryntum Scheduler styles:

```html
<link rel="stylesheet" href="./scheduler.stockholm.css" data-bryntum-theme>
<style>
  html {
    font-size: 100%;
  }
  body {
    margin: 0;
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-family: Lato, "Open Sans", Helvetica, Arial, sans-serif;
    font-size: 0.875rem;
  }
</style>
```

Add the following `<script>` tag inside the `<head>` tag:

```html
    <script type="module" defer>
      import { Scheduler, CrudManager, DateHelper } from './scheduler.module.js';
      
      const crudManager = new CrudManager({
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
      });

      const scheduler = new Scheduler({
        appendTo: document.body,
        startDate: new Date(2024, 0, 8, 8),
        endDate: new Date(2024, 0, 8, 21),
        viewPreset: {
          base: "hourAndDay",
          tickWidth: 90,
          headers: [
            {
              unit: "day",
              dateFormat: " D MMM YYYY",
            },
            {
              unit: "hour",
              dateFormat: "LT",
            },
          ],
        },     
        crudManager,
        tbar: [
          {
            type: "widget",
            flex: 1,
          },
          {
            type: "datefield",
            ref: "dateField",
            width: 190,
            value: new Date(2024, 0, 8),
            editable: false,
            step: 1,
            onChange: "up.onDateFieldChange",
          },
        ],
        columns: [
          {
            type: "resourceInfo",
            text: "Name",
            width: 160,
            editor: false,
          },
        ],
        onDateFieldChange({ value, userAction }) {
          userAction &&
            scheduler.setTimeSpan(
              DateHelper.add(value, 8, "hour"),
              DateHelper.add(value, 20, "hour")
            );
        }
      });
    </script>
```

We've now imported the Bryntum Scheduler component from the library and set it up to load data from the `/load` endpoint on the initial load of the web page. We also specify that the `/sync` endpoint will be used when any create, update, or delete operation takes place to keep the client and database in sync.

Now we need to mount the Bryntum Scheduler package directory to the server configuration. This is needed so that the server can handle the `./scheduler.stockholm.css` and `./scheduler.module.js` paths added to `index.html`.

In the `server.js` file, add the following line below the `app.use(express.static(path.join(__dirname, "public")))` line:

```javascript
app.use(express.static(path.join(__dirname, '/node_modules/@bryntum/scheduler')));
```

## Test the migration implementation

Run the development server:

```bash
npm start
```

Open the following URL: `http://localhost:1337/`. You should see the migrated data from DHTMLX Scheduler loaded into the Bryntum Scheduler, ready to take your project management to the next level with an extremely feature-rich and highly customizable Scheduler:

![Bryntum Scheduler](data/Scheduler/images/migrate-from-dhtmlx/bryntum.png)


<p class="last-modified">Last modified on 2026-07-22 10:39:14</p>