# How to use Bryntum Scheduler with MongoDB

[Bryntum Scheduler](https://bryntum.com/products/scheduler/) is a full-featured scheduling UI component. It's performant, highly customizable, and built with JavaScript. [MongoDB](https://www.mongodb.com/) is a widely used [document database](https://www.mongodb.com/document-databases). 

In this tutorial, we'll show you how to use Bryntum Scheduler with MongoDB. We'll use [MongoDB Atlas](https://www.mongodb.com/atlas/database), the fully managed MongoDB cloud service.

Here are the steps we'll follow: 

- Set up MongoDB Atlas.
- Connect the database to an existing Express server.
- Create a Node.js seed script to populate the database with example data as a single collection in the database.
- Create API endpoints to load data and sync data changes to the database.
- Modify an existing Bryntum Scheduler frontend app to make CRUD requests to the API endpoints.
- Create a new database seed script to store the example data as multiple collections in the database. One collection per Bryntum data store: resources, events, assignments, and dependencies.  
- Update the API endpoints to get and sync data from the collections.

We'll also discuss the advantages and disadvantages of storing the Bryntum Scheduler data as a single database collection versus multiple collections for each Bryntum Scheduler data store. 

Here's what we’ll build:

<video controls width="100%">
<source src="Scheduler/scheduler-CRUD.mp4" type="video/mp4">
Sorry, your browser doesn't support embedded videos.
</video>

## Getting started

As a starting point, we'll use two existing apps: A backend Express app and a frontend vanilla JavaScript app.  

### Express backend app

First, clone the [Express backend starter GitHub repository](https://github.com/bryntum/bryntum-scheduler-with-mongodb-backend-starter). You'll find the code for the completed tutorial on the [`completed-apis`](https://github.com/bryntum/bryntum-scheduler-with-mongodb-backend-starter/tree/completed-apis) and [`completed-apis-separate-collections`](https://github.com/bryntum/bryntum-scheduler-with-mongodb-backend-starter/tree/completed-apis-separate-collections) branches of the repository. The app uses the [MongoDB Node.js Driver](https://www.npmjs.com/package/mongodb) npm package to connect to MongoDB. 

The app has the following files:

- `db/conn.js`: The global connection to the MongoDB Atlas database.
- `server.js`: The Express server.
- `routes/scheduler.js`: The REST API endpoints. The file contains a single test API endpoint that returns `{"success":true}`.
- `loadEnvironment.js`: Loads the environment variables.

Create a `.env` file in the root folder and add the following variables to it:

```

ATLAS_URI=mongodb+srv://...
FRONTEND_URL=http://localhost:5173
DB_NAME=bryntum_scheduler
PORT=5050
```

Once we've set up MongoDB Atlas, we'll add the `ATLAS_URI` [connection string](https://www.mongodb.com/docs/manual/reference/connection-string/) to connect the MongoDB Atlas instance to the backend app.

Install the dependencies using the following command: 

```bash
npm install
```

Now run the local development server:

```bash
npm start
```

If you open `http://localhost:5050/api/load` in your browser, you should see the following JSON response:

```json
{"success":true}
```

### Bryntum Scheduler frontend app

Start by cloning the [Bryntum Scheduler frontend starter GitHub repository](https://github.com/bryntum/bryntum-scheduler-with-mongodb-frontend-starter). This repository contains the code for the completed scheduler on the [`completed-scheduler`](https://github.com/bryntum/bryntum-scheduler-with-mongodb-frontend-starter/tree/completed-scheduler) branch. 

The starter repository uses [Vite](https://vitejs.dev/) as a development server and JavaScript bundler. Install the Vite dev dependency by running the following command:

```bash
npm install
```

We'll now install the Bryntum Scheduler component using npm. You can try out Bryntum components for free using our public Bryntum trial packages.
If you have a Bryntum license, please refer to our [Npm Repository Guide](https://bryntum.com/products/scheduler/docs/guide/Scheduler/quick-start/javascript-npm#access-to-npm-registry) to access the private Bryntum repository. Install the Bryntum Scheduler component by following [this guide](https://bryntum.com/products/scheduler/docs/guide/Scheduler/quick-start/javascript-npm#install-component).

The Bryntum Scheduler is initialized and configured in the `main.js` file. We use a [Crud Manager](https://bryntum.com/products/scheduler/docs/guide/Scheduler/data/crud_manager) to load data into multiple Bryntum Scheduler [data stores](https://bryntum.com/products/scheduler/docs/guide/Scheduler/data/displayingdata). The Crud Manager fetches data from the `loadUrl` endpoint. The initial example data is in the `public/data/data.json` file. We use four types of data stores in this tutorial: resources, events, assignments, and dependencies. 

Run the local development server using the following command:

```bash
npm run dev
```

You’ll see the basic Bryntum Scheduler app:

![Bryntum Scheduler](data/Scheduler/images/scheduler-with-mongodb/scheduler.png)

Now let’s set up MongoDB Atlas as a data store for the Bryntum Scheduler.

## Getting started with MongoDB Atlas

First [register for a MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register). Next, [deploy a free database cluster](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/), which you can do using the MongoDB Atlas UI. Make sure to add your IP address to the IP access list on the Network Access page:

![MongoDB Atlas Network Access page](data/Scheduler/images/scheduler-with-mongodb/mongodb-setup-ip.png)

Next, get your [connection string](https://www.mongodb.com/docs/manual/reference/connection-string/) to the database by following these steps:

- In the MongoDB Atlas UI, go to the **Database** page.
- Click the "Connect" button for the database deployment you want to connect to.

![MongoDB Atlas Database deployments page](data/Scheduler/images/scheduler-with-mongodb/mongodb-setup-connection-string-1.png)

- Select **Drivers** for the connection method.

![MongoDB Atlas connect to cluster](data/Scheduler/images/scheduler-with-mongodb/mongodb-setup-connection-string-2.png)

- Copy your connection string.

![MongoDB Atlas connect with MongoDB driver](data/Scheduler/images/scheduler-with-mongodb/mongodb-connection-string.png)

Add your user password to the connection string (replace the `<password>` placeholder, including the brackets). You can update your user password by going to the **Database Access** page and clicking on the "Edit" button for the user.

![MongoDB Atlas Database Access page](data/Scheduler/images/scheduler-with-mongodb/mongodb-setup-edit-user-password.png)

Add the connection string to your `.env` file as the `ATLAS_URI` variable in your backend Express app. 

Now let's populate the database with example scheduler data using a Node.js seed script.

## Create a Node.js script to populate the MongoDB Atlas database with example data 

In your backend Express app, create a file in the root folder called `insertData.js` and add the following lines of code to it:

```javascript
import { MongoClient } from "mongodb";
import "./loadEnvironment.js";

const connectionString = process.env.ATLAS_URI || "";
const client = new MongoClient(connectionString);
```

We connect to the MongoDB Atlas database cluster using the connection string and the MongoDB driver for Node.js. 

Next, add the following arrays of scheduler data to `insertData.js` that we'll use to populate the database:

```javascript
const resources = [
  { id: 1, name: "Peter" },
  { id: 2, name: "Kate" },
  { id: 3, name: "Winston" },
  { id: 4, name: "Joshua" },
  { id: 5, name: "James" },
  { id: 6, name: "Leanne" },
];

const events = [
  {
    id: 1,
    startDate: "2024-02-19T09:00",
    endDate: "2024-02-19T10:30",
    name: "Conference call",
  },
  {
    id: 2,
    startDate: "2024-02-19T11:30",
    endDate: "2024-02-19T13:00",
    name: "Sprint planning",
  },
  {
    id: 3,
    startDate: "2024-02-19T12:00",
    endDate: "2024-02-19T13:30",
    name: "Team meeting",
  },
  {
    id: 4,
    startDate: "2024-02-19T14:00",
    endDate: "2024-02-19T15:45",
    name: "Client presentation",
  },
  {
    id: 5,
    startDate: "2024-02-19T15:30",
    endDate: "2024-02-19T16:45",
    name: "Project review",
  },
  {
    id: 6,
    startDate: "2024-02-19T17:00",
    endDate: "2024-02-19T18:30",
    name: "Marketing discussion",
  },
  {
    id: 7,
    startDate: "2024-02-19T08:00",
    endDate: "2024-02-19T09:00",
    name: "Breakfast Briefing",
  },
  {
    id: 8,
    startDate: "2024-02-19T16:00",
    endDate: "2024-02-19T17:45",
    name: "Technology Update",
  },
  {
    id: 9,
    startDate: "2024-02-19T14:15",
    endDate: "2024-02-19T15:15",
    name: "HR Update",
  },
  {
    id: 10,
    startDate: "2024-02-19T11:00",
    endDate: "2024-02-19T12:45",
    name: "Financial Planning",
  },
];

const assignments = [
  {
    id: 1,
    eventId: 1,
    resourceId: 1,
  },
  {
    id: 2,
    eventId: 2,
    resourceId: 1,
  },
  {
    id: 3,
    eventId: 3,
    resourceId: 3,
  },

  {
    id: 5,
    eventId: 4,
    resourceId: 3,
  },
  {
    id: 6,
    eventId: 5,
    resourceId: 6,
  },
  {
    id: 7,
    eventId: 6,
    resourceId: 2,
  },
  {
    id: 8,
    eventId: 7,
    resourceId: 4,
  },
  {
    id: 9,
    eventId: 8,
    resourceId: 4,
  },
  {
    id: 10,
    eventId: 9,
    resourceId: 5,
  },
  {
    id: 11,
    eventId: 10,
    resourceId: 5,
  },
];

const dependencies = [
  {
    id: 1,
    from: 1,
    to: 2,
  },
  {
    id: 2,
    from: 3,
    to: 4,
  },
];
```

Add the following variable below the data arrays:

```javascript
const schedulerData = {
  events: {
    rows: events,
  },
  resources: {
    rows: resources,
  },
  assignments: {
    rows: assignments,
  },
  dependencies: {
    rows: dependencies,
  },
};
```

We combine the data into a single object with the required [Bryntum Scheduler load data response structure](https://bryntum.com/products/scheduler/docs/guide/Scheduler/data/crud_manager#load-response-structure). We'll add this data as a single [collection](https://www.mongodb.com/docs/manual/core/databases-and-collections/#collections) in the database so that we can easily get the data required for the Bryntum Scheduler from the database. 

Let's create a function to add this data to the MongoDB Atlas database. Add the following lines of code below the `schedulerData` variable:

```javascript
async function run() {
  try {
    // Connect to the Atlas cluster
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    // Reference the "data" collection in the specified database
    const col = db.collection("data");

    const result = await col.insertOne(schedulerData);
    console.log("Data inserted successfully, document ID:", result.insertedId);
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
```

We first connect to MongoDB using the connection string. We then create a new database and name it using the `DB_NAME` environment variable. Next, we reference the "data" database collection. A collection called "data" is created if there is not already a collection with the same name. We use the [`insertOne`](https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/write-operations/insert/#insert-documents) method to insert the `schedulerData` object into the collection as a single document.

Run the following command to execute this script:

```bash
node insertData.js
```

You should now see the data in your MongoDB Atlas. Navigate to Data Services > Database > Browse Collections.

![MongoDB connections](data/Scheduler/images/scheduler-with-mongodb/browse-collections.png)


Navigate to `bryntum_scheduler` to view the data.

![Example data added to MongoDB Atlas database](data/Scheduler/images/scheduler-with-mongodb/mongodb-added-example-data.png)

Now we'll update the backend API endpoint to get this data.

## Create an API endpoint to load the Bryntum Scheduler data

In the backend app `routes/scheduler.js` file, replace the code in the `/load` GET request handler function with the following lines of code: 

```javascript
  try {
    const collection = db.collection("data");
    const results = await collection.find().toArray();
    res
      .send({
        ...results[0],
      })
      .status(200);
  } catch (error) {
    console.error({ error });
    res.send({
      success: false,
      message: "There was an error loading the resources and events data.",
    });
  }
```

We first get the "data" collection and then call the [`find()`](https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/retrieve/#find-documents) method without any arguments to retrieve all documents in the collection. This method returns a [cursor](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-cursor). We use the [`toArray()`](https://www.mongodb.com/docs/manual/reference/method/cursor.toArray/#mongodb-method-cursor.toArray) method to return an array of all documents from the cursor. 

We return the data as is, as it has the required [Bryntum Scheduler load data response structure](https://bryntum.com/products/scheduler/docs/guide/Scheduler/data/crud_manager#load-response-structure).  

Now we import the `db` instance from the `conn.js` file:

```javascript
import db from "../db/conn.js";
```

We need to set up CORS to allow the frontend app to make requests to the backend. In the `server.js` file, add the following import: 

```javascript
import cors from "cors";
```

Below the `const app = express();` line, add the following lines of code:

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));
```

We use the [`cors`](https://www.npmjs.com/package/cors) library to allow cross-origin resource sharing with the frontend. 

### Update the frontend Bryntum Scheduler Crud Manager to get data from the API endpoint

To get the database data into the Bryntum Scheduler, we need to update the Crud Manager `loadUrl`. In the `main.js` file in your frontend app, change the Bryntum Scheduler's `loadUrl` in the `crudManager` config property to the following:

```javascript
    loadUrl: "http://localhost:5050/api/load",
```

Now run your backend and frontend development servers, and open `http://localhost:1573` in your browser. You'll see your Bryntum Scheduler with data from MongoDB Atlas. 

Next, we'll create an API endpoint to save data changes in the Bryntum Scheduler.

## Create an API endpoint to sync Bryntum Scheduler data changes to the database

We'll use a single API endpoint to save data changes in the Bryntum Scheduler to the database. The Bryntum Scheduler Crud Manager, which we use to fetch data and sync data changes to the backend, combines all changes from the Bryntum Scheduler data stores (events, resources, assignments, and dependencies) into a single HTTP request to prevent data inconsistencies, which can happen if you manage stores separately.

In the `routes/scheduler.js` file, add the following route handler for POST requests to the `api/sync` route: 

```javascript
router.post("/sync", async (req, res) => {
  const { requestId, resources, events, assignments, dependencies } = req.body;
  const collection = db.collection("data");

  let eventMapping = {};

  try {
    const response = { requestId, success: true };

    if (resources) {
      const rows = await applyCollectionChanges(
        "resources",
        resources,
        collection
      )
      // if new data to update client
      if (rows) {
        response.resources = { rows };
      }
    }

    if (events) {
      const rows = await applyCollectionChanges("events", events, collection);
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
      const rows = await applyCollectionChanges(
        "assignments",
        assignments,
        collection
      );
      if (rows) {
        response.assignments = { rows };
      }
    }

    if (dependencies) {
      const rows = await applyCollectionChanges(
        "dependencies",
        dependencies,
        collection
      );
      if (rows) {
        response.dependencies = { rows };
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

Define the `applyCollectionChanges` function at the bottom of the file:

```javascript
async function applyCollectionChanges(store, changes, collection) {
  let rows;
  if (changes.added) {
    rows = await createOperation(changes.added, store, collection);
  }
  if (changes.removed) {
    await deleteOperation(changes.removed, store, collection);
  }
  if (changes.updated) {
    await updateOperation(changes.updated, store, collection);
  }
  // if got some new data to update client
  return rows;
}
```

The Bryntum Scheduler will make a POST request to the `api/sync` endpoint when changes are made to keep the data in the frontend and the database in sync. The POST request route handler gets the store data changes from the request body. 

We call the `applyCollectionChanges` function with the data store name, data changes, and the MongoDB collection instance for the "data" collection. We use the `eventMapping` variable to store the `id` of a newly created event. We use this `id` for the `eventId` value of the assignment created when an event is created.

In the `applyCollectionChanges` function, we check if the change operation is an `added`, `updated`, or `removed` operation, and then call functions to perform these CRUD operations on the MongoDB database "data" collection. Let's define these functions.
 
### Adding data

Add the following `createOperation` function below the `applyCollectionChanges` function:

```javascript
function createOperation(added, store, collection) {
  return Promise.all(
    added.map(async (record) => {
      const { $PhantomId, ...data } = record;

      const id = randomUUID();
      data.id = id;

      // Insert record into the store.rows array
      if (store === "resources") {
        await collection.updateOne({}, { $push: { "resources.rows": data } });
      }
      if (store === "events") {
        await collection.updateOne({}, { $push: { "events.rows": data } });
      }
      if (store === "assignments") {
        await collection.updateOne({}, { $push: { "assignments.rows": data } });
      }
      if (store === "dependencies") {
        await collection.updateOne(
          {},
          { $push: { "dependencies.rows": data } }
        );
      }
      // report to the client that we changed the record identifier
      return { $PhantomId, id };
    })
  );
}
```

We also need to import the `randomUUID` function from the built-in Node.js `crypto` module:
	
```javascript
import { randomUUID } from "crypto";
```

We loop through all the added store objects and add a UUID `id` property to each. We then use the [`updateOne()`](https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/write-operations/modify/) MongoDB Node.js Driver method to update the database collection. We use an update method as we are modifying a single document: The rows array in the store property of the document. We use the [`$push`](https://www.mongodb.com/docs/manual/reference/operator/update/push/) operator for this.

We return the added store item's ID and phantom ID (a unique auto-generated value used to identify a record) so that the Bryntum Scheduler can set the correct ID, generated by the backend, of the added item on the frontend. The phantom ID should not be persisted to the database. The backend should assign new IDs for records.

### Deleting data

Add the following `deleteOperation` function below the `createOperation` function:

```javascript
function deleteOperation(deleted, store, collection) {
  return Promise.all(
    deleted.map(async ({ id }) => {
      if (store === "resources") {
        // MongoDB query to pull (remove) the item from the array
        await collection.updateOne(
          {},
          { $pull: { "resources.rows": { id: id } } }
        );
      }
      if (store === "events") {
        await collection.updateOne(
          {},
          { $pull: { "events.rows": { id: id } } }
        );
      }
      if (store === "assignments") {
        await collection.updateOne(
          {},
          { $pull: { "assignments.rows": { id: id } } }
        );
      }
      if (store === "dependencies") {
        await collection.updateOne(
          {},
          { $pull: { "dependencies.rows": { id: id } } }
        );
      }
    })
  );
}
```

We loop through all the deleted store items and call the `updateOne()` MongoDB Node.js Driver method to delete each one. We use the [`$pull`](https://www.mongodb.com/docs/manual/reference/operator/update/pull/) operator to remove the item from the rows array of the store property in the document.

### Updating data

Add the following `updateOperation` function below the `deleteOperation` function:

```javascript
function updateOperation(updated, store, collection) {
  return Promise.all(
    updated.map(async ({ id, ...data }) => {
      const updateData = {};
      for (const [key, value] of Object.entries(data)) {
        updateData[`${store}.rows.$[elem].${key}`] = value;
      }

      await collection.updateOne(
        {},
        { $set: updateData },
        { arrayFilters: [{ "elem.id": id }] }
      );
    })
  );
}
```

We loop through the updated store items and for each, use the [`updateOne()`](https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/write-operations/modify/) method to update the database collection. The [`$set`](https://www.mongodb.com/docs/manual/reference/operator/update/set/) operator is used to replace the value of a field with the values specified in the `updateData` object. This object uses the filtered positional operator [`$[<identifier>]`](https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/write-operations/embedded-arrays/#matching-multiple-array-elements) to update all array elements for a store's rows array. The [`arrayFilters`](https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/write-operations/embedded-arrays/#matching-multiple-array-elements) object is used to specify which array items to update.

### Update the frontend Bryntum Scheduler Crud Manager sync URL to sync data changes to the sync API endpoint

In your frontend app, add the following properties to the `crudManger` configuration property of the Bryntum Scheduler in the `main.js` file:

```javascript
    syncUrl: "http://localhost:5050/api/sync",
    autoSync: true,
```

We set the URL to sync data changes to, and set the [`autoSync`](https://bryntum.com/products/scheduler/docs/api/Scheduler/crud/AbstractCrudManagerMixin#config-autoSync) property to `true`. Store changes will be sent to the `syncUrl` whenever a store is changed.

When we delete a store record, we need to delete related records in other Bryntum stores. For example, if a resource is deleted, then events assigned to it should also deleted. We do not need to add additional code for this as it's handled by the Crud Manager. 

You now have a Bryntum Scheduler connected to MongoDB Atlas with CRUD functionality:

<video controls width="100%">
<source src="Scheduler/scheduler-basic-data-complete.mp4" type="video/mp4">
Sorry, your browser doesn't support embedded videos.
</video>

Next, we'll show you how you can store your Bryntum Scheduler data in separate MongoDB collections, one for each data store.

## Splitting the data into separate database collections

We'll now show you how to store the data as separate collections in MongoDB, which is a more robust and scalable way of storing data. A collection is the equivalent of a table in a relational database. The multiple-collection structure mimics the structure of a relational database, which can make future migrations easier and simplifies database update queries, which is useful for more complex data. 

We'll model the data for data structure validation using [Mongoose](https://mongoosejs.com/), an object data modeling (ODM) library for MongoDB, and use the Mongoose query methods to update the database.

## Create a Mongoose schema for the data stores

We'll create a Mongoose data model for each Bryntum Scheduler data store. 

First install the Mongoose library in your backend Node.js app:

```bash
npm install mongoose
```

Create a folder called `models` with four JavaScript files for each data store: `resource.js`, `event.js`, `assignment.js`, and `dependency.js`.

### Resource model

Add the following lines of code to the `resource.js` file:

```javascript
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const opts = {
  toJSON: {
    virtuals: true,
    transform: function (_, ret) {
      delete ret._id;
      delete ret.__v;
    },
  },
};

export const resourceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    eventColor: {
      type: String,
      default: null,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  opts
);

const Resource = model("Resource", resourceSchema);

export default Resource;
```

The Mongoose [`Schema`](https://mongoosejs.com/docs/guide.html) defines the shape of documents in a MongoDB collection. The schema keys used are the resource fields for the Bryntum Scheduler [`ResourceModel`](https://bryntum.com/products/scheduler/docs/api/Scheduler/model/ResourceModel).  

Our schema has some options added. We use the [`toJSON`](https://mongoosejs.com/docs/api/document.html#Document.prototype.toJSON()) property to modify data returned from queries to the resource collection that we'll create. Mongoose `virtuals` are properties that are not stored in MongoDB. They are typically used to create computed properties. Setting `virtuals` to `true` creates the virtual `id` property, which has the same value as `_id`. We'll use the `id` property for the Bryntum Scheduler. 

We remove the `_id` and `__v` properties created by MongoDB as we don't need them for the Bryntum Scheduler. MongoDB documents use an `_id` property as a primary key. Mongoose adds the `__v` property to newly created documents. It's the [`versionKey`](https://mongoosejs.com/docs/guide.html#versionKey). 

### Event model

Add the following lines of code to the `event.js` file:

```javascript
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const opts = {
  toJSON: {
    virtuals: true,
    transform: function (_, ret) {
      delete ret._id;
      delete ret.__v;
    },
  },
};

export const eventSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    resourceId: {
      type: Schema.Types.ObjectId, // resourceId refers to an _id in the resources collection
      default: null,
      ref: "Resource",
    },
    timeZone: {
      type: String,
      default: null,
    },
    draggable: {
      type: Boolean,
      default: true,
    },
    resizable: {
      type: String,
      default: null,
    },
    children: {
      type: String,
      default: null,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      default: null,
    },
    durationUnit: {
      type: String,
      default: "day",
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    exceptionDates: {
      type: Schema.Types.Mixed, // Can be either a string (a single date or multiple dates separated by comma) or an array of strings
      default: null,
    },
    recurrenceRule: {
      type: String,
      default: null,
    },
    cls: {
      type: String,
      default: null,
    },
    eventColor: {
      type: String,
      default: null,
    },
    eventStyle: {
      type: String,
      default: null,
    },
    iconCls: {
      type: String,
      default: null,
    },
    style: {
      type: String,
      default: null,
    },
  },
  opts
);

const Event = model("Event", eventSchema);

export default Event;
```

The schema keys used are the event fields for the Bryntum Scheduler [`EventModel`](https://bryntum.com/products/scheduler/docs/api/Scheduler/model/EventModel).  

### Assignment model

Add the following lines of code to the `assignment.js` file:

```javascript
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const opts = {
  toJSON: {
    virtuals: true,
    transform: function (_, ret) {
      delete ret._id;
      delete ret.__v;
    },
  },
};

export const assignmentSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId, // eventId refers to an _id in the events collection
      required: true,
      ref: "Event",
    },
    resourceId: {
      type: Schema.Types.ObjectId, // resourceId refers to an _id in the resources collection
      required: true,
      ref: "Resource",
    },
  },
  opts
);

const Assignment = model("Assignment", assignmentSchema);

export default Assignment;
```

The schema keys used are the assignment fields for the Bryntum Scheduler [`AssignmentModel`](https://bryntum.com/products/scheduler/docs/api/Scheduler/model/AssignmentModel).  


### Dependency model

Add the following lines of code to the `dependency.js` file:

```javascript
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const opts = {
  toJSON: {
    virtuals: true,
    transform: function (_, ret) {
      delete ret._id;
      delete ret.__v;
    },
  },
};

export const dependencySchema = new Schema(
  {
    from: {
      type: Schema.Types.ObjectId, // 'from' refers to an _id in the events collection
      default: null,
      ref: "Event",
    },
    to: {
      type: Schema.Types.ObjectId, // 'to' refers to an _id in the events collection
      default: null,
      ref: "Event",
    },
    fromSide: {
      type: String,
      default: "right",
      enum: ["top", "left", "bottom", "right", "start", "end"],
    },
    toSide: {
      type: String,
      default: "left",
      enum: ["top", "left", "bottom", "right", "start", "end"],
    },
    cls: {
      type: String,
      default: null,
    },
    lag: {
      type: Number,
      default: 0,
    },
    lagUnit: {
      type: String,
      default: "day",
    },
  },
  opts
);

const Dependency = model("Dependency", dependencySchema);

export default Dependency;
```

The schema keys used are the dependency fields for the Bryntum Scheduler [`DependencyModel`](https://bryntum.com/products/scheduler/docs/api/Scheduler/model/DependencyModel).  

We'll now use these models to modify the `insertData.js` database seed script.

### Modify the seed script to populate multiple database collections

First, delete the `bryntum_scheduler` database using the MongoDB Atlas UI:

![MongoDB Atlas UI - delete database button](data/Scheduler/images/scheduler-with-mongodb/delete-db.png)


In the `insertData.js` file in the backend Node.js app, remove the `MongoClient` import and the `client` variable definition. Add the following imports:

```javascript
import mongoose from "mongoose";
import { resourceSchema } from "./models/resource.js";
import { eventSchema } from "./models/event.js";
import { assignmentSchema } from "./models/assignment.js";
import { dependencySchema } from "./models/dependency.js";
```

Delete the `schedulerData` variable and replace it with the following lines of code:

```javascript
// Create new ObjectIds for resources and events
const resourceMap = new Map();
resources.forEach((r) => {
  resourceMap.set(r.id, new mongoose.Types.ObjectId());
  r._id = resourceMap.get(r.id);
});

const eventMap = new Map();
events.forEach((e) => {
  eventMap.set(e.id, new mongoose.Types.ObjectId());
  e._id = eventMap.get(e.id);
});

// Update assignments and dependencies with the new ObjectIds
assignments.forEach((a) => {
  a._id = new mongoose.Types.ObjectId();
  a.eventId = eventMap.get(a.eventId);
  a.resourceId = resourceMap.get(a.resourceId);
});

dependencies.forEach((d) => {
  d._id = new mongoose.Types.ObjectId();
  d.from = eventMap.get(d.from);
  d.to = eventMap.get(d.to);
});
```

We give each data store an `_id` property, which is used as a unique identifier for documents by MongoDB. We use JavaScript [Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) to make sure that the links between data stores use the correct `_id` value.

Now replace the code in the `run()` function with the following lines of code:

```javascript
try {
  // Append the database name before the query parameters in the connection string
  const mongoDB = `${process.env.ATLAS_URI.split("?")[0]}${
    process.env.DB_NAME
  }?${process.env.ATLAS_URI.split("?")[1]}`;
  await mongoose.connect(mongoDB);
  // Define models after establishing the connection
  const DbResource = mongoose.model("Resource", resourceSchema);
  const DbEvent = mongoose.model("Event", eventSchema);
  const DbAssignment = mongoose.model("Assignment", assignmentSchema);
  const DbDependency = mongoose.model("Dependency", dependencySchema);

  await Promise.all([
    DbResource.insertMany(resources),
    DbEvent.insertMany(events),
    DbAssignment.insertMany(assignments),
    DbDependency.insertMany(dependencies),
  ]);

  console.log("Data inserted successfully");
} catch (err) {
  console.error(err.stack);
} finally {
  mongoose.connection.close();
}
```

We first append the database name to the MongoDB Atlas connection string, and then use the Mongoose `connect()` method to connect to the database. We then define models for the data and use Mongoose to perform the database inserts.

We use the [`insertMany()`](https://mongoosejs.com/docs/api/model.html#Model.insertMany()) method to add the example store data to the database. 

Run the script using the following command:

```bash
node insertData.js
```

You'll see the data added as different collections in MongoDB Atlas:

![Inserted collections data in MongoDB Atlas](data/Scheduler/images/scheduler-with-mongodb/multiple-collections.png)

Now let's update the backend to connect to MongoDB using Mongoose.

## Update the backend to connect to MongoDB using Mongoose

In the `server.js` file, add the following import:

```javascript
import mongoose from "mongoose";
```

Now add the following lines of code below the `const app = express();` line:

```javascript
// Append the database name before the query parameters in the connection string
const mongoDB = `${process.env.ATLAS_URI.split("?")[0]}${process.env.DB_NAME}?${
  process.env.ATLAS_URI.split("?")[1]
}`;

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoDB);
}
```

We connect to MongoDB using the connection string and the Mongoose `connect()` method.

Now let's update the API endpoints.

## Update the API endpoints

We'll use the Mongoose data models and Mongoose query methods to get data and sync data changes to the database.

### Getting data

Delete the `db` and `randomUUID` imports in the `routes/scheduler.js` file. Also delete the `const collection = db.collection("data");` line from the `/sync` route.

Now add the following data model imports:

```javascript
import Resource from "../models/resource.js";
import Event from "../models/event.js";
import Assignment from "../models/assignment.js";
import Dependency from "../models/dependency.js";
```

In the `/load` GET request handler function, replace the code in the `try` block with the following lines of code:

```javascript
    const resourcesPromise = Resource.find();
    const eventsPromise = Event.find();
    const assignmentsPromise = Assignment.find();
    const dependenciesPromise = Dependency.find();
    const [resources, events, assignments, dependencies] = await Promise.all([
      resourcesPromise,
      eventsPromise,
      assignmentsPromise,
      dependenciesPromise,
    ]);
    res
      .send({
        resources: { rows: resources },
        events: { rows: events },
        assignments: { rows: assignments },
        dependencies: { rows: dependencies },
      })
      .status(200);
```

We get the data from the collections using the Mongoose model's [`find()`](https://mongoosejs.com/docs/api/query.html#Query.prototype.find()) method, which returns an array of all of the documents in a collection. 

### Syncing data

In the `routes/scheduler.js` file, remove the third argument, `collection`, from the following function definitions and their function calls:

- `applyCollectionChanges`
- `createOperation`
- `deleteOperation`
- `updateOperation`

Also remove the `collection` variable definition from the "/sync" POST route.

### Adding data

In the `createOperation` function, replace the code in the map callback function with the following lines of code:

```javascript
      const { $PhantomId, ...data } = record;
      let id;
      // Insert record into the store.rows array
      if (store === "resources") {
        const resource = await Resource.create(data);
        id = resource.id;
      }
      if (store === "events") {
        const event = await Event.create(data);
        id = event.id;
      }
      if (store === "assignments") {
        const assignment = await Assignment.create(data);
        id = assignment.id;
      }
      if (store === "dependencies") {
        const dependency = await Dependency.create(data);
        id = dependency.id;
      }
      // report to the client that we changed the record identifier
      return { $PhantomId, id };
```

We use the Mongoose [`create()`](https://mongoosejs.com/docs/api/model.html#Model.create()) method to create a MongoDB document in the collection for the data store model.

### Deleting data

In the `deleteOperation` function, replace the code in the map callback function with the following lines of code:

```javascript
      if (store === "resources") {
        await Resource.findByIdAndDelete(id);
      }
      if (store === "events") {
        await Event.findByIdAndDelete(id);
      }
      if (store === "assignments") {
        await Assignment.findByIdAndDelete(id);
      }
      if (store === "dependencies") {
        await Dependency.findByIdAndDelete(id);
      }
```

We use the Mongoose [`findByIdAndDelete()`](https://mongoosejs.com/docs/api/model.html#Model.findByIdAndDelete()) method to delete a MongoDB document in a collection using the document's `_id` field. The function call `findByIdAndDelete(id)` is shorthand for `findOneAndDelete({ _id: id })`.

### Updating data

In the `updateOperation` function, replace the code in the map callback function with the following lines of code:

```javascript
      if (store === "resources") {
        await Resource.findByIdAndUpdate(id, data);
      }
      if (store === "events") {
        await Event.findByIdAndUpdate(id, data);
      }
      if (store === "assignments") {
        await Assignment.findByIdAndUpdate(id, data);
      }
      if (store === "dependencies") {
        await Dependency.findByIdAndUpdate(id, data);
      }
```

We use the Mongoose [`findByIdAndUpdate()`](https://mongoosejs.com/docs/api/model.html#Model.findByIdAndUpdate()) method to update a MongoDB document in a collection using the document's `_id` field. The `id` parameter is the `_id` value of the document to update.

Your Bryntum Scheduler will now have full CRUD functionality and use multiple database collections to store data. 

## Using a single database collection vs. using multiple database collections

At the start of this tutorial, we showed you how to use a single database collection to store Bryntum Scheduler data. This approach needs no data model validation, so setup and getting data from the database is fairly straightforward. Without data structure validation, you can add any data to the database, and this flexibility may be useful when prototyping a project. We stored the data in MongoDB in the format expected by Bryntum Scheduler and used the MongoDB Node.js driver to connect to MongoDB and query data from it, so there was no need for a third-party library like Mongoose.

Next we showed you how to change the database, database seed script, and API endpoints to store each Bryntum Scheduler data store in a separate database collection and validate the data structure using Mongoose.

Simple scheduler data can be stored as a single object, but this approach makes create, update, and delete operations more complex. In this example, we had to update nested arrays, and these update functions are less easy to understand and modify than the create, read, and update functions for updating different collections using Mongoose.

Splitting the data up into collections and using Mongoose makes updating data easier and allows you to validate the structure of your data. The structure of the multiple-collection database more closely resembles the structure of a relational database, so this approach makes database migrations from and to a relational database easier. 

Using a single object is good for quick development and flexibility, but the trade-off is less scalability and lack of data validation. Using multiple collections is better for scalability, maintainability, and ease of migration.


<p class="last-modified">Last modified on 2026-07-22 10:39:14</p>