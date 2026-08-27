
# Migrate from FullCalendar Scheduler to Bryntum Scheduler

This tutorial will walk you through the process of transferring your current scheduling tasks from [FullCalendar with a timeline view](https://fullcalendar.io/docs/timeline-view), which we'll refer to as FullCalendar Scheduler, to [Bryntum Scheduler](https://bryntum.com/products/scheduler/). Bryntum Scheduler is a commercial resource management tool with more built-in features and advanced customization options than FullCalendar Scheduler.

We'll take you through these steps to get your Bryntum Scheduler set up and move your data from a MySQL database used by FullCalendar Scheduler:

1. Installing and configuring Bryntum Scheduler.
2. Establishing API endpoints for the server.
3. Creating database tables that are compatible with Bryntum Scheduler.
4. Testing the migration process.

## Getting started

To demonstrate the process of migrating to Bryntum Scheduler, we'll use an existing starter project for FullCalendar Scheduler that uses JavaScript on the client side and Node.js with REST API endpoints on the server side. Depending on your implementation and the client-side technology you use (such as [React](https://fullcalendar.io/docs/react) or [Angular](https://fullcalendar.io/docs/angular)), your code may differ slightly from ours.

If you prefer to follow along with our starter project instead of updating your own project code, you can clone the [FullCalendar Scheduler starter GitHub repository](https://github.com/bryntum/fullcalendar-scheduler-starter). Please refer to the `README.md` file for instructions on setting up the starter project.

Once you have completed the migration process, Bryntum Scheduler should display the same data as the original FullCalendar Scheduler app.

![FullCalendar Scheduler](data/Scheduler/images/migrate-from-fullcalendar/fullcalendar-scheduler.png)



## Install and set up Bryntum Scheduler

We will create a new folder for our Bryntum Scheduler project.

In the root directory of your project, run the following command to make the files necessary for the Bryntum Scheduler:

```shell
mkdir -p BryntumScheduler/public && touch BryntumScheduler/{server.js,package.json,.env} BryntumScheduler/public/{index.html,main.js,main.css} && cd BryntumScheduler
```

Populate the `.env` file with the same contents as the `.env` you created for the FullCalendar Scheduler app. It should look something like this:

```shell
DB_HOST='localhost'
DB_USER='root'
DB_PASSWORD='<your-password>'
DB_DATABASE='<your-database>'
PORT=3000
```

Next, populate the `package.json` file we just created with the following:

```json
{
  "name": "bryntumscheduler",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "nodemon server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "mysql2": "^3.6.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

Run `npm install` to install the appropriate packages for the project.

## Set up the client side

Install Bryntum Scheduler by following [step 1](https://bryntum.com/products/scheduler/docs/guide/Scheduler/quick-start/javascript-npm#access-to-npm-registry) and [step 4](https://bryntum.com/products/scheduler/docs/guide/Scheduler/quick-start/javascript-npm#install-component) of the [vanilla JavaScript with npm set-up guide](https://bryntum.com/products/scheduler/docs/guide/Scheduler/quick-start/javascript-npm).

Open the `index.html` file and add the following code to link to the Bryntum stylesheets and give our scheduler some additional styling:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bryntum Scheduler with MySQL</title>
    <link rel="stylesheet" href="./scheduler.stockholm.css" id="bryntum-theme" />
    <link rel="stylesheet" href="main.css" />
  </head>
  <body>
    <script type="module" src="main.js"></script>
  </body>
</html>
```

Next, we will style the Bryntum Scheduler component. Add the following code inside `main.css`:

```css
body,
html {
  margin: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Poppins, 'Open Sans', Helvetica, Arial, sans-serif;
  font-size: 14px;
}
```

Now we will set up the Bryntum Scheduler component. Add the following code to `main.js`:

```javascript
import { Scheduler } from "./scheduler.module.js";

const scheduler = new Scheduler({
  appendTo: document.body,
  date: new Date(2023, 11, 4, 8),
  viewPreset: "hourAndDay",
  crudManager: {
    autoLoad: true,
    autoSync: true,
    transport: {
      load: {
        url: "http://localhost:3000/api/events",
      },
      sync: {
        url: "http://localhost:3000/api/events",
      },
    },
  },
  columns: [
    {
      type: "resourceInfo",
      text: "Workers",
      width: 160,
      editor: false,
    },
  ],
});
```

We have now imported the Bryntum Scheduler component from the library and set it up to load data from the `/api/events` endpoint on the initial load of the webpage, which will be served on port `3000`. We also specify that the `/api/events` endpoint will be used when any create, update, or delete operation takes place to keep the client and database in sync.

## Set up the server side

Import the relevant libraries by adding the following lines to the top of the `server.js` file in the `BryntumScheduler` folder:

```javascript
import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

Now set up the Express app and database connection by adding the following code to `server.js`:

```javascript
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use(
  express.static(path.join(__dirname, "/node_modules/@bryntum/scheduler"))
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
```

## Set up the server API endpoints

The client-side Bryntum library will make a POST request to the `/api/events` endpoint when changes are made to keep the data in the database in sync with the client-side UI.

Add the following HTTP POST request to the bottom of `server.js`:

```javascript
// Add, update, and remove events
app.post('/api/events', async (req, res) => {
  const { added, updated, removed } = req.body.events;

  try {
    const addedResponse = added ? await addEvents(added) : [];
    const updatedResponse = updated ? await updateEvents(updated) : [];
    const removedResponse = removed ? await removeEvents(removed) : [];

    res.send({
      success: true,
      events: {
        rows: [...addedResponse, ...updatedResponse, ...removedResponse],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false });
  }
});
```

This code defines an Express.js route handler for POST requests to the `/api/events` endpoint. It handles adding, updating, and removing events based on the request body. The `added`, `updated`, and `removed` properties are destructured from `req.body.events`. A try-catch block is used to handle errors during database operations.

In the try block, `addEvents`, `updateEvents`, and `removeEvents` functions are conditionally called based on the presence of the respective properties. The results of these functions are then combined using the spread operator. If successful, the response sent to the client contains a success status and an `events` object with the combined results of the operations.

Define the `addEvents` function at the bottom of `server.js`:

```javascript
// Helper functions
async function addEvents(events) {
  const query =
    'INSERT INTO fullcalendar_scheduler_events (name, startDate, endDate, duration, durationUnit, resourceId, allDay) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const addedResponse = [];

  for (const event of events) {
    const {
      name,
      startDate,
      endDate,
      duration,
      durationUnit,
      resourceId,
      allDay,
    } = event;
    const [result] = await pool
      .promise()
      .query(query, [
        name,
        startDate,
        endDate,
        duration,
        durationUnit,
        resourceId,
        allDay,
      ]);
    addedResponse.push({
      id: result.insertId.toString(),
      $PhantomId: event.$PhantomId,
    });
  }

  return addedResponse;
}
```

The `addEvents` function inserts an array of events into the database. For each event, it extracts relevant properties, runs a SQL INSERT query, and stores the generated IDs in an array. The function returns this array after processing all events.

Define the `updateEvents` and `removeEvents` functions at the bottom of `server.js`:

```javascript
async function updateEvents(events) {
  const updatedResponse = [];
  for (const event of events) {
    const id = await updateEvent(event);
    updatedResponse.push({ id });
  }
  return updatedResponse;
}
```

```javascript
async function removeEvents(events) {
  const query = "DELETE FROM fullcalendar_scheduler_events WHERE id = ?";
  for (const event of events) {
    await pool.promise().query(query, [event.id]);
  }

  return [];
}
```

The `updateEvents` function updates an array of events and returns an array of updated IDs. It iterates through the input events, calls the `updateEvent` function for each event, and pushes the returned ID into the `updatedResponse` array. Once all events are processed, the function returns the `updatedResponse` array.

The `removeEvents` function deletes events from the database. It takes an array of events and iterates through them, executing a SQL DELETE query for each event. It returns an empty array.

Next, define the `updateEvent` function:

```javascript
async function updateEvent(event) {
  const {
    id,
    name,
    startDate,
    endDate,
    resourceId,
    allDay,
    recurrenceRule,
    duration,
  } = event;
  const updates = [];
  const values = [];

  // Add values and updates for each field
  if (name !== undefined) {
    updates.push("name = ?");
    values.push(name);
  }
  if (startDate !== undefined) {
    updates.push("startDate = ?");
    values.push(startDate);
  }
  if (endDate !== undefined) {
    updates.push("endDate = ?");
    values.push(endDate);
  }
  if (duration !== undefined) {
    updates.push("duration = ?");
    values.push(duration);
  }
  if (resourceId !== undefined) {
    updates.push("resourceId = ?");
    values.push(resourceId);
  }
  if (allDay !== undefined) {
    updates.push("allDay = ?");
    values.push(allDay);
  }
  if (recurrenceRule !== undefined) {
    updates.push("recurrenceRule = ?");
    values.push(recurrenceRule);
  }

  if (updates.length === 0) {
    throw new Error("No valid fields to update.");
  } else {
    const query = `UPDATE fullcalendar_scheduler_events SET ${updates.join(
      ", "
    )} WHERE id = ?`;
    values.push(id);

    await pool.promise().query(query, values);
    return id;
  }
}
```

The `updateEvent` function updates a single event. It extracts relevant properties from the input event and creates an array of updates and values for each field. It then checks if any valid fields are available to update, throws an error if not, and otherwise executes a SQL UPDATE query using the `pool.promise().query()` method. It then returns the event.

Next, add the following HTTP GET request underneath the `/api/events` POST route:

```javascript
// Get events and resources
app.get("/api/events", async (req, res) => {
  try {
    const [eventsResults] = await pool
      .promise()
      .query("SELECT * FROM fullcalendar_scheduler_events");
    const [resourcesResults] = await pool
      .promise()
      .query("SELECT * FROM fullcalendar_scheduler_resources");

    const events = eventsResults.map((event) => ({
      ...event,
      id: event.id.toString(),
    }));
    const resources = resourcesResults.map((resource) => ({
      ...resource,
      id: resource.id.toString(),
    }));

    res.send({
      success: true,
      events: { rows: events },
      resources: { rows: resources },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false });
  }
});
```

This is the endpoint to fetch and read the data from our database. The Bryntum Scheduler [Crud Manager](https://bryntum.com/products/scheduler/docs/api/Scheduler/data/CrudManager) will call this endpoint to keep the client side up to date with our datastore.

### Create database tables compatible with Bryntum Scheduler

Run the following query to alter the `fullcalendar_scheduler_events` table for our Bryntum Scheduler events data to make it compatible with the Bryntum Scheduler implementation:

```sql
ALTER TABLE fullcalendar_scheduler_events
ADD (
  duration DECIMAL(10, 2),
  durationUnit VARCHAR(10),
  cls VARCHAR(255),
  exceptionDates TEXT,
  allDay TINYINT(1),
  recurrenceRule TEXT
);
```

Rename the `start`, `end`, and `title` columns:

```sql
ALTER TABLE fullcalendar_scheduler_events
RENAME COLUMN start TO startDate,
RENAME COLUMN end TO endDate,
RENAME COLUMN title TO name;
```

We'll now update some columns in the table:

```sql
UPDATE fullcalendar_scheduler_events
SET
  duration = TIMESTAMPDIFF(HOUR, startDate, endDate),
  durationUnit = 'hour',
  cls = '',
  exceptionDates = NULL,
  allDay = 0,
  recurrenceRule = NULL
where id
```

We'll now alter the `fullcalendar_scheduler_resources` table to make it compatible with the Bryntum Scheduler implementation.
Run the following query to update the `fullcalendar_scheduler_resources` table:

```sql
ALTER TABLE fullcalendar_scheduler_resources
RENAME COLUMN title TO name,
RENAME COLUMN eventBackgroundColor TO eventColor;
```

### Test the migration implementation

Start the development server:

```bash
npm run start
```

The Bryntum Scheduler should display the migrated data from the FullCalendar Scheduler.

![Bryntum Scheduler](data/Scheduler/images/migrate-from-fullcalendar/bryntum-scheduler.png)

You have now successfully migrated your FullCalendar Scheduler to Bryntum. Note that you can double-click on events to edit them, unlike the FullCalendar Scheduler. You can change the timeline range by right-clicking on one of the date or time headings at the top of the scheduler and adjusting the zoom. You can also hold the Windows **Ctrl key** or macOS **⌘ key** while your cursor is over the timeline and use your mouse wheel to change the zoom.

## Bryntum Scheduler features

FullCalendar Scheduler has basic features such as event drag-and-drop editing, event resizing, background highlighting, theming, locales, and different views. Bryntum Scheduler offers all of these features and more. Let's look at some of the features that Bryntum Scheduler offers that FullCalendar Scheduler does not.

## Event editor

Bryntum Scheduler has a built-in, easily configurable [event editor](https://bryntum.com/products/scheduler/docs/api/Scheduler/feature/EventEdit) that you can use to edit [recurring events](https://bryntum.com/products/scheduler/docs/api/Scheduler/view/mixin/RecurringEvents). To learn more, take a look at our blog post [Customizing the event editor for Bryntum Scheduler](https://bryntum.com/blog/customizing-the-event-editor-for-bryntum-scheduler/).

## Undo and redo support

All Bryntum Scheduling products, including Bryntum Scheduler, come with built-in [undo and redo](https://bryntum.com/products/scheduler/docs/api/Scheduler/widget/UndoRedo) functionality so that you can undo and redo changes to the scheduler data. See this [undo/redo demo](https://bryntum.com/products/scheduler/examples/undoredo/) for more.

### Export functionality

Export your Bryntum Scheduler as a PNG, PDF, Excel file, or calendar (`.ics`) file. Use the calendar file to add your Scheduler events to Google Calendar, Microsoft Outlook, or Apple Calendar, or [connect and sync Bryntum Scheduler to Microsoft Teams](https://bryntum.com/blog/how-to-connect-and-sync-bryntum-calendar-to-a-microsoft-outlook-calendar/).

### Event tooltip

Use the Bryntum Scheduler [`eventTooltip`](https://bryntum.com/products/scheduler/docs/api/Scheduler/feature/EventTooltip) feature to add an event tooltip when an event bar is clicked on or hovered over. Easily customize the tooltip with a selection of configuration options.

### Time ranges

With the Bryntum Scheduler [TimeRanges](https://bryntum.com/products/scheduler/docs/api/Scheduler/feature/TimeRanges) feature, you can highlight time ranges in day and week views with ease. While you can highlight time ranges with the FullCalendar Scheduler [background events](https://fullcalendar.io/docs/background-events) feature, this functionality is limited compared to the Bryntum Scheduler TimeRanges feature.

### Dependencies

Bryntum Scheduler allows you to draw [dependencies](https://bryntum.com/products/scheduler/docs/api/Scheduler/feature/Dependencies) between events as you can see in this [dependencies demo](https://bryntum.com/products/scheduler/examples/dependencies/).

Features offered by Bryntum Scheduler that are not available in FullCalendar Scheduler include:

- Event filtering
- Configurable time scales
- Column sorting
- Cell editing
- Summary rows
- Multiple assignment of events
- Infinite timeline scrolling
- Handling large datasets
- Animated UI updates


<p class="last-modified">Last modified on 2026-07-22 10:39:14</p>