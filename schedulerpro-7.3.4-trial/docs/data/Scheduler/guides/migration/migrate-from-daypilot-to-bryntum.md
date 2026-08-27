# Migrate from DayPilot Scheduler to Bryntum Scheduler

[Daypilot Scheduler](https://javascript.daypilot.org/scheduler/) and [Bryntum Scheduler](https://bryntum.com/products/scheduler/) are commercial client-side 
scheduling UI components for the web that you can use with popular frameworks like React, Angular, and Vue. This 
guide shows you how to migrate from a DayPilot Scheduler to a Bryntum Scheduler.

Bryntum Scheduler is more feature-rich than the DayPilot Scheduler, with features like:

* [Crud manager](#Scheduler/guides/data/crud_manager.md)
* [Multi summary rows](../examples/multisummary/)
* [Advanced filtering](../examples/fieldfilters/)
* [Rows with histograms](../examples/timelinehistogram/)

To migrate an existing DayPilot Scheduler Express application that uses a local SQLite database, we'll do the following:

* Create database tables for the Bryntum Scheduler and migrate the DayPilot Scheduler data to these new tables.
* Update the backend API endpoints.
* Update the client-side code to use Bryntum Scheduler.

## Getting started

We'll use an existing DayPilot Scheduler Express starter project. The 
[starter GitHub repository](https://github.com/bryntum/daypilot-scheduler-migration-bryntum-starter) has a Node.js 
backend server, defined in the `server.js` file, that uses Express. It has API endpoints for performing CRUD 
operations on a local SQLite database. The code for the migrated Bryntum Scheduler is in the 
[`completed-app`](https://github.com/bryntum/daypilot-scheduler-migration-bryntum-starter/tree/completed-app) branch of 
the starter GitHub repository.

After cloning the starter project, install the dependencies using the following command:

```sh
npm install
```

The server is configured to use a local SQLite database and uses [Sequelize](https://sequelize.org/) as an ORM to perform 
CRUD operations on the database and model the data. The data models are in the `models` folder. 

The code in the `addExampleData.js` file creates a local SQLite database if one does not already exist, and uses the data 
models and the example JSON data in the `initialData` folder to populate the database.

Create and populate a local SQLite database by running the `addExampleData.js` Node.js script:

```sh
node addExampleData.js
```

Sequelize will log every SQL query it performs in your terminal. You can learn more about logging in the 
[Sequelize docs](https://sequelize.org/docs/v6/getting-started/#logging). 

You may find it useful to work with SQLite using the SQLite command-line tools, which allow you to enter 
and execute SQL statements from your terminal. These command-line tools should already be installed on 
your system if you use macOS. On other operating systems like Windows, you'll need to download the bundle 
of tools from the [SQLite download page](https://www.sqlite.org/download.html) and 
add the SQLite directory (the path with the `sqlite3` executable file) to your computer's 
[PATH system variable](https://www.java.com/en/download/help/path.html).

The Express app is configured to serve static files in the `public` folder. The `public` folder contains the 
client-side HTML, CSS, and JavaScript files for the DayPilot Scheduler. The DayPilot Scheduler makes fetch requests to 
the API endpoints to get data from the local SQLite database and sync data changes on the client to the database.

When the migration is complete, the Bryntum Scheduler will display the same data as the example DayPilot Scheduler:
 
![DayPilot Scheduler](data/Scheduler/images/migrate-from-daypilot/daypilot-scheduler.png)

To use the DayPilot Scheduler, we need to download the DayPilot Scheduler code.

### Download the DayPilot Scheduler code

If you don't have a DayPilot license, you can download the 
[DayPilot Pro Scheduler JavaScript code](https://javascript.daypilot.org/try/). The 60-day trial version can be used for 
testing and evaluation purposes. 

Copy the `scripts` folder and add it to the `public` directory in the starter app.

Run the development server using the following command:

```sh
npm start
```

Browse to `http://localhost:1337`, and you'll see a DayPilot Scheduler with CRUD functionality 
for events and resources data.

## Migrate the database

First we'll create new Sequelize models for the Bryntum Scheduler database tables. Then we'll migrate the example data 
in the DayPilot Scheduler database tables into the Bryntum Scheduler database tables using a Node.js script. 

### Create Sequelize database models compatible with Bryntum Scheduler

We'll create three Sequelize models for the Bryntum Scheduler:

* `BryntumResource` ([ResourceModel](#Scheduler/model/ResourceModel)).
* `BryntumEvent` ([EventModel](#Scheduler/model/EventModel)).
* `BryntumAssignment` ([AssignmentModel](#Scheduler/model/AssignmentModel)).

We'll migrate the data from the DayPilot resource groups and resources tables into the Bryntum Scheduler resources 
table. The data will have a flat structure that the Bryntum Scheduler will transform into tree data on the client. The 
Bryntum Scheduler assignments table links events to resources, allowing for 
[multiple assignments](../examples/multiassign/).

Create a file called `BryntumResource.js` in the `models` folder and add the following lines of code to it:

```javascript
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
            onDelete : 'CASCADE' // This will delete all child resources referencing the resource when it's deleted
        },
        parentIndex : {
            type         : DataTypes.INTEGER,
            defaultValue : null
        }
    },
    {
        tableName  : 'bryntum_resources',
        timestamps : false,
        indexes    : [
            {
                fields : ['parentIndex', 'parentId']
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

The `parentId` model attribute is a foreign key that references the parent resource if the resource has a parent. 

Create a file called `BryntumEvent.js` in the `models` folder and add the following lines of code to it:

```javascript
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

```javascript
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

In the `/models/index.js` file, import the Bryntum Scheduler models and add them to the exported object:

```javascript
import BryntumAssignment from './BryntumAssignment.js';
import BryntumEvent from './BryntumEvent.js';
import BryntumResource from './BryntumResource.js';
import Event from './Event.js';
import Resource from './Resource.js';
import ResourceGroup from './ResourceGroup.js';

export {
    BryntumAssignment,
    BryntumEvent,
    BryntumResource,
    Event,
    Resource,
    ResourceGroup
};
```

All the models are exported from this file.

### Migrate the existing DayPilot Scheduler data into the new tables

We'll now write a Node.js script to create the database tables for the Bryntum Scheduler data models and migrate the 
data from the DayPilot database tables to the Bryntum Scheduler database tables. You can also use the 
[Sequelize Command-Line Interface (CLI)](https://github.com/sequelize/cli) to run migrations and keep 
track of changes to the database and revert changes if needed. Read more in the Sequelize 
[migrations guide](https://sequelize.org/docs/v6/other-topics/migrations/). Note that the Sequelize migration uses 
CommonJS. 

Create a file called `migrateData.js` in the root directory and add the following lines of code to it: 

```javascript
import sequelize from './config/database.js';
import BryntumAssignment from './models/BryntumAssignment.js';
import BryntumEvent from './models/BryntumEvent.js';
import BryntumResource from './models/BryntumResource.js';
import { Event, Resource, ResourceGroup } from './models/index.js';

async function setupDatabase() {
    // Wait for all models to synchronize with the database
    await sequelize.sync();

    // Now add example data
    await migrateExampleData();
}

async function migrateExampleData() {
    try {
        // Read the existing data
        const resource_groupsDataPromise = await ResourceGroup.findAll();
        const resourcesDataPromise = Resource.findAll();
        const eventsDataPromise = Event.findAll();

        const [resource_groupsData, resourcesData, eventsData] = await Promise.all([
            resource_groupsDataPromise,
            resourcesDataPromise,
            eventsDataPromise
        ]);

        // transform data to match existing Bryntum data structure
        const bryntumResourcesData = [];
        const bryntumAssignmentsData = [];
        const bryntumEventsData = [];

        for (const resource_group of resource_groupsData) {
            const bryntumResource = {};
            bryntumResource.id = resource_group.id;
            bryntumResource.name = resource_group.name;
            bryntumResource.parentId = null;
            bryntumResource.parentIndex = resource_group.ordinal;
            bryntumResourcesData.push(bryntumResource);
        }

        for (const resource of resourcesData) {
            const bryntumResource = {};
            bryntumResource.id = resource.id;
            bryntumResource.name = resource.name;
            bryntumResource.parentId = resource.group_id;
            bryntumResource.parentIndex = resource.ordinal;
            bryntumResourcesData.push(bryntumResource);
        }

        for (const event of eventsData) {
            const bryntumAssignment = {};
            const bryntumEvent = {};

            bryntumAssignment.eventId = event.id;
            bryntumAssignment.resourceId = event.resource;
            bryntumEvent.id = event.id;
            bryntumEvent.name = event.text;
            bryntumEvent.startDate = event.start;
            bryntumEvent.endDate = event.end;

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

We use the Sequelize instance in the `config/database.js` file that's configured to connect to our local SQLite 
database. In the `setupDatabase` function, we call the `sequelize.sync()` method to create the Bryntum Scheduler 
database tables from our Bryntum Scheduler data models. 

To create the data to insert in the Bryntum Scheduler database tables, we first fetch the existing data from the 
DayPilot tables. We loop through the data and populate the Bryntum Scheduler data record object properties with 
the corresponding properties of the DayPilot data. 

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
handle the sync requests. When data changes in the Bryntum Scheduler, the Crud Manager combines changes from all data 
stores and makes a single HTTP POST request. This prevents data inconsistency problems that can occur when managing 
related data stores separately.

### Create the data-loading endpoint

To create a `/api/load` API endpoint, add the following GET request handler to the `server.js` file:

```javascript
app.get('/api/load', async(req, res) => {
    try {
        const resourcesPromise = BryntumResource.findAll({
            order : [['parentIndex', 'ASC']]
        });
        const eventsPromise = BryntumEvent.findAll();
        const assignmentsPromise = BryntumAssignment.findAll();
        const [resources, events, assignments] = await Promise.all([
            resourcesPromise,
            eventsPromise,
            assignmentsPromise
        ]);

        const resourcesMod = resources.map((resource) => {
            if (resource.parentId) {
                return { ...resource.dataValues };
            }
            else {
                return { ...resource.dataValues, expanded : true };
            }
        });

        res
            .send({
                resources   : { rows : resourcesMod },
                events      : { rows : events },
                assignments : { rows : assignments }
            })
            .status(200);
    }
    catch (error) {
        console.error({ error });
        res.send({
            success : false,
            message : 'There was an error loading the resources, events, and assignments data.'
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

```javascript
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
{
  "resources": {
    "rows": [
      {
        "id": 11,
        "name": "Villa",
        "eventColor": null
        
        // ...
        
      }
    ]
  }
}
```

We'll now create an API endpoint to keep data in the database in sync with data changes in the frontend UI.

### Set up the sync endpoint

Add the following `/api/sync` API POST request route definition to the bottom of the `server.js` file:

```javascript
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

The route handler function receives the data changes and the type of CRUD action to perform on the database from the 
request body and sends the data changes to the `applyTableChanges` helper function.

The `eventMapping` variable stores the `ids` of created events. We'll use these `id` values to find the `eventId` value 
of the assignment added when an event is created.

Define the `applyTableChanges` helper function at the bottom of the `server.js` file:

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
    // if got some data to update client
    return rows;
}
```

This helper function checks what type of CRUD operation should be performed and which database table it should be 
performed on, and then calls the relevant CRUD helper function. Let's create these CRUD helper functions.

Define the `createOperation` function at the bottom of the `server.js` file:

```javascript
function createOperation(added, table) {
    // handle copying resource parent with children - need to create parents before children
    if (table === 'resources' && added.length > 1) {
        // check if there are parents
        const parents = added.filter((resource) => resource.parentId === null);
        const newIdsArray = [];

        // Process parents and their children concurrently
        const parentPromises = parents.map(async(parent) => {
            // find children
            const children = added.filter(
                (resource) => resource.parentId === parent.$PhantomId
            );

            const parentMaxIndex = await BryntumResource.max('parentIndex', {
                where : { parentId : null }
            });
            const parentResource = await BryntumResource.create({
                ...parent,
                parentIndex : parentMaxIndex + 1
            });
            newIdsArray.push({
                $PhantomId : parent.$PhantomId,
                id         : parentResource.id
            });

            // create parent's children
            if (children.length > 0) {
                const childPromises = children.map(async(child) => {
                    const childMaxIndex = await BryntumResource.max('parentIndex', {
                        where : { parentId : parentResource.id }
                    });

                    const childResource = await BryntumResource.create({
                        ...child,
                        parentId    : parentResource.id,
                        parentIndex : childMaxIndex + 1
                    });
                    newIdsArray.push({
                        $PhantomId : child.$PhantomId,
                        id         : childResource.id
                    });
                });
                await Promise.all(childPromises);
            }
        });

        return Promise.all(parentPromises).then(async() => {
            // Handle children whose parents are not in the parents array
            const remainingChildren = added.filter(
                (resource) =>
                    resource.parentId !== null &&
            !newIdsArray.some((newId) => newId.$PhantomId === resource.parentId)
            );

            const remainingChildPromises = remainingChildren.map(async(child) => {
                const parentIdEntry = newIdsArray.find(
                    (newId) => newId.$PhantomId === child.parentId
                );
                const maxChildIndex = await BryntumResource.max('parentIndex', {
                    where : { parentId : child.parentId }
                });
                const childResource = await BryntumResource.create({
                    ...child,
                    parentId    : parentIdEntry ? parentIdEntry.id : child.parentId,
                    parentIndex : maxChildIndex + 1
                });
                newIdsArray.push({
                    $PhantomId : child.$PhantomId,
                    id         : childResource.id
                });
            });

            await Promise.all(remainingChildPromises);
            return newIdsArray;
        });
    }
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
                const event = await BryntumEvent.create(data);
                id = event.id;
            }
            if (table === 'resources') {
                // determine parentIndex number - add 1 to it
                // child resource
                if (data.parentId) {
                    const maxIndex = await BryntumResource.max('parentIndex', {
                        where : { parentId : data.parentId }
                    });
                    const resource = await BryntumResource.create({
                        ...data,
                        parentIndex : maxIndex + 1
                    });
                    id = resource.id;
                    // parent resource
                }
                else {
                    const maxIndex = await BryntumResource.max('parentIndex', {
                        where : { parentId : null }
                    });
                    const resource = await BryntumResource.create({
                        ...data,
                        parentIndex : maxIndex + 1
                    });
                    id = resource.id;
                }
            }
            // report to the client that we changed the record identifier
            return { $PhantomId, id };
        })
    );
}
```

We loop through the array of added records and call the Sequelize 
[`create()`](https://sequelize.org/docs/v6/core-concepts/model-instances/#a-very-useful-shortcut-the-create-method) 
method to add records to the database table passed in as an argument. 

<div class="note">The <code>$PhantomId</code> is a unique auto-generated client-side value used to identify a record. 
You shouldn't persist phantom identifiers in your database. We return the phantom identifier and the ID assigned by the 
database. The client-side Bryntum Scheduler will update the ID in the data store to use the ID assigned by the database. 
You can learn more about phantom identifiers in our 
<a href="#Scheduler/guides/data/crud_manager.md#sync-request-structure">docs</a>. 
</div>

Now, define the `deleteOperation` function below the `createOperation` function:

```javascript
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

```javascript
function updateOperation(updated, table) {
    return Promise.all(
        updated.map(async({ id, ...data }) => {
            if (table === 'assignments') {
                await BryntumAssignment.update(data, { where : { id } });
            }
            if (table === 'events') {
                await BryntumEvent.update(data, { where : { id } });
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
[step 1](#Scheduler/guides/quick-start/javascript-npm.md#access-to-npm-registry) 
and [step 4](#Scheduler/guides/quick-start/javascript-npm.md#install-component) 
of the 
[vanilla JavaScript with npm setup guide](#Scheduler/guides/quick-start/javascript-npm.md).

To use the Bryntum Scheduler component module code in the frontend, add the following line of code to the top of the 
`server.js` file, above the `app.use(bodyParser.json());` line:

```javascript
app.use(
    express.static(path.join(__dirname, '/node_modules/@bryntum/scheduler'))
);
```

Open the `public/index.html` file and replace all of its content with the following:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <link rel="icon" type="image/png" href="/bryntum.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Migrate from DayPilot Scheduler to Bryntum Scheduler</title>
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Poppins" />
    <link rel="stylesheet" href="./scheduler.stockholm.css" data-bryntum-theme>
    <link rel="stylesheet" href="./style.css">
    <script type="module" src="./index.js" defer></script>
  </head>
  <body>
   <div id="app"></div>
</body>
</html>
```

The Bryntum Scheduler will be appended to the `<div>` with an `id` of `"app"`. There is a stylesheet added for the 
[Bryntum Scheduler Stockholm theme](#Scheduler/guides/customization/styling.md#using-a-theme).

Replace the styles in the `public/style.css` file with the following styles:

```css
* {
    margin: 0;
    font-family: Poppins, "Open Sans", Helvetica, Arial, sans-serif;
}

#app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-size: 14px;
}

.b-tree-cell-value {
    font-weight: 600;
}

.b-tree-cell-value .info {
    display: flex;
    gap: 0.5rem;
}

.b-tree-cell-value .info .name {
    font-weight: 400;
}

.b-tree-cell-value .add {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    background-color: transparent;
    color: #888;
    border-radius: 50%;
    width: 1.25em;
    height: 1.25em;
    margin-inline-end: 1em;
    cursor: pointer;
    transition: all 0.3s;
}

.b-tree-cell-value .add:hover {
    background-color: #888;
    color: #fff;
    width: 1.25em;
    height: 1.25em;
    transition: all 0.3s;
}

.b-icon-tree-leaf::before {
    content: "";
}
```

By default, the Bryntum Scheduler component is configured to take `100%` of the parent DOM element with a min-height 
of `10em`.

To make the Bryntum Scheduler take up the full height of the screen, we set the height of its parent DOM element, the 
`<div>` with an ID of `app`, to `100vh`.

Replace the code in the `public/index.js` file with the following code:

```javascript
import { Scheduler, StringHelper } from './scheduler.module.js';

const scheduler = new Scheduler({
    appendTo   : 'app',
    viewPreset : 'dayAndMonth',
    features   : {
        // Turn the resource grid part of Scheduler into a tree
        tree : true
    },
    eventRenderer({ renderData, eventRecord }) {
        renderData.eventColor = '#4b86b3';
        return StringHelper.xss`${eventRecord.name}`;
    },
    crudManager : {
        resourceStore : {
            transformFlatData : true,
            tree              : true
        },
        loadUrl          : 'http://localhost:1337/api/load',
        autoLoad         : true,
        syncUrl          : 'http://localhost:1337/api/sync',
        autoSync         : true,
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },
    columns : [
        {
            type       : 'tree',
            text       : 'Name',
            field      : 'name',
            width      : 180,
            htmlEncode : false,
            renderer({ record, value }) {
                if (!record.parentId) {
                    return StringHelper.xss`
                     <div class="info">
                         <div class="name">${value}</div>
                         <div class="add" data-btip="Add child"><i class="fa fa-plus"></i></div>
                     </div>`;
                }
                else {
                    return StringHelper.xss`${value}`;
                }
            }
        }
    ],
    tbar : {
        items : {
            addEventButton : {
                type     : 'button',
                icon     : 'b-icon b-icon-add',
                color    : 'b-green',
                text     : 'Add resource group',
                onAction : () => {
                    scheduler.resourceStore.add({
                        name     : 'New resource',
                        parentId : null,
                        expanded : true
                    });
                }
            }
        }
    },
    listeners : {
        cellClick({ record, event }) {
            // Add a new resource child when clicking plus icon
            if (event.target.closest('.add')) {
                record.appendChild({
                    name : 'New resource'
                });
            }
        }
    }
});
```

We create an instance of the Bryntum Scheduler and configure it to attach to the `<div>` element with an `id` of `"app"`. 

The Bryntum Scheduler project has a 
[Crud Manager](#Scheduler/guides/data/crud_manager.md) that simplifies loading 
data from and syncing data changes to a server. It uses the 
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) as the transport system and JSON as the encoding 
format. We set the 
[`loadUrl`](#Scheduler/crud/AbstractCrudManagerMixin#config-loadUrl) 
and [`syncUrl`](#Scheduler/crud/AbstractCrudManagerMixin#config-syncUrl) 
to point to the Express API routes we created.

We set the Bryntum Scheduler to be a tree grid by adding the 
[`tree`](#Grid/feature/Tree) feature. We transform the flat resources 
data into tree data by setting the 
[`transformFlatData`](#Scheduler/guides/data/treedata.md#transforming-flat-data) 
property of the <a href="#Scheduler/data/ResourceStore" target="apidocs"><code>resourceStore</code></a> to `true`. The tree feature requires a store with the `tree` property set to `true` and 
a [`TreeColumn`](#Grid/column/TreeColumn).

The resource name tree column has a 
[cell renderer](#Grid/column/Column#cell-renderers-and-customizing-cell-content) that adds a plus 
button to add child resources to the selected resource. 

You can learn more about tree data in our guide to 
[using tree data](#Scheduler/guides/data/treedata.md).

## Test the migration implementation

Run the development server:

```sh
npm start
```

Open `http://localhost:1337`. You should see the migrated data from the DayPilot Scheduler 
loaded into the Bryntum Scheduler:

![Bryntum Scheduler with CRUD functionality](data/Scheduler/images/migrate-from-daypilot/bryntum-scheduler.gif)

Changes you make to the Bryntum Scheduler will be persisted in the SQLite database. You can create an event by clicking 
and dragging in an empty row or right-clicking in an empty row and selecting "Add event" from the popup menu. You can edit 
or delete an event by right-clicking on it and selecting the appropriate list item from the popup.

You can also create, edit, delete, or copy a resource. 

## Learn more

Visit our [Scheduler demos](../examples/) to see how you can enhance your Bryntum 
Scheduler with features such as:

* [Multi summary rows](../examples/multisummary/)
* [Advanced filtering](../examples/fieldfilters/)
* [Rows with histograms](../examples/timelinehistogram/)



<p class="last-modified">Last modified on 2026-07-22 10:39:14</p>