# How to use Bryntum Scheduler with Express and SQLite

Bryntum Scheduler is a feature-rich JavaScript component that integrates with any backend technology. 

This guide will show you how to use [Express](https://expressjs.com/) to manage communication with 
a [SQLite](https://www.sqlite.org/) database. We'll use the open-source [Sequelize ORM](https://sequelize.org/) 
to generate database queries.

We'll do the following:

- Clone the starter GitHub repository for this guide. The starter code will contain JSON example data 
and code for an Express server.
- Create Sequelize models to define the structure of database tables.
- Create a Node.js seed script to populate the database with example JSON data.
- Create API endpoints to load data and sync data changes to the database.
- Create a Bryntum Scheduler frontend using statically served HTML, CSS, and JavaScript files.
- Configure the Bryntum Scheduler to load data from the database and synchronize changes to the database 
using the created API endpoints.

We'll build this application:

![Bryntum Scheduler app](data/Scheduler/images/integration/backends/express/complete-app-cover.png)

## Prerequisites

To follow along, you need [Node.js](https://nodejs.org/en/download) installed on your system. 

## Getting Started

We'll use an existing Express.js project as a starting point. 
Clone the [Express.js starter repository](https://github.com/bryntum/bryntum-scheduler-express-sqlite-starter). 
The completed code of this guide is on the `complete-app` branch.

The starter code has the following directory structure:

- `initialData`: Contains data to be added to the Bryntum Scheduler. There are JSON files for events, 
resources (team members), event dependencies, and assignments of resources to events. 
- `public`: We'll add the static HTML, CSS, and JavaScript files to this folder to make the Bryntum Scheduler frontend.
- `server.js`: This file sets up and starts an Express server and serves the files from the `public` directory. 

Install the dependencies using the following command:

```bash
npm install
```

Start the project by running the following command in the root directory of the project:

```bash
npm start
```

You'll see the following message in your terminal:
```

Server listening on port 1337
```

## Install Sequelize ORM

We'll use [Sequelize](https://sequelize.org/), which is a Node.js ORM, to create a SQLite database, connect to it, and 
perform CRUD 
operations. We'll also use Sequelize to model the Bryntum Scheduler data. A 
Sequelize [model](https://sequelize.org/docs/v6/core-concepts/model-basics/) is an 
abstraction that represents a table in your database.

Install Sequelize and the driver for SQLite using the following command:

```bash
npm install sequelize sqlite3
```

Sequelize supports [multiple databases](https://sequelize.org/releases/), so you need to manually install the database 
driver for the database 
that you use. The database driver is the code Sequelize uses to communicate with the database. 

We'll now create a Sequelize instance so that we can create and connect to a SQLite database.

Create a `config` folder in the `root` directory and a `database.js` file inside it. Add the following lines of 
code to the new file:

```javascript
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
    dialect : 'sqlite',
    storage : './database.sqlite3'
});

export default sequelize;
```

We instantiate Sequelize with an options object passed into 
the [constructor](https://sequelize.org/api/v6/class/src/sequelize.js~sequelize#instance-constructor-constructor). 
We set the type of database 
we'll connect to and the SQLite-only `storage` property. The database file will be named `database.sqlite3` and 
stored in the root directory.

## Create the data models

When using Sequelize, creating a [model](https://sequelize.org/docs/v6/core-concepts/model-basics/) is essential. 
A model is an abstraction that represents a table in your 
database. The model sets the name of the table in the database, the columns it has, and the data types of the columns. 

We'll define models for the events, resources, dependencies, and assignments example data. In Bryntum Scheduler, 
data stores are kept and linked together 
in the [project](#Scheduler/model/ProjectModel). 
The data stores usually used by the 
Bryntum Scheduler include the following stores:  

- [EventStore](#Scheduler/data/EventStore)
- [ResourceStore](#Scheduler/data/ResourceStore)
- [AssignmentStore](#Scheduler/data/AssignmentStore)
- [DependencyStore](#Scheduler/data/DependencyStore)
- [TimeRangeStore](#Scheduler/data/TimeRangeStore)
- [ResourceTimeRangeStore](#Scheduler/data/ResourceTimeRangeStore)

This tutorial won't cover making models for all the data store types. 

To support other models on the database level, please see the `setup.sql` file in the `/examples/crudmanager/sql` 
folder included with the Bryntum Scheduler `crudmanager` demo code. You can access the demo code by 
downloading our [free trial](https://bryntum.com/download/?product=scheduler) or by logging into 
the [Bryntum Customer Zone](https://customerzone.bryntum.com/login) if you've purchased a 
license for the Bryntum Scheduler

### Create the `Event` model

Create a folder called `models` in the root directory. Create a file called `Event.js` in this folder and 
add the following lines of code to it:

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Event = sequelize.define(
    'Event',
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
        children : {
            type         : DataTypes.STRING,
            defaultValue : null
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
            type         : DataTypes.JSON,
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
        tableName  : 'events',
        timestamps : false
    }
);

export default Event;
```

We define the `Event` model using 
the [`define`](https://sequelize.org/api/v6/class/src/sequelize.js~Sequelize.html#instance-method-define) 
method of the Sequelize instance that we created in 
the `config/database.js` file. This model represents the table called "events" in the database. 
The table name is set using the `tableName` property. 

The model attributes define the columns for the database table. We set 
the [data types](https://sequelize.org/docs/v6/core-concepts/model-basics/#data-types) of the columns 
for each model attribute, and import 
the [`DataTypes`](https://github.com/sequelize/sequelize/blob/v6/src/data-types.js) object to use the built-in 
Sequelize data types.

### Create the `Dependency` model

Create a file called `Dependency.js` in the `models` directory and add the following lines of code to it:

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Dependency = sequelize.define(
    'Dependency',
    {
        id : {
            type          : DataTypes.INTEGER,
            primaryKey    : true,
            autoIncrement : true
        },
        from : {
            type         : DataTypes.INTEGER,
            defaultValue : null,
            references   : {
                model : 'events',
                key   : 'id'
            },
            onDelete : 'CASCADE' // Ensures that deleting an 'event' will delete related 'dependencies'
        },
        to : {
            type         : DataTypes.INTEGER,
            defaultValue : null,
            references   : {
                model : 'events',
                key   : 'id'
            },
            onDelete : 'CASCADE'
        },
        fromSide : {
            type         : DataTypes.STRING,
            defaultValue : 'right',
            validate     : {
                isIn : [['top', 'left', 'bottom', 'right', 'start', 'end']]
            }
        },
        toSide : {
            type         : DataTypes.STRING,
            defaultValue : 'left',
            validate     : {
                isIn : [['top', 'left', 'bottom', 'right', 'start', 'end']]
            }
        },
        cls : {
            type      : DataTypes.STRING,
            allowNull : true
        },
        lag : {
            type         : DataTypes.FLOAT,
            defaultValue : 0
        },
        lagUnit : {
            type         : DataTypes.STRING,
            defaultValue : 'day'
        }
    },
    {
        tableName  : 'dependencies',
        timestamps : false,
        indexes    : [
            {
                fields : ['from']
            },
            {
                fields : ['to']
            }
        ]
    }
);

export default Dependency;
```

This database table will be called "dependencies". The "from" and "to" columns are foreign keys that reference
the "events" table. 

### Create the `Resource` model

Create a file called `Resource.js` in the `models` directory and add the following lines of code to it:

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Resource = sequelize.define(
    'Resource',
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
        }
    },
    {
        tableName  : 'resources',
        timestamps : false
    }
);

export default Resource;
```

### Create the `Assignment` model

Create a file called `Assignment.js` in the `models` directory and add the following lines of code to it:

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Assignment = sequelize.define(
    'Assignment',
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
                model : 'events',
                key   : 'id'
            },
            onDelete : 'CASCADE' // Ensures that deleting an 'event' will delete related 'assignments'
        },
        resourceId : {
            type       : DataTypes.INTEGER,
            allowNull  : false,
            references : {
                model : 'resources',
                key   : 'id'
            },
            onDelete : 'CASCADE' // This will delete all assignments referencing the resource when it's deleted
        }
    },
    {
        tableName  : 'assignments',
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

export default Assignment;
```

### Create the `index.js` file

Now create a file called `index.js` in the `models` directory and add the following lines of code to it:

```javascript
import Assignment from './Assignment.js';
import Dependency from './Dependency.js';
import Event from './Event.js';
import Resource from './Resource.js';

export { Assignment, Dependency, Event, Resource };
```

We can import all the models from this file.

## Populate the SQLite database with example data

Let's create a Node.js script to create a SQLite database file and populate it with the example JSON data 
in the `initialData` directory. 

Create a file called `addExampleData.js` in the root directory and add the following lines of code to it: 

```javascript
import { readFileSync } from 'fs';
import sequelize from './config/database.js';
import { Assignment, Dependency, Event, Resource } from './models/index.js';

async function setupDatabase() {
    // Wait for all models to synchronize with the database
    await sequelize.sync();

    // Now add example data
    await addExampleData();
}

async function addExampleData() {
    try {
    // Read and parse the JSON data
        const eventsData = JSON.parse(readFileSync('./initialData/events.json'));
        const resourcesData = JSON.parse(readFileSync('./initialData/resources.json'));
        const assignmentsData = JSON.parse(readFileSync('./initialData/assignments.json'));
        const dependenciesData = JSON.parse(readFileSync('./initialData/dependencies.json'));

        await sequelize.transaction(async(t) => {
            const events = await Event.bulkCreate(eventsData, { transaction : t });
            const resources = await Resource.bulkCreate(resourcesData, { transaction : t });
            const assignments = await  Assignment.bulkCreate(assignmentsData, { transaction : t });
            const dependencies = await Dependency.bulkCreate(dependenciesData, {
                transaction : t
            });

            return { assignments, dependencies, events, resources };
        });

        console.log('Assignments, dependencies, events, and resources added to database successfully.');
    }
    catch (error) {
        console.error('Failed to add data to database due to an error: ', error);
    }
}

setupDatabase();
```

The Sequelize instance is configured to connect to a SQLite database in the `/config/database.js` file. Here, we 
use the instance to create and populate the database with the asynchronous `setupDatabase` function. 

First we call the `sequelize.sync()` method to create database tables if they don't already exist for the data models. 
Then we add the example data to the database using the `addExampleData` function, which reads the JSON data files 
in the `initialData` folder using the `readFileSync` method of the Node.js File System module.

The Sequelize [`transaction`](https://sequelize.org/docs/v6/other-topics/transactions/) method performs a 
[database transaction](https://en.wikipedia.org/wiki/Database_transaction). Within the transaction, we use 
the [`bulkCreate`](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#creating-in-bulk) method to 
create multiple records using a single database query.

Now run this Node.js script using the following command:

```bash
node addExampleData.js
```

You should see a `database.sqlite3` file created in your root folder. This database is populated with the example 
events, resources, dependencies, and assignments data.

Note that by default, Sequelize will log every SQL query it performs in your terminal. Learn more about logging 
in the [Sequelize docs](https://sequelize.org/docs/v6/getting-started/#logging).

We don't need the SQLite command-line tools to execute SQL statements from the terminal for this tutorial but they 
can be useful. The SQLite command-line tools should already be installed on your system if you use macOS. If you're 
using other operating systems like Windows, you can download the bundle of tools from the 
[SQLite download page](https://www.sqlite.org/download.html) 
and add the SQLite directory (the path with the `sqlite3` executable file) to your 
computer's [PATH system variable](https://www.java.com/en/download/help/path.html).

Let's create an API endpoint to get the data from our database.

## Create an API endpoint to load the Bryntum Scheduler data from the database

In the `server.js` file, below the `app.use(bodyParser.json());` line, add the following `"/load"` API GET request 
route definition:

```javascript
app.get('/load', async(req, res) => {
    try {
        const assignmentsPromise = Assignment.findAll();
        const dependenciesPromise = Dependency.findAll();
        const eventsPromise = Event.findAll();
        const resourcesPromise = Resource.findAll();
        const [assignments, dependencies, events, resources] = await Promise.all([
            assignmentsPromise,
            dependenciesPromise,
            eventsPromise,
            resourcesPromise
        ]);
        res
            .send({
                assignments  : { rows : assignments },
                dependencies : { rows : dependencies },
                events       : { rows : events },
                resources    : { rows : resources }
            })
            .status(200);
    }
    catch (error) {
        console.error({ error });
        res.send({
            success : false,
            message :
        'There was an error loading the assignments, dependencies, events, and resources data.'
        });
    }
});
```

We use the Sequelize [`findAll`](https://sequelize.org/docs/v6/core-concepts/model-querying-finders/#findall) method 
on the `Assignment`, `Dependency`, `Event`, and `Resource` models to 
retrieve the records from the corresponding `assignments`, `dependencies`, `events`, and `resources` tables in the 
SQLite database. We then return the data using the 
[load response 
structure](#Scheduler/guides/data/crud_manager.md#load-response-structure) 
expected by the Bryntum Scheduler. 

Now we need to import the Sequelize models we created. Add the import to the top of the `server.js` file:

```javascript
import { Assignment, Dependency, Event, Resource } from './models/index.js';
```

Run the development server if it's not already running:

```bash
npm start
```

Open `http://localhost:1337/load` in your browser. You should see a JSON object of the 
assignments, dependencies, events, and resources data from the SQLite database:

```json
{
  "assignments": {
    "rows": [
      {
        "id": 1,
        "eventId": 1,
        "resourceId": 1
      },
      {
        "id": 2,
        "eventId": 2,
        "resourceId": 1
      },
      // ...
```

Next we'll create an API endpoint to keep data in the database in sync with data changes in the frontend UI.

## Create an API endpoint to sync Bryntum Scheduler data changes to the database

Below the `"/load"` API GET request route definition in the `server.js` file, add the following `"/sync"` API POST 
request route definition to handle syncing data changes in the frontend Bryntum Scheduler with the backend database:

```javascript
app.post('/sync', async function(req, res) {
    const { requestId, assignments, dependencies, events, resources } = req.body;

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

        if (dependencies) {
            const rows = await applyTableChanges('dependencies', dependencies);
            if (rows) {
                response.dependencies = { rows };
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

The Express app uses the `bodyParser.json()` method from the `body-parser` library so that the `"/sync"` API route 
can handle JSON data. The Bryntum Scheduler we create and configure on the frontend will send JSON data in POST 
requests to this `"/sync"` API route when there are data changes in the Scheduler to keep the frontend and 
database data in sync. 

The request body is parsed to determine which data stores in the 
[project data](#Scheduler/guides/data/displayingdata.md#the-scheduler-project) 
have changed. Bryntum Scheduler 
sync requests include changes for all the linked data stores in a single request that has a 
specific 
[sync request structure
](#Scheduler/guides/data/crud_manager_in_depth.md#sync-request-structure). 

We then call the `applyTableChanges` helper function for each data store that has changed. We pass in the changed data 
records as the second argument of the `applyTableChanges` function. 

Define the `applyDataChanges` function below the  `"/sync"` API POST request route definition:

```javascript
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

This helper function checks if the change is an `added`, `updated`, or `removed` operation, and then calls the 
appropriate CRUD operation helper function to update the SQLite database. 

Define the `createOperation` helper function below the `applyTableChanges` function:

```javascript
function createOperation(added, table) {
    return Promise.all(
        added.map(async(record) => {
            const { $PhantomId, ...data } = record;
            let id;
            // Insert record into the table.rows array
            if (table === 'assignments') {
                const assignment = await Assignment.create(data);
                id = assignment.id;
            }
            if (table === 'dependencies') {
                const dependency = await Dependency.create(data);
                id = dependency.id;
            }
            if (table === 'events') {
                const event = await Event.create(data);
                id = event.id;
            }
            if (table === 'resources') {
                const resource = await Resource.create(data);
                id = resource.id;
            }
            // report to the client that we changed the record identifier
            return { $PhantomId, id };
        })
    );
}
```

We map through the array of added records and call the Sequelize 
[`create()`](https://sequelize.org/docs/v6/core-concepts/model-instances/#a-very-useful-shortcut-the-create-method) 
method to create instances of the 
Sequelize models. This adds the records to the database. 

<div class="note">
The <code>$PhantomId</code> is a phantom identifier, a unique, auto-generated client-side value used to identify the 
record. 
You should not persist phantom identifiers in your database. You can read more about phantom identifiers in 
our 
<a href="#Scheduler/guides/data/crud_manager_in_depth.md#sync-request-structure">docs</a>.
</div>

Now define the `updateOperation` function below the `createOperation` function:

```javascript
function updateOperation(updated, table) {
    return Promise.all(
        updated.map(async({ id, ...data }) => {
            if (table === 'assignments') {
                await Assignment.update(data, { where : { id } });
            }
            if (table === 'dependencies') {
                await Dependency.update(data, { where : { id } });
            }
            if (table === 'events') {
                await Event.update(data, { where : { id } });
            }
            if (table === 'resources') {
                await Resource.update(data, { where : { id } });
            }
        })
    );
}
```

We use the Sequelize [`update`](https://sequelize.org/docs/v6/core-concepts/model-instances/#updating-an-instance) 
method to update the database records. 

Finally, define the `deleteOperation` function below the `updateOperation` function:

```javascript
function deleteOperation(deleted, table) {
    return Promise.all(
        deleted.map(async({ id }) => {
            if (table === 'assignments') {
                await Assignment.destroy({
                    where : {
                        id : id
                    }
                });
            }
            if (table === 'dependencies') {
                await Dependency.destroy({
                    where : {
                        id : id
                    }
                });
            }
            if (table === 'events') {
                await Event.destroy({
                    where : {
                        id : id
                    }
                });
            }
            if (table === 'resources') {
                await Resource.destroy({
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

Now that the API endpoints have been added, let's set up our frontend Bryntum Scheduler.

## Set up the frontend

Install the Bryntum Scheduler component by following 
[this guide](#Scheduler/guides/quick-start/javascript-npm.md#install-component) in our docs.

To use the Bryntum Scheduler component module code in the frontend, add the following line of code to the top of 
the `server.js` file, above the `app.use(bodyParser.json());` line:

```javascript
app.use(
    express.static(path.join(__dirname, '/node_modules/@bryntum/scheduler'))
);
```

We'll now create the static HTML, CSS, and JavaScript files that will be sent to the browser from the backend.

### Create the HTML page to display the Bryntum Scheduler

Create a file called `index.html` in the `/public` folder and add the following lines of code to it:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <link rel="icon" type="image/png" href="/bryntum.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>How to use Bryntum Scheduler with Express and SQLite</title>
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Poppins" />
    <link rel="stylesheet" href="./scheduler.css">
    <link rel="stylesheet" href="./svalbard-light.css" data-bryntum-theme>
    <link rel="stylesheet" href="./style.css">
    <script type="module" src="./index.js" defer></script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

The Bryntum Scheduler will be appended to the `<div>` with an `id` of `"app"`. Stylesheets are added for the 
[Bryntum Scheduler 
theme](#Scheduler/guides/customization/styling.md#using-a-theme) 
and the CSS file we'll create. There's also a `<script>` tag for the JavaScript 
file that we'll use to configure the Bryntum Scheduler. 

### Creating the Bryntum Scheduler

Create a file called `index.js` in the public folder and add the following lines of code to it:

```javascript
import { Scheduler } from './scheduler.module.js';

const terminalHideDelay = 300;
const terminalShowDelay = 100;

const scheduler = new Scheduler({
    appendTo   : 'app',
    startDate  : new Date(2024, 1, 19, 6),
    endDate    : new Date(2024, 1, 19, 20),
    viewPreset : 'hourAndDay',
    features   : {
        dependencies : {
            // Makes dependency lines easier to click
            clickWidth     : 5,
            // Round the corners of the dependency lines
            radius         : 10,
            // How far in px from the edge of the event bar to place the terminals
            // (negative numbers are further away from the bar, positive further inside)
            terminalOffset : 0,
            // Size of dependency terminals in px
            terminalSize   : 12,
            // Time to wait after mouse enters an event bar, before showing the terminals
            // (using a short delay, to make UI feel less "jumpy" when moving mouse over multiple events)
            terminalShowDelay,
            // Time to wait before hiding a terminal after mouse leaves the event bar / terminal.
            // Lets us use an animation for the hide operation
            terminalHideDelay
        },
        dependencyEdit : {
            showLagField : false
        }
    },
    crudManager : {
        loadUrl          : 'http://localhost:1337/load',
        autoLoad         : true,
        syncUrl          : 'http://localhost:1337/sync',
        autoSync         : true,
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },
    columns : [{ text : 'Name', field : 'name', width : 130 }]
});
```

We create an instance of the Bryntum Scheduler and configure it to attach to the `<div>` element with an `id` 
of `"app"`. The Bryntum Scheduler project has a 
[Crud Manager](#Scheduler/guides/data/crud_manager.md) that simplifies loading 
data from and syncing 
data changes to the server. The Crud Manager uses the 
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) as a transport system and JSON as the 
encoding format.

We set 
[`loadUrl`](#Scheduler/crud/AbstractCrudManagerMixin#config-loadUrl) 
and [`syncUrl`](#Scheduler/crud/AbstractCrudManagerMixin#config-syncUrl) 
to the Express API routes we created.

### Adding styles

By default, the Bryntum Scheduler component is configured to take `100%` of the parent DOM element with 
a `min-height` of `10em`.

To make the Bryntum Scheduler take up the full height of the screen, we need to add some CSS styles. Create 
a `style.css` file in the `/public` directory and add the following styles to it:

```css
body,
html {
    font-family: Poppins, "Open Sans", Helvetica, Arial, sans-serif;
}

* {
    margin: 0;
}

#app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-size: 14px;
}
```

## Running the application

To view the completed application, run the following command:

```bash
npm start
```

Open `http://localhost:1337/` in your browser, and you'll see a Bryntum Scheduler with the 
example data from 
the local SQLite database:

![Bryntum Scheduler with CRUD functionality](data/Scheduler/images/integration/backends/express/complete-app.gif)

The Bryntum Scheduler has CRUD functionality, and any changes made to it will be saved to the database.

## Next steps

This tutorial covers the basics of using Bryntum Scheduler using Express and SQLite. Take a look at 
the [Bryntum Scheduler examples page](https://bryntum.com/products/scheduler/examples/) to see additional features you 
can add to your Scheduler, such as:

- [Custom event rendering](https://bryntum.com/products/scheduler/examples/custom-event-rendering/)
- [Undo and redo](https://bryntum.com/products/scheduler/examples/undoredo/)
- [Time ranges](https://bryntum.com/products/scheduler/examples/timeranges/)


<p class="last-modified">Last modified on 2026-07-22 10:39:14</p>