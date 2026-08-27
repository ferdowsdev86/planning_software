# Migrate from DevExpress DevExtreme Scheduler to Bryntum Scheduler

The [DevExpress DevExtreme React Scheduler](https://js.devexpress.com/React/Scheduler/) and
[Bryntum React Scheduler](https://bryntum.com/products/react-scheduler/) are commercial scheduling UI components for
the web. This guide shows you how to migrate from a DevExtreme React Scheduler to a Bryntum React Scheduler.

We'll migrate an existing DevExtreme Scheduler Next.js application that uses Sequelize ORM and a local SQLite database
by following these steps:

* Creating database tables for the Bryntum Scheduler and migrating the DevExtreme Scheduler data to these new tables.
* Creating backend API endpoints for the Bryntum Scheduler.
* Updating the client-side code to use a Bryntum React Scheduler.

## Getting started

We'll use an existing DevExpress DevExtreme Scheduler Next.js starter project. The
[starter GitHub repository](https://github.com/bryntum/devexpress-devextreme-scheduler-migration-bryntum-starter) has
API endpoints for performing CRUD operations on a local SQLite database. The code for the migrated Bryntum Scheduler is
in the [`completed-app`](https://github.com/bryntum/devexpress-devextreme-scheduler-migration-bryntum-starter/tree/complete-app)
branch of the starter GitHub repository.

After cloning the starter project, install the dependencies using the following command:

```shell
npm install
```

The server uses [Sequelize](https://sequelize.org/) as an ORM to perform CRUD operations on the database and model the
data. Sequelize is configured to use a local SQLite database. The data models are in the `src/models` folder.

The code in the `src/addExampleData.js` file creates a local SQLite database and uses the data models and example
JSON data in the `src/initialData` folder to populate the database.

Create and populate a local SQLite database by running the `addExampleData.js` Node.js script:

```shell
node src/addExampleData.js
```

Sequelize will log every SQL query it performs in your terminal. You can learn more about logging in the
[Sequelize docs](https://sequelize.org/docs/v6/getting-started/#logging).

You may find the SQLite command-line tools useful when working with SQLite, as they allow you to enter
and execute SQL statements from your terminal. These
command-line tools should already be installed on your system if you use macOS. On other operating systems like Windows,
you'll need to download the bundle of tools from the [SQLite download page](https://www.sqlite.org/download.html) and
add the SQLite directory (the path with the `sqlite3` executable file) to your computer's
[PATH system variable](https://www.java.com/en/download/help/path.html).

The `DevExtremeScheduler.jsx` component makes fetch requests to the API endpoints using a
[`CustomStore`](https://js.devexpress.com/React/Documentation/ApiReference/Data_Layer/CustomStore/?search=customStore)
to get data from the local SQLite database and sync data changes on the client to the database.

When the migration is complete, the Bryntum Scheduler will display the same data as the example DevExtreme Scheduler:

![DevExtreme Scheduler](data/Scheduler/images/migrate-from-devexpress-devextreme/devextreme-scheduler.png)

The DevExtreme Scheduler has resources, uses a
[timeline view](https://js.devexpress.com/React/Documentation/Guide/UI_Components/Scheduler/Views/View_Types/#Timeline_Views),
and the
[appointments are grouped by resource](https://js.devexpress.com/React/Documentation/Guide/UI_Components/Scheduler/Resources/Group_Appointments_by_Resources/).
This resembles the [Bryntum Scheduler](https://bryntum.com/products/scheduler/) layout. The Scheduler's
[timeZone](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxScheduler/Configuration/#timeZone)
is set to UTC.

## Migrate the database

First we'll create new Sequelize models for the Bryntum Scheduler database tables. Then we'll migrate the example data in the
DevExtreme Scheduler database tables into the Bryntum Scheduler database tables using a Node.js script.

### Create Sequelize database models compatible with Bryntum Scheduler

We'll create three Sequelize models for the Bryntum Scheduler:

* `BryntumResource` - [ResourceModel](#Scheduler/model/ResourceModel)
* `BryntumEvent` - [EventModel](#Scheduler/model/EventModel)
* `BryntumAssignment` - [AssignmentModel](#Scheduler/model/AssignmentModel)

Create a file called `BryntumResource.js` in the `src/models` folder and add the following lines of code to it:

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
        }
    },
    {
        tableName  : 'bryntum_resources',
        timestamps : false
    }
);

export default BryntumResource;
```

We use the [`define`](https://sequelize.org/api/v6/class/src/sequelize.js~Sequelize.html#instance-method-define) method
of the Sequelize instance created in the `config/database.js` file to define the Bryntum Scheduler
[`ResourceModel`](#Scheduler/model/ResourceModel). We set the table name
to `bryntum_resources` using the `tableName` property. The model attributes define the columns for the database table.
We set the [data types](https://sequelize.org/docs/v6/core-concepts/model-basics/#data-types) of the columns for each
model attribute using Sequelize data types.

Create a file called `BryntumEvent.js` in the `src/models` folder and add the following lines of code to it:

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

The database table is called `bryntum_events`.

Now create a file called `BryntumAssignment.js` in the `src/models` folder and add the following lines of code to it:

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

In the `src/models/index.js` file, import the Bryntum Scheduler models and add them to the exported object:

```javascript
import DevExtremeAppointment from './DevExtremeAppointment.js';
import DevExtremeAssignment from './DevExtremeAssignment.js';
import DevExtremeResource from './DevExtremeResource.js';
import BryntumAssignment from './BryntumAssignment.js';
import BryntumEvent from './BryntumEvent.js';
import BryntumResource from './BryntumResource.js';

export {
    BryntumAssignment,
    BryntumEvent,
    BryntumResource,
    DevExtremeAppointment,
    DevExtremeAssignment,
    DevExtremeResource
};
```

All the models are exported from this file.

### Migrate the existing DevExpress DevExtreme Scheduler data into the new tables

We'll now create a Node.js script to create the database tables for the Bryntum Scheduler data models and migrate the
data in the DevExtreme database tables to the Bryntum Scheduler database tables. You can also use the
[Sequelize Command Line Interface (CLI)](https://github.com/sequelize/cli) to run migrations, as explained in the
Sequelize [migrations guide](https://sequelize.org/docs/v6/other-topics/migrations/). Note that the Sequelize migration
uses CommonJS.

Create a file called `migrateData.js` in the `src` folder and add the following lines of code to it:

```javascript
import sequelize from './config/database.js';
import BryntumAssignment from './models/BryntumAssignment.js';
import BryntumEvent from './models/BryntumEvent.js';
import BryntumResource from './models/BryntumResource.js';
import {
    DevExtremeAppointment,
    DevExtremeAssignment,
    DevExtremeResource
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
            devExtremeResourcesDataPromise    = DevExtremeResource.findAll(),
            devExtremeAppointmentsDataPromise = DevExtremeAppointment.findAll(),
            devExtremeAssignmentsDataPromise  = await DevExtremeAssignment.findAll();

        const [
            devExtremeResourcesData,
            devExtremeAppointmentsData,
            devExtremeAssignmentsData
        ] = await Promise.all([
            devExtremeResourcesDataPromise,
            devExtremeAppointmentsDataPromise,
            devExtremeAssignmentsDataPromise
        ]);

        // transform data to match existing Bryntum data structure
        const 
            bryntumResourcesData = [],
            bryntumEventsData = [],
            bryntumAssignmentsData = [];

        for (const devExtremeResource of devExtremeResourcesData) {
            const bryntumResource = {};
            bryntumResource.id = devExtremeResource.id;
            bryntumResource.name = devExtremeResource.text;
            bryntumResource.eventColor = devExtremeResource.color;
            bryntumResourcesData.push(bryntumResource);
        }

        for (const appointment of devExtremeAppointmentsData) {
            const bryntumEvent = {};
            bryntumEvent.id = appointment.id;
            bryntumEvent.name = appointment.text;
            bryntumEvent.startDate = appointment.startDate;
            bryntumEvent.endDate = appointment.endDate;
            bryntumEvent.allDay = appointment.allDay;
            bryntumEventsData.push(bryntumEvent);
        }

        for (const assignment of devExtremeAssignmentsData) {
            const bryntumAssignment = {};
            bryntumAssignment.id = assignment.id;
            bryntumAssignment.eventId = assignment.appointmentId;
            bryntumAssignment.resourceId = assignment.resourceId;
            bryntumAssignmentsData.push(bryntumAssignment);
        }

        // add transformed data to the Bryntum database tables
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

        console.log('Resources, events, and assignments migrated successfully.');
    }
    catch (error) {
        console.error('Failed to migrate data due to an error: ', error);
    }
}

setupDatabase();
```

We use the Sequelize instance in the `config/database.js` file, which is configured to connect to the local SQLite
database.

In the `setupDatabase()` function, we call the `sequelize.sync()` method to create the Bryntum Scheduler
database tables from our Bryntum Scheduler data models.

To create the data to insert in the Bryntum Scheduler database tables, we first fetch the existing data from the
DevExtreme Scheduler tables. We loop through the data and populate the Bryntum Scheduler data object properties with
the corresponding properties of the DevExtreme data.

We use the Sequelize [`transaction`](https://sequelize.org/docs/v6/other-topics/transactions/) method to perform a
[database transaction](https://en.wikipedia.org/wiki/Database_transaction). Within the transaction, the
[`bulkCreate`](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#creating-in-bulk) method is used to
create all the Bryntum Scheduler records for a table using a single database query.

Now run this migration Node.js script using the following command:

```shell
node src/migrateData.js
```

You should see the following logged to your terminal if the migration was successful:
```

Resources, events, and assignments migrated successfully.
```

## Set up the server side

We'll create two new API route handlers on the server: `/api/load/bryntum` and `/api/sync`. The `/api/load/bryntum`
route will read the data from the database and send it to the Bryntum Scheduler. Changes on the client-side
Bryntum Scheduler will be persisted to the database using the `/api/sync` route. We'll use the
Bryntum Scheduler [Crud Manager](#Scheduler/guides/data/crud_manager.md) to
handle the sync requests.

When data changes in the Bryntum Scheduler, the Crud Manager combines changes from all data
stores and makes a single HTTP POST request. This prevents data inconsistency problems, which can occur when you manage
related data stores separately. By contrast, data inconsistency problems are prevented in the DevExpress DevExtreme
Scheduler by reloading all the data from the `api/load` route after each CRUD operation, which is a less efficient
approach.

When a record is created on the Bryntum Scheduler backend using the Crud Manager, the new record ID is
sent to the frontend to update the ID.

### Create the data-loading endpoint

Now create a `/api/load/bryntum` API endpoint.

Create a `bryntum` folder in the `src/app/api/load` folder. Make a
`route.js` file in the new folder and add the following GET request route handler to it:

```javascript
import { BryntumAssignment, BryntumEvent, BryntumResource } from '@/models';

export async function GET() {
    try {
        const 
            resourcesPromise = BryntumResource.findAll(),
            eventsPromise = BryntumEvent.findAll(),
            assignmentsPromise = BryntumAssignment.findAll(),
            [resources, events, assignments] = await Promise.all([
                resourcesPromise,
                eventsPromise,
                assignmentsPromise
            ]);
        return Response.json({
            resources   : { rows : resources },
            events      : { rows : events },
            assignments : { rows : assignments }
        });
    }
    catch (error) {
        return new Response(
            'Loading resources, events, and assignments data failed',
            {
                status : 400
            }
        );
    }
}
```

We use the Sequelize [`findAll`](https://sequelize.org/docs/v6/core-concepts/model-querying-finders/#findall) method to
retrieve all the records from the Bryntum Scheduler `resources`, `events`, and `assignments` data in the SQLite
database. We then return the data using the
[load response structure](#Scheduler/guides/data/crud_manager.md#load-response-structure)
expected by the Bryntum Scheduler.

Now run the development server:

```shell
npm run dev
```

Open `http://localhost:3000/api/load/bryntum` in your browser. You'll see a
JSON object of the resources, events, and assignments data from the SQLite database:

```json
{
  "resources": {
    "rows": [
      {
        "id": 1,
        "name": "Samantha Bright",
        "eventColor": "purple",
        "readOnly": false
      },
      //...
    ]
  }
}
```

We'll now create an API endpoint to keep data in the database in sync with data changes in the frontend UI.

### Create the changes-saving endpoint

Create a folder called `sync` in the `src/app/api` folder. Make a `route.js` file inside the `sync` folder and add the
following POST request route handler to it:

```javascript
import { applyTableChanges } from '@/serverUtils';

export async function POST(request) {
    const 
        reqBody = await request.json(),
        { requestId, resources, events, assignments } = reqBody,
        eventMapping = {};

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
        return Response.json(response);
    }
    catch (error) {
        console.error({ error });
        return Response.json({
            requestId,
            success : false,
            message : 'There was an error syncing the data changes.'
        });
    }
}
```

The route handler function receives the data changes and the type of CRUD action to perform on the database from the
request body and sends the data changes to the `applyTableChanges` utility function.

The `eventMapping` variable stores the `id` values of created events. We'll use these values to find the `eventId`
value of the assignment added when an event is created.

Create a `serverUtils.js` file in the `src` folder and add the following lines of code to it:

```javascript
import 'server-only';
import { BryntumAssignment, BryntumEvent, BryntumResource } from './models';

export async function applyTableChanges(table, changes) {
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

function createOperation(added, table) {
    return Promise.all(
        added.map(async(record) => {
            const { $PhantomId, ...data } = record;
            let id;
            // Insert record into the table.rows array
            if (table === 'resources') {
                const resource = await BryntumResource.create(data);
                id = resource.id;
            }
            if (table === 'events') {
                const event = await BryntumEvent.create(data);
                id = event.id;
            }
            if (table === 'assignments') {
                const assignment = await BryntumAssignment.create(data);
                id = assignment.id;
            }
            // report to the client that we changed the record identifier
            return { $PhantomId, id };
        })
    );
}

function updateOperation(updated, table) {
    return Promise.all(
        updated.map(async({ id, ...data }) => {
            if (table === 'resources') {
                await BryntumResource.update(data, { where : { id } });
            }
            if (table === 'events') {
                await BryntumEvent.update(data, { where : { id } });
            }
            if (table === 'assignments') {
                await BryntumAssignment.update(data, { where : { id } });
            }
        })
    );
}

function deleteOperation(deleted, table) {
    return Promise.all(
        deleted.map(async({ id }) => {
            if (table === 'resources') {
                await BryntumResource.destroy({
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
            if (table === 'assignments') {
                await BryntumAssignment.destroy({
                    where : {
                        id : id
                    }
                });
            }
        })
    );
}
```

The `applyTableChanges` function checks which type of CRUD operation should be performed and which database table it
should be performed on, and then calls the relevant CRUD helper function: `createOperation`, `updateOperation`,
or `deleteOperation`.

The `createOperation` function loops through the array of added records and calls the Sequelize
[`create()`](https://sequelize.org/docs/v6/core-concepts/model-instances/#a-very-useful-shortcut-the-create-method)
method to add records to the database table, passed in as an argument.

<div class="note">Note that <code>$PhantomId</code> is a unique auto-generated client-side value used to identify a record. You 
shouldn't persist phantom identifiers in your database. We return the phantom identifier and the ID assigned by the 
database. The client-side Bryntum Scheduler will update the ID in the data store to use the ID assigned by the database. 
You can learn more about phantom identifiers in our <a href="#Scheduler/guides/data/crud_manager.md#sync-request-structure">docs</a>.
</div>

The `updateOperation` function uses the Sequelize
[`update`](https://sequelize.org/docs/v6/core-concepts/model-instances/#updating-an-instance) method to update database
records. The `deleteOperation` function uses the Sequelize
[`destroy`](https://sequelize.org/docs/v6/core-concepts/model-instances/#deleting-an-instance) method to delete database
records.

Install the `server-only` npm package:

```shell
npm install server-only
```

This library is used to
[keep server-only code out of the client environment](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment)
in Next.js apps.

We now have the API endpoints needed to connect a Bryntum Scheduler with the Bryntum Scheduler data in the SQLite
database.

## Update the client-side code

To add a Bryntum Scheduler to our frontend, we'll
[install the Bryntum Scheduler component](#Scheduler/guides/quick-start/nextjs.md#install-the-bryntum-scheduler-component),
which includes the installation of the
[Bryntum Scheduler React wrapper](#Scheduler/guides/integration/react/guide.md#the-react-wrappers)
that encapsulates the Bryntum Scheduler in a React component.

In the `src/config` folder, create a Bryntum Scheduler configuration file called `schedulerConfig.js` and add the
following lines of code to it:

```javascript
const 
    startDate = new Date(2024, 8, 2, 8),
    timeZoneOffset = startDate.getTimezoneOffset() / 60;

const schedulerConfig = {
    startDate                 : startDate,
    zoomOnMouseWheel          : false,
    zoomOnTimeAxisDoubleClick : false,
    viewPreset                : 'hourAndDay',
    timeZone                  : 'UTC',
    workingTime               : {
        fromHour : 8,
        toHour   : 17 - timeZoneOffset
    },
    columns : [
        {
            type      : 'resourceInfo',
            text      : 'Name',
            field     : 'name',
            width     : 150,
            showImage : false
        }
    ]
};

export { schedulerConfig };
```

Our scheduler will have a single column called "Name" and will use the UTC timezone. Note that when using the
[`workingTime`](#Scheduler/view/TimelineBase#property-workingTime)
feature, the [Zooming feature](#Scheduler/view/mixin/TimelineZoomable)
is not supported. You should disable the zooming controls `zoomOnMouseWheel` and `zoomOnTimeAxisDoubleClick`.

In the `src/components` folder, create a file called `BryntumScheduler.jsx` and add the following lines to it:

```javascript
'use client';

import { BryntumScheduler } from '@bryntum/scheduler-react';
import { useEffect, useRef, useState } from 'react';

export default function Scheduler({ ...props }) {
    const [crudManagerConfig] = useState({
        loadUrl          : '/api/load/bryntum',
        autoLoad         : true,
        syncUrl          : '/api/sync',
        autoSync         : true,
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    });

    const schedulerRef = useRef(null);

    useEffect(() => {
        // Bryntum Scheduler instance
        const scheduler = schedulerRef?.current?.instance;
    }, []);

    return (
        <BryntumScheduler
            ref={schedulerRef}
            {...props}
            crudManager={crudManagerConfig}
        />
    );
}
```

The Scheduler component is a React [Client Component](https://nextjs.org/docs/app/building-your-application/rendering/client-components),
as it uses the `use client` directive at the top of the file. The `ref` is used to access the Bryntum Scheduler instance.
We don't use this in this tutorial, but it's useful if you need to access the Bryntum Scheduler instance. We'll pass in
the `schedulerConfig` as a prop.

We also pass in the [Crud Manager](#Scheduler/guides/data/crud_manager.md)
configuration as a prop. The Crud Manager simplifies loading data from and syncing data changes to a server.
It uses the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) as the transport system and JSON as
the encoding format. We set the [`loadUrl`](#Scheduler/crud/AbstractCrudManagerMixin#config-loadUrl)
and [`syncUrl`](#Scheduler/crud/AbstractCrudManagerMixin#config-syncUrl)
to the API routes that we created.

Bryntum components are client-side only and Next.js Client Components are
[pre-rendered on the server](https://github.com/reactwg/server-components/discussions/4). To ensure that the
Bryntum Scheduler is rendered on the client only, we'll import the `BryntumScheduler` component
[dynamically](https://nextjs.org/docs/advanced-features/dynamic-import).

In the `src/components/schedulerWrapper.jsx` file, import the Bryntum Scheduler config:

```javascript
import { schedulerConfig } from '../config/schedulerConfig';
```

Change the `Scheduler` component's dynamic import path to the path for the `BryntumScheduler` component:

```javascript
const Scheduler = dynamic(() => import('./BryntumScheduler'), {
```

Pass in the `schedulerConfig` as props to the dynamically imported `Scheduler` component rendered by the
`SchedulerWrapper` component:

```javascript
      <Scheduler {...schedulerConfig} />
```

In the `src/app/page.js` file, import the CSS styles for the Bryntum Scheduler Stockholm 
[theme](#Scheduler/guides/customization/styling.md#using-a-theme), which is one of five available themes.

```javascript
import '@bryntum/scheduler/scheduler.stockholm.css';
```

## Test the migration implementation

Run the development server:

```shell
npm run dev
```

Open `http://localhost:3000`, and you should see the migrated data from the DevExtreme Scheduler
loaded into the Bryntum Scheduler:

![Bryntum Scheduler with CRUD functionality](data/Scheduler/images/migrate-from-devexpress-devextreme/bryntum-scheduler.gif)

Changes you make to the Bryntum Scheduler will be persisted in the SQLite database. You can create an event by clicking
and dragging in an empty row, or right-clicking in an empty row and selecting "Add event" in the popup menu. You can edit
or delete an event by right-clicking on it and selecting the appropriate list item in the popup.

You can also edit a resource by double-clicking on a resource name. You can copy or delete a resource by right-clicking
on it and selecting the appropriate list item in the popup.


<p class="last-modified">Last modified on 2026-07-22 10:39:14</p>