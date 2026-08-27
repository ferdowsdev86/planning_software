# How to use Grid with Express and SQLite

Bryntum Grid is a feature-rich JavaScript component that integrates with any backend technology. 

This guide will show you how to use [Express](https://expressjs.com/) to manage communication with a 
[SQLite](https://www.sqlite.org/) database. We'll use the open-source [Sequelize ORM](https://sequelize.org/) to 
generate database queries.

We'll do the following:

- Clone the starter GitHub repository for this guide. The starter code will contain JSON example data and code for an 
Express server.
- Create a Sequelize model to define the structure of the database table.
- Create a Node.js seed script to populate the database with example JSON data.
- Create API endpoints to load data and sync data changes to the database.
- Create a Bryntum Grid frontend using statically served HTML, CSS, and JavaScript files.
- Configure the Bryntum Grid to load data from the database and synchronize changes to the database using the created 
API endpoints.

We'll build this application:

![Bryntum Grid app](data/Grid/images/integration/backends/express/complete-app-cover.png)

## Prerequisites

To follow along, you need [Node.js](https://nodejs.org/en/download) installed on your system. 

## Getting Started

We'll use an existing Express.js project as a starting point. Clone 
the [Express.js starter repository](https://github.com/bryntum/bryntum-grid-express-sqlite-starter). 
The completed code of this guide is on the `complete-app` branch.

The starter code has the following directory structure:

- `initialData`: Contains example data in the `players.json` file to populate the Bryntum Grid.
- `public`: We'll add the static HTML, CSS, and JavaScript files to this folder to make the Bryntum Grid frontend.
- `server.js`: Contains configuration to start the Express server and serves the files from the `public` directory. 

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
perform CRUD operations. We'll also use Sequelize to model the Bryntum Grid data. 
A [Sequelize model](https://sequelize.org/docs/v6/core-concepts/model-basics/) is an abstraction that represents a 
table in your database.

Install Sequelize and the driver for SQLite using the following command:

```bash
npm install sequelize sqlite3
```

Sequelize supports [multiple databases](https://sequelize.org/releases/), so you need to manually install the database 
driver for the database that you use. The database driver is the code Sequelize uses to communicate with the database. 

We'll now create a Sequelize instance so that we can create and connect to a SQLite database.

Create a `config` folder in the project root directory and a `database.js` file inside it. Add the following lines of 
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
We set the type of database we'll connect to and the SQLite-only `storage` property. The database file will be 
named `database.sqlite3` and stored in the root directory.

## Create the data models

When using Sequelize, creating a [model](https://sequelize.org/docs/v6/core-concepts/model-basics/) is essential. A 
model is an abstraction that represents a table in your database. The model sets the name of the table in the 
database, the columns it has, and the data types of the columns. 

We'll define a model for player example data. In Bryntum Grid, data is kept in 
the [ColumnStore](https://bryntum.com/products/grid/docs/api/Grid/data/ColumnStore). 

### Create the `Player` model

Create a folder called `models` in the root directory. Create a file called `Player.js` in this folder and add the 
following lines of code to it:

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Player = sequelize.define(
    'Player',
    {
        id : {
            type          : DataTypes.INTEGER,
            primaryKey    : true,
            autoIncrement : true
        },
        name : {
            type      : DataTypes.STRING,
            allowNull : true
        },
        city : {
            type      : DataTypes.STRING,
            allowNull : true
        },
        team : {
            type      : DataTypes.STRING,
            allowNull : true
        },
        score : {
            type         : DataTypes.FLOAT,
            defaultValue : 0
        },
        percentage_wins : {
            type         : DataTypes.FLOAT,
            defaultValue : 0,
            max          : 100
        }
    },
    {
        tableName  : 'players',
        timestamps : false
    }
);

export default Player;
```

We define the `Player` model using 
the [`define`](https://sequelize.org/api/v6/class/src/sequelize.js~Sequelize.html#instance-method-define) method of 
the Sequelize instance that we created in the `config/database.js` file. This model represents the table called 
"players" in the database. The table name is set using the `tableName` property. 

The model attributes define the columns for the database table. 
We set the [data types](https://sequelize.org/docs/v6/core-concepts/model-basics/#data-types) of the columns for each 
model attribute, and import the [`DataTypes`](https://github.com/sequelize/sequelize/blob/v6/src/data-types.js) object 
to use the built-in Sequelize data types.

## Populate the SQLite database with example data

Let's create a Node.js script to create a SQLite database file and populate it with the example JSON data in 
the `initialData` directory. 

Create a file called `addExampleData.js` in the root directory and add the following lines of code to it: 

```javascript
import { readFileSync } from 'fs';
import sequelize from './config/database.js';
import Player from './models/Player.js';

async function setupDatabase() {
    // Wait for all models to synchronize with the database.
    // This will create the tables on the first run 
    // and have no effect on subsequent runs.
    await sequelize.sync();

    // Now add example data
    await addExampleData();
}

async function addExampleData() {
    try {
        // Read and parse the JSON data
        const playersData = JSON.parse(readFileSync('./initialData/players.json'));

        await sequelize.transaction(async(t) => {
            const players = await Player.bulkCreate(playersData, { transaction : t });
            return { players };
        });

        console.log('Players data added to database successfully.');
    }
    catch (error) {
        console.error('Failed to add data to database due to an error: ', error);
    }
}

setupDatabase();
```

The Sequelize instance is configured to connect to a SQLite database in the `/config/database.js` file. Here, we use 
the instance to create and populate the database with the asynchronous `setupDatabase` function. 

First we call the `sequelize.sync()` method to create a database table if it doesn't already exist for the data model. 
Then we add the example data to the database using the `addExampleData` function, which reads the JSON data files in 
the `initialData` folder using the `readFileSync` method of the Node.js File System module.

The Sequelize [`transaction`](https://sequelize.org/docs/v6/other-topics/transactions/) method performs 
a [database transaction](https://en.wikipedia.org/wiki/Database_transaction). 
Within the transaction, we use 
the [`bulkCreate`](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#creating-in-bulk) 
method to create multiple records using a single database query.

Now run this Node.js script using the following command:

```bash
node addExampleData.js
```

You should see a `database.sqlite3` file created in your root folder. This database is populated with the example 
player data.

Note that by default, Sequelize will log every SQL query it performs in your terminal. Learn more about logging in 
the [Sequelize docs](https://sequelize.org/docs/v6/getting-started/#logging).

We don't need the SQLite command-line tools to execute SQL statements from the terminal for this tutorial but they can
 be useful. The SQLite command-line tools should already be installed on your system if you use macOS. If you're using 
other operating systems like Windows, you can download the bundle of tools from 
the [SQLite download page](https://www.sqlite.org/download.html) and add the SQLite directory (the path with 
the `sqlite3` executable file) to your computer's 
[PATH system variable](https://www.java.com/en/download/help/path.html).

Let's create an API endpoint to get the data from our database.

## Create an API endpoint to load the Bryntum Grid data from the database

In the `server.js` file, below the `app.use(bodyParser.json());` line, add the following `/read` API GET request 
route definition:

```javascript
app.get('/read', async(req, res) => {
    try {
        const players = await Player.findAll();

        res.send({
            success : true,
            data    : players
        });
    }
    catch (error) {
        res.send({
            success : false,
            message : 'Players data could not be read.'
        });
    }
});
```

We use the Sequelize [`findAll`](https://sequelize.org/docs/v6/core-concepts/model-querying-finders/#findall) method 
on the `Player` model to retrieve the records from the corresponding `players` table in the SQLite database. 
We then return the data using 
the [remote data structure](https://bryntum.com/products/grid/docs/guide/Grid/data/displayingdata#using-remote-data) 
expected by the Bryntum Grid. 

Now we need to import the Sequelize models we created. Add the following imports to the top of the `server.js` file:

```javascript
import Player from './models/Player.js';
import sequelize from './config/database.js';
```

Run the development server if it's not already running:

```bash
npm start
```

Open `http://localhost:1337/read` in your browser. You should see a JSON object of the 
players data from the SQLite database:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dan Jones",
      "city": "Los Angeles",
      "team": "Stockholm Eagles",
      "score": 430,
      "percentage_wins": 30
    },
    // ...
```

Next we'll create an API endpoint to keep data in the database in sync with data changes in the frontend UI.

## Create an API endpoint to sync Bryntum Grid data changes to the database

Below the `/read` API GET request route definition in the `server.js` file, add the following `/create` API POST 
request route definition to send any new player data entered on the frontend to the backend:

```javascript
app.post('/create', async(req, res) => {
    try {
        const playersData = req.body.data.map(player => {
            const { id, ...fields } = player;
            return fields;
        });
        const newPlayers = await Player.bulkCreate(playersData);
        res.send({ success : true, data : newPlayers });
    }
    catch (error) {
        console.error(error);
        res.send({
            success : false,
            message : 'Players could not be created.'
        });
    }
});
```

The Express app uses the `bodyParser.json()` method from the `body-parser` library so that the `/create` API route 
can handle JSON data. The Bryntum Grid we create and configure on the frontend will send JSON data in POST requests to 
this `/create` API route when new player information is added to the Grid. 

Now define the `/update` endpoint for updating a player's information in the database using a PATCH request. 
Add the following code below the POST request:

```javascript
app.patch('/update', async(req, res) => {
    try {
        const playersData = req.body.data;
        const updatedPlayers = [];

        await sequelize.transaction(async(t) => {
            for (const data of playersData) {
                const itemId = data.id;
                const [updated] = await Player.update(data, {
                    where       : { id : itemId },
                    transaction : t
                });

                if (updated) {
                    const updatedPlayer = await Player.findOne({
                        where       : { id : itemId },
                        transaction : t
                    });
                    updatedPlayers.push(updatedPlayer);
                }
                else {
                    throw new Error(`Player with id ${itemId} could not be found.`);
                }
            }
        });

        res.send({ success : true, data : updatedPlayers });
    }
    catch (error) {
        console.error(error);
        res.send({
            success : false,
            message : 'Error updating player records.'
        });
    }
});
```

We use the Sequelize [`update`](https://sequelize.org/docs/v6/core-concepts/model-instances/#updating-an-instance) 
method to update the database records. 

Finally, define the `/delete` endpoint below the PATCH request:

```javascript
app.delete('/delete', async(req, res) => {
    try {
        const { ids } = req.body;

        // Perform the delete operations in a single transaction
        await sequelize.transaction(async(t) => {
            // Delete players whose ID is in the ids array
            await Player.destroy({
                where       : { id : ids },
                transaction : t
            });
        });

        res.send({ success : true });
    }
    catch (error) {
        console.error(error);
        const message = 'Could not delete selected player record(s)';
        res.send({
            success : false,
            message
        });
    }
});
```

We use the Sequelize [`destroy`](https://sequelize.org/docs/v6/core-concepts/model-instances/#deleting-an-instance) 
method to delete the database records. 

Now that the API endpoints have been added, let's set up our frontend Bryntum Grid.

## Set up the frontend

Install the Bryntum Grid component by following [this guide](https://bryntum.com/products/grid/docs/guide/Grid/quick-start/javascript-npm#install-component) in our docs.

To use the Bryntum Grid component module code in the frontend, add the following line of code to the top of 
the `server.js` file, above the `app.use(bodyParser.json());` line:

```javascript
app.use(express.static(path.join(__dirname, '/node_modules/@bryntum/grid')));
```

We'll now create the static HTML, CSS, and JavaScript files that will be sent to the browser from the backend.

### Create the HTML page to display the Bryntum Grid

Create a file called `index.html` in the `public` folder and add the following lines of code to it:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <link rel="icon" type="image/png" href="/bryntum.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>How to use Bryntum Grid with Express and SQLite</title>
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Poppins" />
    <!-- Structural CSS -->
    <link rel="stylesheet" href="./grid.css">
    <!-- Bryntum theme of your choice -->
    <link rel="stylesheet" href="./svalbard-light.css" data-bryntum-theme>
    <link rel="stylesheet" href="./style.css">
    <script type="module" src="./index.js" defer></script>
  </head>
  <body>
   <div id="app"></div>
</body>
</html>
```

The Bryntum Grid will be appended to the `<div>` with an `id` of `"app"`. Stylesheets are added 
for the [Bryntum Grid theme](https://bryntum.com/products/grid/docs/guide/Grid/customization/styling#using-a-theme) 
and the CSS file we'll create. There's also a `<script>` tag for the JavaScript file that we'll use to configure the 
Bryntum Grid. 

### Create the Bryntum Grid

Create a file called `index.js` in the public folder and add the following instantiation of `AjaxStore` to it:

```javascript
import { AjaxStore, Grid, StringHelper } from './grid.module.js';

const store = new AjaxStore({
    createUrl  : '/create',
    readUrl    : '/read',
    updateUrl  : '/update/',
    deleteUrl  : '/delete/',
    autoLoad   : true,
    autoCommit : true,

    useRestfulMethods : true,
    httpMethods       : {
        read   : 'GET',
        create : 'POST',
        update : 'PATCH',
        delete : 'DELETE'
    }
});
```

Below the `store` instantiation, add a new player counter and create a new `grid` instance with toolbar configuration:

```javascript
let newPlayerCount = 0;

const grid = new Grid({
    appendTo : 'app',
    features : {
        filter  : true,
        stripe  : true,
        summary : true
    },

    tbar : [
        {
            type  : 'buttongroup',
            items : [
                {
                    type     : 'button',
                    ref      : 'addButton',
                    color    : 'b-green',
                    icon     : 'fa-plus-circle',
                    margin   : '0 8 0 0',
                    text     : 'Add',
                    tooltip  : 'Adds a new row (at bottom)',
                    onAction : () => {
                        const counter = ++newPlayerCount,
                            added = grid.store.add({
                                name : `New player ${counter}`,
                                cls  : `new_player_${counter}`
                            });

                        grid.selectedRecord = added[0];
                    }
                },
                {
                    type     : 'button',
                    ref      : 'removeButton',
                    color    : 'b-red',
                    icon     : 'fa fa-trash',
                    text     : 'Remove',
                    tooltip  : 'Removes selected record(s)',
                    onAction : () => {
                        const selected = grid.selectedRecords;
                        if (selected && selected.length) {
                            const store = grid.store,
                                nextRecord = store.getNext(selected[selected.length - 1]),
                                prevRecord = store.getPrev(selected[0]);

                            store.remove(selected);
                            grid.selectedRecord = nextRecord || prevRecord;
                        }
                    }
                }
            ]
        },
        {
            type     : 'button',
            ref      : 'removeAll',
            text     : 'Remove all filters',
            margin   : '0 5',
            onAction : () => store.clearFilters()
        },
        {
            type        : 'button',
            ref         : 'readOnlyButton',
            text        : 'Read-only',
            tooltip     : 'Toggles read-only mode on grid',
            toggleable  : true,
            icon        : 'fa-square',
            pressedIcon : 'fa-check-square',
            onToggle    : ({ pressed }) => {
                addButton.disabled = grid.readOnly = pressed;
                removeButton.disabled = pressed || !grid.selectedRecords.length;
            }
        },
        {
            type       : 'button',
            text       : 'Sum selected rows',
            margin     : '0 auto',
            toggleable : true,
            onToggle   : 'up.onSelectToggle'
        }
    ],

    store
});
```

In the above code, the Bryntum Grid attaches to the `<div>` element with an `id` of `"app"`. Below that, we 
add [buttons](https://bryntum.com/products/grid/docs/api/Core/widget/ButtonGroup) with handlers to add a new record, 
remove selected records, remove all filters, and toggle read-only mode. The data `store` is then passed in as a 
configuration option.

Configure the grid columns with an array of options defined for each column. Add the following code in the `grid` 
configuration object below the `store` line of the previous code snippet:

```javascript
    columns : [
        { type : 'rownumber' },
        {
            text   : 'Name (custom filter: whole words)',
            field  : 'name',
            width  : 260,
            editor : {
                type     : 'textfield',
                required : true
            },
            // This column has a custom filtering function that matches whole words.
            filterable : ({ value, record }) =>
                Boolean(record.name.match(new RegExp(`${value}\\b`, 'i'))),
            sum             : 'count',
            summaryRenderer : ({ sum }) => `Total: ${sum}`
        },
        {
            text  : 'City',
            field : 'city',
            width : 200,
            sum   : (result, current, index) => {
                if (index === 0) {
                    result = {};
                }

                const city = current.city;
                if (!Object.prototype.hasOwnProperty.call(result, city)) {
                    result[city] = 1;
                }
                else {
                    ++result[city];
                }

                return result;
            },
            summaryRenderer : ({ sum }) => {
                let value = 0,
                    mostPopularCity = '';

                Object.keys(sum).forEach((key) => {
                    if (value < sum[key]) {
                        value = sum[key];
                        mostPopularCity = key;
                    }
                });

                return StringHelper.xss`Most entries: ${mostPopularCity} (${value})`;
            }
        },
        {
            text  : 'Team',
            field : 'team',
            width : 250,
            sum   : (result, current, index) => {
                if (index === 0) {
                    result = {};
                }

                const team = current.team;
                if (!Object.prototype.hasOwnProperty.call(result, team)) {
                    result[team] = 1;
                }
                else {
                    ++result[team];
                }

                return result;
            },
            summaryRenderer : ({ sum }) => {
                let value = 0,
                    mostPopularTeam = '';

                Object.keys(sum).forEach((key) => {
                    if (value < sum[key]) {
                        value = sum[key];
                        mostPopularTeam = key;
                    }
                });

                return StringHelper.xss`Most entries: ${mostPopularTeam} (${value})`;
            }
        },
        {
            type      : 'number',
            text      : 'Score',
            field     : 'score',
            width     : 100,
            // Using built-in summary calculations
            summaries : [
                { sum : 'min', label : 'Min' },
                { sum : 'max', label : 'Max' }
            ]
        },
        {
            type   : 'percent',
            text   : 'Percent wins',
            field  : 'percentage_wins',
            width  : 200,
            editor : {
                type : 'number',
                min  : 0,
                max  : 100
            },
            sum             : 'average',
            summaryRenderer : ({ sum }) => `Average: ${Math.round(sum)}%`
        }
    ],
    onSelectToggle() {
        this.features.summary.selectedOnly = !this.features.summary.selectedOnly;
    }
```

We add a column for displaying the 
[`rownumber`](https://bryntum.com/products/grid/docs/api/Grid/column/RowNumberColumn) and the `Name`, `City`, `Team`, 
`Score`, and `Percent wins` columns with summary rows. We use `summaryRenderer` as a property to dynamically display 
the value the summary row receives.

The `onSelectToggle` function toggles whether the summary calculations include all or only the selected rows.

Add the follwing line to the bottom of the file.

```javascript
const { addButton, removeButton } = grid.widgetMap;
```

We use a [`widgetMap` object](https://bryntum.com/products/grid/docs/api/Core/widget/Container#property-widgetMap) 
to refer to the add and remove buttons for easy access.

### Adding styles

By default, the Bryntum Grid component is configured to take `100%` of the parent DOM element with a `min-height` 
of `10em`.

To make the Bryntum Grid take up the full height of the screen, we need to add some CSS styles. Create a `style.css` 
file in the `/public` directory and add the following styles to it:

```css
body,
html {
    font-family: Poppins, "Open Sans", Helvetica, Arial, sans-serif;
}

fa {
    font-family: 'Font Awesome 6 Free', serif;
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

Open `http://localhost:1337/` in your browser, and you'll see a Bryntum Grid with the example 
data from the local SQLite database:

![Bryntum Grid with CRUD functionality](data/Grid/images/integration/backends/express/complete-app.gif)

The Bryntum Grid has CRUD functionality, and any changes made to it will be saved to the database.

## Next steps

This tutorial covers the basics of using Bryntum Grid using Express and SQLite. Take a look at 
the [Bryntum Grid examples page](https://bryntum.com/products/grid/examples/) to see additional features you can add 
to your Grid, such as:

- [Export to Excel](https://bryntum.com/products/grid/examples/exporttoexcel/)
- [Facet filtering](https://bryntum.com/products/grid/examples/facet-filter/)
- [Merge cells](https://bryntum.com/products/grid/examples/merge-cells/)


<p class="last-modified">Last modified on 2026-07-22 10:39:04</p>