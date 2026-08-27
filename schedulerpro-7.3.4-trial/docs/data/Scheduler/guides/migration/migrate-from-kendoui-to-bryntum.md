# Migrate from a Kendo UI for jQuery Scheduler to a Bryntum Scheduler

[Kendo UI](https://www.telerik.com/kendo-ui) is a commercial JavaScript component library for jQuery, Angular, React, 
and Vue. This guide shows you how to migrate from a [Kendo UI jQuery Scheduler](https://www.telerik.com/kendo-jquery-ui/scheduler) 
to a vanilla JavaScript [Bryntum Scheduler](https://bryntum.com/products/scheduler/).

We'll migrate an existing Kendo UI jQuery Scheduler Express application that uses a local SQLite database by doing the 
following:

- Creating database tables for the Bryntum Scheduler and migrating the Kendo UI Scheduler data to these new tables.
- Updating the backend API endpoints.
- Updating the client-side code to use Bryntum Scheduler.

## Getting started

We'll use an existing Kendo UI for jQuery Scheduler Express starter project. The 
[starter GitHub repository](https://github.com/bryntum/kendoui-scheduler-migration-bryntum-starter) has API endpoints 
for performing CRUD operations on a local SQLite database. The code for the migrated Bryntum Scheduler is in the 
[`completed-scheduler`](https://github.com/bryntum/kendoui-scheduler-migration-bryntum-starter/tree/completed-scheduler) 
branch of the starter GitHub repository.

After cloning the starter project, install the dependencies using the following command:

```sh
npm install
```

The Express server in the `server.js` file uses [Sequelize](https://sequelize.org/) as an ORM to perform CRUD 
operations on the database and model the data. Sequelize is configured to use a local SQLite database. The data models 
are in the `models` folder.

The code in the `addExampleData.js` file creates a local SQLite database and uses the data models and example 
appointments and resources JSON data in the `initialData` folder to populate the database.

Create and populate a local SQLite database by running the `addExampleData.js` Node.js script:

```sh
node addExampleData.js
```

Sequelize will log every SQL query it performs in your terminal. You can learn more about logging in the 
[Sequelize docs](https://sequelize.org/docs/v6/getting-started/#logging).

You may find the SQLite command-line tools useful when working with SQLite, as they allow you to enter and execute SQL 
statements from your terminal. These command-line tools should already be installed on your system if you use macOS. On 
other operating systems like Windows, you'll need to download the bundle of tools from the 
[SQLite download page](https://www.sqlite.org/download.html) and add the SQLite directory (the path with the `sqlite3` 
executable file) to your computer's [PATH system variable](https://www.java.com/en/download/help/path.html).

The Express app is configured to serve static files in the `public` folder. The `public` folder contains the client-side 
HTML, CSS, and JavaScript files for the Kendo UI jQuery Scheduler. The Scheduler makes fetch requests to the API 
endpoints to get data from the local SQLite database and sync data changes on the client to the database.

When the migration is complete, the Bryntum Scheduler will display the same data as the example Kendo UI Scheduler. Run `npm start` and visit `http://localhost:1337` to view.

![Kendo UI Scheduler](data/Scheduler/images/migrate-from-kendoui/kendoui-scheduler.png)

The Kendo UI Scheduler has resources, uses a [timeline view](https://demos.telerik.com/kendo-ui/scheduler/timeline-night), 
and the [appointments are grouped vertically by resource](https://demos.telerik.com/kendo-ui/scheduler/resources-grouping-vertical). 
This resembles the [Bryntum Scheduler](https://bryntum.com/products/scheduler/) layout. The Scheduler's 
[timeZone](https://docs.telerik.com/kendo-ui/api/javascript/ui/scheduler/configuration/timezone) is set to UTC.

## Migrate the database

First, we'll create new Sequelize models for the Bryntum Scheduler database tables. Then we'll migrate the example data 
in the Kendo UI Scheduler database tables into the Bryntum Scheduler database tables using a Node.js script.

### Create Sequelize database models compatible with Bryntum Scheduler

We'll create three Sequelize models for the Bryntum Scheduler:

- `BryntumResource`
- `BryntumEvent`
- `BryntumAssignment`

The Bryntum Scheduler assignments table links events to resources, allowing for 
[multiple assignments](https://bryntum.com/products/scheduler/examples/multiassign/).

Create a file called `BryntumResource.js` in the `models` folder and add the following lines of code to it:

```js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BryntumResource = sequelize.define(
    'BryntumResource',
    {
        id : {
            type          : DataTypes.INTEGER,
            primaryKey    : true,
            autoIncrement : true
        },
        name : {
            type      : DataTypes.STRING,
            allowNull : false
        },
        eventColor : {
            type         : DataTypes.STRING,
            defaultValue : null
        },
        readOnly : {
            type         : DataTypes.BOOLEAN,
            defaultValue : false
        },
        parentId : {
            type         : DataTypes.INTEGER,
            defaultValue : null,
            references   : {
                model : 'bryntum_resources',
                key   : 'id'
            },
            onDelete : 'CASCADE' // This will delete all child resources referencing the resource when it's deleted - 
            // if using tree store with a flat dataset: 
            // https://bryntum.com/products/scheduler/docs/guide/Scheduler/data/treedata#transforming-flat-data
        },
        index : {
            type         : DataTypes.INTEGER,
            defaultValue : null
        }
    },
    {
        tableName  : 'bryntum_resources',
        timestamps : false,
        indexes    : [
            {
                fields : ['index', 'parentId']
            }
        ]
    }
);

export default BryntumResource;
```

We use the [`define`](https://sequelize.org/api/v6/class/src/sequelize.js~Sequelize.html#instance-method-define) method 
of the Sequelize instance created in the `config/database.js` file to define the Bryntum Scheduler 
[`ResourceModel`](#Scheduler/model/ResourceModel). This model represents 
the `bryntum_resources` table in the database. The table name is set using the `tableName` property.

The model attributes define the columns for the database table. We set the 
[data types](https://sequelize.org/docs/v6/core-concepts/model-basics/#data-types) of the columns for each model 
attribute. We import the [`DataTypes`](https://github.com/sequelize/sequelize/blob/v6/src/data-types.js) object to use 
the built-in Sequelize data types.

The `parentId` model attribute is a foreign key that references the parent resource. The `parentId` can be set if the 
[tree feature](#Grid/feature/Tree) is enabled, which allows resources to 
have child resources. This feature is not enabled in this tutorial.

Create a file called `BryntumEvent.js` in the `models` folder and add the following lines of code to it:

```js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BryntumEvent = sequelize.define(
    'BryntumEvent',
    {
        id : {
            type          : DataTypes.INTEGER,
            primaryKey    : true,
            autoIncrement : true
        },
        name : {
            type      : DataTypes.STRING,
            allowNull : false
        },
        readOnly : {
            type         : DataTypes.BOOLEAN,
            defaultValue : false
        },
        timeZone : {
            type         : DataTypes.STRING,
            defaultValue : null
        },
        draggable : {
            type         : DataTypes.BOOLEAN,
            defaultValue : true
        },
        resizable : {
            type         : DataTypes.STRING,
            defaultValue : true
        },
        allDay : {
            type         : DataTypes.BOOLEAN,
            defaultValue : false
        },
        duration : {
            type         : DataTypes.INTEGER,
            defaultValue : null
        },
        durationUnit : {
            type         : DataTypes.STRING,
            defaultValue : 'day'
        },
        startDate : {
            type         : DataTypes.DATE,
            defaultValue : null
        },
        endDate : {
            type         : DataTypes.DATE,
            defaultValue : null
        },
        exceptionDates : {
            type         : DataTypes.STRING,
            defaultValue : null
        },
        recurrenceRule : {
            type         : DataTypes.STRING,
            defaultValue : null
        },
        cls : {
            type         : DataTypes.STRING,
            defaultValue : null
        },
        eventColor : {
            type         : DataTypes.STRING,
            defaultValue : null
        },
        eventStyle : {
            type         : DataTypes.STRING,
            defaultValue : null
        },
        iconCls : {
            type         : DataTypes.STRING,
            defaultValue : null
        },
        style : {
            type         : DataTypes.STRING,
            defaultValue : null
        }
    },
    {
        tableName  : 'bryntum_events',
        timestamps : false,
        indexes    : [
            {
                fields : ['startDate', 'endDate']
            }
        ]
    }
);

export default BryntumEvent;
```

The database table will be called `bryntum_events`.

Now create a file called `BryntumAssignment.js` in the `models` folder and add the following lines of code to it:

```js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BryntumAssignment = sequelize.define(
    'BryntumAssignment',
    {
        id : {
            type          : DataTypes.INTEGER,
            primaryKey    : true,
            autoIncrement : true
        },
        eventId : {
            type       : DataTypes.INTEGER,
            allowNull  : false,
            references : {
                model : 'bryntum_events',
                key   : 'id'
            },
            onDelete : 'CASCADE' // Ensures that deleting an 'event' will delete related 'assignments'
        },
        resourceId : {
            type       : DataTypes.INTEGER,
            allowNull  : false,
            references : {
                model : 'bryntum_resources',
                key   : 'id'
            },
            onDelete : 'CASCADE' // This will delete all assignments referencing the resource when it's deleted
        }
    },
    {
        tableName  : 'bryntum_assignments',
        timestamps : false,
        indexes    : [
            {
                fields : ['eventId']
            },
            {
                fields : ['resourceId']
            }
        ]
    }
);

export default BryntumAssignment;
```

The database table will be called `bryntum_assignments`. The `eventId` and `resourceId` columns are foreign keys that 
reference the `bryntum_events` and `bryntum_resources` tables, respectively.

In the `models/index.js` file, import the Bryntum Scheduler models and add them to the exported object:

```js
import KendoUIResource from './KendoUIResource.js';
import KendoUIAppointment from './KendoUIAppointment.js';
import BryntumAssignment from './BryntumAssignment.js';
import BryntumResource from './BryntumResource.js';
import BryntumEvent from './BryntumEvent.js';

export {
    KendoUIResource,
    KendoUIAppointment,
    BryntumAssignment,
    BryntumResource,
    BryntumEvent
};
```

All the models are exported from this file.

### Migrate the existing Kendo UI Scheduler data into the new tables

We'll now write a Node.js script to create the database tables for the Bryntum Scheduler data models and migrate the 
data from the Kendo UI Scheduler database tables to the Bryntum Scheduler database tables. You can also use the 
[Sequelize Command-Line Interface (CLI)](https://github.com/sequelize/cli) to run migrations, keep track of changes to 
the database, and revert changes if needed. You can read more about migrations in the Sequelize 
[migrations guide](https://sequelize.org/docs/v6/other-topics/migrations/). Note that Sequelize migrations use CommonJS, 
but will support using ES Modules in Sequelize version 7, which is currently in alpha. 

Create a file called `migrateData.js` in the root directory and add the following lines of code to it:

```js
import sequelize from './config/database.js';
import {
    KendoUIAppointment,
    KendoUIResource,
    BryntumResource,
    BryntumEvent,
    BryntumAssignment
} from './models/index.js';

async function setupDatabase() {
    // Wait for all models to synchronize with the database
    await sequelize.sync();

    // Now add example data
    await migrateExampleData();
}

async function migrateExampleData() {
    try {
        // Read the existing data
        const 
            kendoUIResourcesDataPromise = await KendoUIResource.findAll(),
            kendoUIAppointmentsDataPromise = await KendoUIAppointment.findAll(),
            [kendoUIResourcesData, kendoUIAppointmentsData] = await Promise.all([
                kendoUIResourcesDataPromise,
                kendoUIAppointmentsDataPromise
            ]);

        // transform data to match existing Bryntum data structure
        const 
            bryntumResourcesData = [],
            bryntumAssignmentsData = [],
            bryntumEventsData = [];

        let index = 0;
        for (const resource of kendoUIResourcesData) {
            const bryntumResource = {};
            bryntumResource.id = resource.value;
            bryntumResource.name = resource.text;
            bryntumResource.eventColor = resource.color;
            bryntumResource.index = index;
            bryntumResourcesData.push(bryntumResource);
            index++;
        }

        for (const appointment of kendoUIAppointmentsData) {
            const bryntumAssignment = {};
            const bryntumEvent = {};

            bryntumAssignment.eventId = appointment.meetingID;
            bryntumAssignment.resourceId = appointment.roomId;

            bryntumEvent.id = appointment.meetingID;
            bryntumEvent.name = appointment.title;
            bryntumEvent.startDate = appointment.start;
            bryntumEvent.endDate = appointment.end;
            bryntumEvent.timeZone = appointment.startTimezone;
            bryntumEvent.recurrenceRule = appointment.recurrenceRule;
            bryntumEvent.exceptionDates = appointment.recurrenceException;
            bryntumEvent.allDay = appointment.isAllDay;

            bryntumAssignmentsData.push(bryntumAssignment);
            bryntumEventsData.push(bryntumEvent);
        }

        // add transformed data to Bryntum database tables
        await sequelize.transaction(async(t) => {
            const resources = await BryntumResource.bulkCreate(bryntumResourcesData, {
                transaction : t
            });
            const events = await BryntumEvent.bulkCreate(bryntumEventsData, {
                transaction : t
            });
            const assignments = await BryntumAssignment.bulkCreate(
                bryntumAssignmentsData,
                {
                    transaction : t
                }
            );
            return { resources, assignments, events };
        });

        console.log('Resources, assignments, and events migrated successfully.');
    }
    catch (error) {
        console.error('Failed to migrate data due to an error: ', error);
    }
}

setupDatabase();
```

We use the Sequelize instance in the `config/database.js` file configured to connect to the local SQLite database. In 
the `setupDatabase()` function, we call the `sequelize.sync()` method to create the Bryntum Scheduler database tables 
from the Bryntum Scheduler data models.

To create the data to insert into the Bryntum Scheduler database tables, we first fetch the existing data from the 
Kendo UI tables. We loop through the data and populate the Bryntum Scheduler data record object properties with the 
corresponding properties of the Kendo UI data.

We use the Sequelize [`transaction`](https://sequelize.org/docs/v6/other-topics/transactions/) method to perform a 
[database transaction](https://en.wikipedia.org/wiki/Database_transaction). Within the transaction, the 
[`bulkCreate`](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#creating-in-bulk) method is used to 
create all the Bryntum Scheduler records for a table using a single database query.

Now run this migration Node.js script using the following command:

```sh
node migrateData.js
```

You should see the following logged to your terminal if the operation was successful:
```

Resources, assignments, and events migrated successfully.
```

## Set up the server side

We'll create two new API route handlers on the server: `/api/load` and `/api/sync`. The `/api/load` route will read the 
data from the database and send it to the Bryntum Scheduler. Changes on the client-side Bryntum Scheduler will be 
persisted to the database using the `/api/sync` route.

We'll use one API endpoint to sync client-side data changes in the Bryntum Scheduler to the database. We'll use the 
Bryntum Scheduler [Crud Manager](#Scheduler/guides/data/crud_manager.md) to 
handle the sync requests. When data changes in the Bryntum Scheduler, the Crud Manager combines changes from all 
data stores and makes a single HTTP POST request. This prevents data inconsistency problems that can occur when managing 
related data stores separately. The Kendo UI `/api/appointments/sync` API endpoint handles all appointment changes, but 
we would need another API endpoint if we wanted to persist changes to the Kendo UI resources data too. 

### Create the data-loading endpoint

To create an `/api/load` API endpoint, add the following GET request handler to the `server.js` file above the 
`// Start server` comment:

```js
app.get('/api/load', async(req, res) => {
    try {
        const 
            resourcesPromise = BryntumResource.findAll({
                order : [['index', 'ASC']]
            }),
            assignmentsPromise = BryntumAssignment.findAll(),
            eventsPromise = BryntumEvent.findAll(),
            [resources, assignments, events] = await Promise.all([
                resourcesPromise,
                assignmentsPromise,
                eventsPromise
            ]);

        res.send({
            resources   : { rows : resources },
            assignments : { rows : assignments },
            events      : { rows : events }
        })
        .status(200);
    }
    catch (error) {
        console.error({ error });
        res.send({
            success : false,
            message : 'There was an error loading the resources, assignments, and events data.'
        });
    }
});
```

We use the Sequelize [`findAll`](https://sequelize.org/docs/v6/core-concepts/model-querying-finders/#findall) method to 
retrieve all the records from the Bryntum Scheduler `resources`, `events`, and `assignments` data from the SQLite 
database. We then return the data using the 
[load response structure](#Scheduler/guides/data/crud_manager.md#load-response-structure) 
expected by the Bryntum Scheduler.

We also need to import the Sequelize models that we created:

```js
import {
    BryntumAssignment,
    BryntumEvent,
    BryntumResource
} from './models/index.js';
```

Now run the development server:

```sh
npm start
```

Open `http://localhost:1337/api/load` in your browser. You'll see a JSON object of the 
resources, events, and assignments data from the SQLite database:

```json
  "resources": {
    "rows": [
      {
        "id": 1,
        "name": "Meeting Room 1",
        "eventColor": "#1a237e",
        "readOnly": false,         
        // ...    
      }
    ]
  } 
```

We'll now create the sync API endpoint to keep data in the database in sync with data changes in the frontend UI.

### Create the changes-saving endpoint

Add the following `/api/sync` API POST request route definition to the bottom of the `server.js` file above the
`// Start server` comment:

```js
app.post('/api/sync', async function(req, res) {
    const { requestId, assignments, events, resources } = req.body;

    const eventMapping = {};

    try {
        const response = { requestId, success : true };

        if (resources) {
            const rows = await applyTableChanges('resources', resources);
            // if new data to update client
            if (rows) {
                response.resources = { rows };
            }
        }

        if (events) {
            const rows = await applyTableChanges('events', events);
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
            const rows = await applyTableChanges('assignments', assignments);
            if (rows) {
                response.assignments = { rows };
            }
        }
        res.send(response);
    }
    catch (error) {
        console.error({ error });
        res.send({
            requestId,
            success : false,
            message : 'There was an error syncing the data changes.'
        });
    }
});
```

The sync route handler function receives the data changes and the type of CRUD action to perform on the database from 
the request body and sends the data changes to the `applyTableChanges` helper function.

The `eventMapping` variable stores the IDs of created events. The `id` values are used to find the `eventId` value of 
the assignment added when an event is created.

Define the `applyTableChanges` helper function at the bottom of the `server.js` file:

```js
async function applyTableChanges(table, changes) {
    let rows;
    if (changes.added) {
        rows = await createOperation(changes.added, table);
    }
    if (changes.updated) {
        await updateOperation(changes.updated, table);
    }
    if (changes.removed) {
        await deleteOperation(changes.removed, table);
    }
    // if got some new data to update client
    return rows;
}
```

This helper function checks which type of CRUD operation should be performed and which database table it should be 
performed on, and then calls the relevant CRUD helper function. Let's create these CRUD helper functions.

Define the `createOperation` function at the bottom of the `server.js` file:

```js
function createOperation(added, table) {
    return Promise.all(
        added.map(async(record) => {
            const { $PhantomId, ...data } = record;
            let id;
            // Insert record into the table.rows array
            if (table === 'assignments') {
                const assignment = await BryntumAssignment.create(data);
                id = assignment.id;
            }
            if (table === 'events') {
                let { exceptionDates, ...eventData } = data;
                // if exceptionDates is an array, convert it to a comma-separated string
                if (Array.isArray(exceptionDates)) {
                    exceptionDates = exceptionDates.join(',');
                }
                const event = await BryntumEvent.create({
                    ...eventData,
                    exceptionDates
                });
                id = event.id;
            }
            if (table === 'resources') {
                // determine index number - add 1 to it
                const maxIndex = await BryntumResource.max('index');
                const resource = await BryntumResource.create({
                    ...data,
                    index : maxIndex + 1
                });
                id = resource.id;
            }
            // report to the client that we changed the record identifier
            return { $PhantomId, id };
        })
    );
}
```

We loop through the array of added records and call the Sequelize 
[`create()`](https://sequelize.org/docs/v6/core-concepts/model-instances/#a-very-useful-shortcut-the-create-method) 
method to add records, which are passed in as an argument, to the database table.

<div class="note">
The <code>$PhantomId</code> is a unique autogenerated client-side value used to identify a record. You shouldn't persist 
phantom identifiers in your database. We return the phantom identifier and the ID assigned by the database. The 
client-side Bryntum Scheduler will update the ID in the data store to use the ID assigned by the database. You can 
learn more about phantom identifiers in our 
<a href="#Scheduler/guides/data/crud_manager_in_depth.md#sync-request-structure">docs</a>.
</div>

Now, define the `deleteOperation` function below the `createOperation` function:

```js
function deleteOperation(deleted, table) {
    return Promise.all(
        deleted.map(async({ id }) => {
            if (table === 'assignments') {
                await BryntumAssignment.destroy({
                    where : {
                        id : id
                    }
                });
            }
            if (table === 'events') {
                await BryntumEvent.destroy({
                    where : {
                        id : id
                    }
                });
            }
            if (table === 'resources') {
                await BryntumResource.destroy({
                    where : {
                        id : id
                    }
                });
            }
        })
    );
}
```

We use the Sequelize [`destroy`](https://sequelize.org/docs/v6/core-concepts/model-instances/#deleting-an-instance) 
method to delete the database records.

Add the following `updateOperation` function below the `deleteOperation` function:

```js
function updateOperation(updated, table) {
    return Promise.all(
        updated.map(async({ id, ...data }) => {
            if (table === 'assignments') {
                await BryntumAssignment.update(data, { where : { id } });
            }
            if (table === 'events') {
                let { exceptionDates, ...eventData } = data;
                // if exceptionDates is an array, convert it to a comma-separated string
                if (Array.isArray(exceptionDates)) {
                    exceptionDates = exceptionDates.join(',');
                }
                await BryntumEvent.update(
                    { ...eventData, exceptionDates },
                    { where : { id } }
                );
            }
            if (table === 'resources') {
                await BryntumResource.update(data, { where : { id } });
            }
        })
    );
}
```

We use the Sequelize [`update`](https://sequelize.org/docs/v6/core-concepts/model-instances/#updating-an-instance) 
method to update the database records.

We now have the API endpoints needed to connect a Bryntum Scheduler with our SQLite database.

## Update the client-side code

We'll now update the static HTML, CSS, and JavaScript asset files to add the Bryntum Scheduler component to our app's 
frontend.

Install the Bryntum Scheduler component by following 
[step 3](#Scheduler/guides/quick-start/javascript-npm.md#access-to-npm-registry) 
and [step 5](#Scheduler/guides/quick-start/javascript-npm.md#install-component) 
of the [vanilla JavaScript with npm setup guide](#Scheduler/guides/quick-start/javascript-npm.md).

To use the Bryntum Scheduler component module code in the frontend, add the following line of code to the top of the 
`server.js` file, above the `app.use(express.json());` line:

```js
app.use(
    express.static(path.join(__dirname, '/node_modules/@bryntum/scheduler'))
);
```

Open the `public/index.html` file and add the following stylesheet and font to the `<head>`:

```html
    <link rel="stylesheet" href="./scheduler.stockholm.css" data-bryntum-theme>
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Poppins" />
```

This stylesheet is for the [Bryntum Scheduler Stockholm theme](#Scheduler/guides/customization/styling.md#using-a-theme) 
styles. You can delete the scripts and stylesheets for the Kendo UI Scheduler.

Replace the styles in the `public/style.css` file with the following:

```css
* {
  margin: 0;
  font-family: Poppins, "Open Sans", Helvetica, Arial, sans-serif;
}

#scheduler {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-size: 14px;
}
```

Replace the code in the `public/main.js` file with the following code:

```js
import { Scheduler, StringHelper } from './scheduler.module.js';

const scheduler = new Scheduler({
    appendTo                  : 'scheduler',
    startDate                 : new Date('2024/9/2 08:00 AM'),
    endDate                   : new Date('2024/9/3 08:00 PM'),
    workingTime               : null,
    zoomOnMouseWheel          : false,
    zoomOnTimeAxisDoubleClick : false,
    viewPreset                : {
        id      : 'myPreset', // Unique id value provided to recognize your view preset. Not required, but with it you 
                              // can simply set new view preset by id: scheduler.viewPreset = 'myPreset'
        name    : 'My view preset', // A human-readable name provided to be used in GUI, e.i. preset picker, etc.
        base    : 'hourAndDay', // Extends 'hourAndDay' view preset provided by PresetManager. You can pick out any of 
                              // PresetManager's view presets: PresetManager.records
        headers : [
            // Override headers
            {
                unit       : 'day',
                dateFormat : 'dddd, MMMM D, YYYY'
            },
            {
                unit       : 'hour',
                dateFormat : 'LT'
            }
        ]
    },
    timeZone              : 'UTC',
    enableRecurringEvents : true,

    crudManager : {
        loadUrl          : '/api/load',
        autoLoad         : true,
        syncUrl          : '/api/sync',
        autoSync         : true,
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },
    eventRenderer({ renderData, eventRecord }) {
        renderData.iconCls = eventRecord.isRecurring
            ? 'fa fa-sync'
            : eventRecord.isOccurrence
                ? 'fa fa-sync'
                : '';
        return StringHelper.xss`${eventRecord.name}`;
    },
    columns : [
        {
            text  : 'Name',
            field : 'name',
            width : 120
        }
    ],
    tbar : {
        items : {
            // Button to toggle working time on/off
            workingTimeBtn : {
                type        : 'button',
                text        : 'Use working time',
                color       : 'b-gray',
                icon        : 'fa fa-square',
                pressedIcon : 'fa fa-check-square',
                toggleable  : true,
                pressed     : false,
                style       : 'margin-bottom: .5em',
                onToggle({ pressed }) {
                    // Change the display, but keep the visual center the same to preserve user's context.
                    scheduler.preserveViewCenter(() => {
                        if (pressed) {
                            scheduler.workingTime = {
                                fromDay  : 1,
                                toDay    : 6,
                                fromHour : 8,
                                toHour   : 17
                            };
                        }
                        else {
                            scheduler.workingTime = null;
                        }
                    });
                }
            }
        }
    }
});
```

We create an instance of the Bryntum Scheduler and configure it to attach to the `<div>` element with an `id` 
of `"scheduler"`. The scheduler is configured to have a single column called "Name" and will use the UTC zone. 
There's a toggle button in the [toolbar](#Core/widget/Toolbar) that 
toggles displaying only the working days and hours by setting the 
[`workingTime`](#Scheduler/view/TimelineBase#property-workingTime) 
feature. Note that when using the `workingTime` feature, the 
[Zooming feature](#Scheduler/view/mixin/TimelineZoomable) is not 
supported. You should disable the zooming controls `zoomOnMouseWheel` and `zoomOnTimeAxisDoubleClick`.

The Bryntum Scheduler project has a [Crud Manager](#Scheduler/guides/data/crud_manager.md) 
that simplifies loading data from and syncing data changes to a server. It uses the 
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) as the transport system and JSON as the encoding 
format. We set the [`loadUrl`](#Scheduler/crud/AbstractCrudManagerMixin#config-loadUrl) 
and [`syncUrl`](#Scheduler/crud/AbstractCrudManagerMixin#config-syncUrl) 
to point to the Express API routes we created.

## Test the migration implementation

Run the development server:

```sh
npm start
```

Open `http://localhost:1337/`. You should see the migrated data from the Kendo UI Scheduler 
loaded into the Bryntum Scheduler:

![Bryntum Scheduler with CRUD functionality](data/Scheduler/images/migrate-from-kendoui/bryntum-scheduler.gif)

Changes you make to the Bryntum Scheduler will be persisted in the SQLite database. You can create an event by clicking 
and dragging in an empty row or right-clicking in an empty row and selecting "Add event" from the popup menu. You can 
edit or delete an event by right-clicking on it and selecting the appropriate list item from the popup.

You can also create, edit, delete, or copy a resource.



<p class="last-modified">Last modified on 2026-07-22 10:39:14</p>