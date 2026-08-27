# Migrate from Handsontable to Bryntum Grid

[Bryntum Grid](https://bryntum.com/products/grid/) is a feature-rich JavaScript table component that's part of
Bryntum's suite of components for project and resource management.
[Handsontable](https://handsontable.com/) is a JavaScript table component with a focus on spreadsheet-like
functionality. Our blog post,
[The best JavaScript data grids in 2025](https://bryntum.com/blog/the-best-javascript-data-grids-in-2025/), compared
Bryntum Grid to four other popular JavaScript table libraries, including Handsontable. It showed that Bryntum Grid
had a better feature set than Handsontable. Handsontable's standout feature is its spreadsheet-like functionality,
which includes hundreds of built-in formulas. If you need advanced features like
[AI integration](#Grid/guides/advanced/ai-integration.md),
[lazy loading](#Grid/guides/data/lazyloading.md), and
[charts integration](#Grid/feature/Charts), Bryntum Grid is a better choice.

In this guide, we'll show you how to migrate from Handsontable to Bryntum Grid. We'll do the following:

- Set up a demo Handsontable starter project with a frontend that uses React and a separate backend that uses
  Express.js, SQLite, and [Sequelize ORM](https://sequelize.org/).
- Create an API endpoint for a Bryntum Grid to get data from the SQLite database.
- Create API endpoints for creating, updating, and deleting data.
- Add the Bryntum Grid to the frontend.
- Test the migration implementation.

You can find the code for this guide in our GitHub repositories:

- [Handsontable React wrapper starter project](https://github.com/bryntum/handsontable-migration-bryntum-grid-frontend-starter) 
- [Handsontable Express server starter project](https://github.com/bryntum/handsontable-migration-bryntum-grid-backend-starter)

The `completed-migration` branch of each repository has the completed code for this guide.

## Setting up the Handsontable starter project

The starter Handsontable app has CRUD functionality. It consists of a frontend and a separate backend:

- Frontend: TypeScript React Hansontable app.
- Backend: Express.js app with CRUD API endpoints for the frontend Hansontable app. It uses a local SQLite database and 
  Sequelize ORM.

The frontend is a modified version of Handsontable's 
[React wrapper demo](https://github.com/handsontable/handsontable/tree/develop/examples/next/docs/react-wrapper). The 
styling was modified and CRUD functionality was added. The official 
[Handsontable React wrapper](https://www.npmjs.com/package/@handsontable/react-wrapper) npm library was used to create 
the Hansontable component. The main Handsontable component is called `HotTable`. The Handsontable's 
[configuration options](https://handsontable.com/docs/react-data-grid/configuration-options) are set using HotTable's 
props. 

The Handsontable demo uses Create React App, which is deprecated. We left it in this guide for simplicity. You can 
switch to [Vite](https://vite.dev/), which is a better build tool for modern React applications. Take a look at our 
[Bryntum Grid React starter guide](#Grid/guides/quick-start/react.md) to see how to get set up with Vite.

The backend is an Express server for the Handsontable frontend app. It has four API endpoints in the `server.js` file:

- `/api/products` for loading data.
- `/api/products/save` for saving data.
- `/api/products/create` for creating data.
- `/api/products/delete` for deleting data.

The backend uses a local SQLite database and Sequelize, which is a Node ORM. The `example-data` folder contains example 
products data for seeding the database. The `models` folder has a Sequelize data 
[model](https://sequelize.org/docs/v6/core-concepts/model-basics/), which represents a products table in the database.

### Setting up the frontend

Clone the [Handsontable React wrapper starter project](https://github.com/bryntum/handsontable-migration-bryntum-grid-frontend-starter) 
then install the dependencies:

```sh
npm install
```

Now run the local development server:

```sh
npm run start
```

Open `http://localhost:8080` in your browser, you'll see an empty Hansontable:

![Empty Hansontable](data/Grid/images/migration/migrate-from-handsontable-to-bryntum/frontend-initial.png)

### Setting up the backend server and populating a local SQLite database with example data 

Clone the [Handsontable Express server starter project](https://github.com/bryntum/handsontable-migration-bryntum-grid-backend-starter) 
then install the dependencies:

```sh
npm install
```

Seed the database with the example data in the `example-data` folder:

```shell
npm run seed
```

This runs the `addExampleData.js` script, which populates a local SQLite database with the example data.

Run the local development server using the following command:

```shell
npm run dev
```

The server will listen on `http://localhost:3000`.

Open the frontend app in your browser at `http://localhost:8080`. You'll see the example data in the Hansontable:

![Hansontable with example data](data/Grid/images/migration/migrate-from-handsontable-to-bryntum/hansontable-example-data.png)

The table has CRUD functionality. You can add, edit, and delete rows.

## Creating new API endpoints for the Bryntum Grid

For this migration, we can use the database used by Handsontable as is. For migrations with other Bryntum products, 
you'll probably need to do a database migration. Take a look at our 
[Syncfusion to Bryntum guides](https://bryntum.com/blog/migrate-from-syncfusion-to-bryntum-with-our-step-by-step-guides/) 
to learn more about database migration.

Bryntum Grid's [AjaxStore](#Grid/guides/data/ajaxstore.md), which we'll use to fetch data from and sync data changes
to the backend, handles CRUD operations with a specific request and response structure. The API endpoints need to
follow this structure for proper communication between the frontend and backend.

In the backend `server.js` file, add the following GET request API route handler:

```js
app.get('/api/read', async(req, res) => {
    try {
        const products = await Product.findAll({
            order: [['sparseIndex', 'ASC']]
        });
        res.status(200).json({
            success: true,
            data: products
        });
    }
    catch (error) {
        console.error({ error });
        res.status(500).json({
            success: false,
            message: 'There was an error loading the products data.'
        });
    }
});
```

This API route handles fetching the products data from the SQLite database using the Sequelize
[`findAll`](https://sequelize.org/docs/v6/core-concepts/model-querying-finders/#findall) method. The queried data is
sorted by `sparseIndex` in ascending order. The `sparseIndex` field is used by Bryntum's
[`useSparseIndex`](#Core/data/mixin/StoreSparseIndex#config-useSparseIndex) feature to maintain row order without
needing to re-index all records when rows are inserted or reordered.

Add the following POST request API route handler for creating new products:

```js
app.post('/api/create', async(req, res) => {
    try {
        const { data } = req.body;

        if (!data || data.length === 0) {
            return res.status(400).json({ success: false, message: 'No data provided' });
        }

        // Remove generated IDs from products
        const productsToCreate = data.map(product => {
            const { id, ...productData } = product; // Remove phantom id if present
            return productData;
        });
        const createdProducts = await Product.bulkCreate(productsToCreate);

        res.status(201).json({
            success: true,
            data: createdProducts
        });
    }
    catch (error) {
        console.error({ error });
        res.status(500).json({
            success: false,
            message: 'There was an error creating the products.'
        });
    }
});
```

This endpoint handles creating new products in the database. Bryntum Grid sends new records in a `data` array. The
handler removes any phantom IDs (temporary IDs generated by the frontend) before creating records using Sequelize's
[`bulkCreate`](https://sequelize.org/docs/v6/other-topics/upgrade/#modelbulkcreate) method, which lets you create
multiple records at once. The `sparseIndex` value is included in the record data and persisted to the database. The
response includes the newly created products with their database-generated IDs.

Add the following PATCH request API route handler for updating existing products:

```js
app.patch('/api/update', async(req, res) => {
    try {
        const { data } = req.body;

        if (!data || data.length === 0) {
            return res.status(400).json({ success: false, message: 'No data provided' });
        }

        // Use a transaction for atomicity
        const updatedProducts = await sequelize.transaction(async (t) => {
            const results = [];

            for (const product of data) {
                const { id, ...fields } = product;

                await Product.update(fields, {
                    where: { id },
                    transaction: t
                });

                // Fetch the updated product to return
                const updated = await Product.findByPk(id, { transaction: t });
                results.push(updated);
            }

            return results;
        });

        res.status(200).json({
            success: true,
            data: updatedProducts
        });
    }
    catch (error) {
        console.error({ error });
        res.status(500).json({
            success: false,
            message: 'There was an error updating the products.'
        });
    }
});
```

This endpoint updates products in the database. The handler uses a Sequelize 
[transaction](https://sequelize.org/docs/v6/other-topics/transactions/) to ensure all updates succeed or fail together. 
For each product in the `data` array, it updates the record and fetches the updated product to return in the response.

Now add the following DELETE request API route handler for deleting products:

```js
app.delete('/api/delete', async(req, res) => {
    try {
        // Bryntum sends ids in the request body
        const { ids } = req.body;

        if (!ids || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'No IDs provided' });
        }

        // Delete products by their IDs
        const deletedCount = await Product.destroy({
            where: {
                id: ids
            }
        });

        // Return the deleted IDs
        const deletedRecords = ids.map(id => ({ id }));

        res.status(200).json({
            success: true,
            data: deletedRecords
        });
    }
    catch (error) {
        console.error({ error });
        res.status(500).json({
            success: false,
            message: 'There was an error deleting the products.'
        });
    }
});
```

This endpoint deletes products from the database. Bryntum Grid sends an array of IDs in the request body. The handler 
uses Sequelize's [`destroy`](https://sequelize.org/docs/v6/core-concepts/model-instances/#deleting-an-instance) method 
to remove the products and returns the deleted IDs in the response.

Now that the backend API endpoints are ready, let's update the frontend to use a Bryntum Grid React component.

## Updating the frontend to use a React Bryntum Grid component

We'll start by installing the Bryntum Grid React component. Before you can install it, you first need to 
[access and log in to the Bryntum npm registry](#Grid/guides/npm-repository.md).

Bryntum components are licensed commercial products, but you can use the free trial version of Bryntum Grid for this 
tutorial.

If you’re installing the trial version, run the following command:

```sh
npm install @bryntum/grid@npm:@bryntum/grid-trial @bryntum/grid-react
```

If you have a Bryntum Grid license, install the component as follows:

```sh
npm install @bryntum/grid @bryntum/grid-react
```

Next, import the Bryntum Grid CSS files. In the frontend `src/styles.css` file, add the following imports:

```css
/* FontAwesome is used for icons */
@import "@bryntum/grid/fontawesome/css/fontawesome.css";
@import "@bryntum/grid/fontawesome/css/solid.css";
/* Import grid's structural CSS */
@import "@bryntum/grid/grid.css";
/* Import your preferred Bryntum theme */
@import "@bryntum/grid/svalbard-light.css";

@import "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
```

Add the following CSS to the `body` selector:

```css
body {
  font-family: Poppins, "Open Sans", Helvetica, Arial, sans-serif;
}
```

The Bryntum Grid's structural CSS and themes have separate imports. The Svalbard light theme is used, which is one of 
the four available themes with light and dark variants. You can also create custom themes. You can read more about 
styling the Bryntum Grid in the [styling guide](#Grid/guides/customization/styling.md).

Create a new file called `gridConfig.ts` in the frontend `src` folder and add the following code for configuring the 
Bryntum Grid to it:

```ts
import { BryntumGridProps } from '@bryntum/grid-react';
import { AjaxStore } from '@bryntum/grid';
import { API_BASE_URL } from './constants';

export const gridProps: BryntumGridProps = {
    columns : [
        { type : 'rownumber', width : 80 },
        {
            text   : 'Product name',
            field  : 'productName',
            width  : 300,
            editor : {
                type     : 'textfield',
                required : true
            }
        }, {
            text   : 'Company name',
            field  : 'companyName',
            flex   : 1,
            editor : {
                type     : 'textfield',
                required : true
            }
        }, {
            text   : 'Country',
            field  : 'country',
            width  : 300,
            editor : 'textfield'
        }, {
            text   : 'Sell date',
            field  : 'sellDate',
            width  : 180,
            type   : 'date',
            editor : 'datefield'
        }, {
            text   : 'Order ID',
            field  : 'orderId',
            width  : 150,
            editor : 'textfield'
        }, {
            text   : 'In stock',
            field  : 'inStock',
            width  : 120,
            type   : 'check',
            align  : 'center'
        }, {
            text   : 'Qty',
            field  : 'qty',
            width  : 120,
            type   : 'number',
            align  : 'right',
            editor : {
                type : 'numberfield',
                min  : 0
            }
        }
    ],
};
```

We define the [columns](#Grid/view/GridBase#config-columns) for the Bryntum Grid so that it resembles the Handsontable 
table. Each column maps to a field in the Product model. The `type` property sets the column type 
(`rownumber`, `date`, `check`, `number`, or the default `string`), and the `editor` property defines the editor used 
when editing cells.

Add the following [`store`](#Grid/view/TreeGrid#property-store) configuration to the `gridProps` object:

```ts
store: {
    createUrl  : `${API_BASE_URL}/api/create`,
    readUrl    : `${API_BASE_URL}/api/read`,
    updateUrl  : `${API_BASE_URL}/api/update`,
    deleteUrl  : `${API_BASE_URL}/api/delete`,
    autoLoad      : true,
    autoCommit    : true,
    useSparseIndex : true,
    useRestfulMethods : true,
    httpMethods : {
        create  : 'POST',
        read    : 'GET',
        update  : 'PATCH',
        delete  : 'DELETE'
    },
    fields: [
        { name: 'id', type: 'number' },
        { name: 'productName', type: 'string' },
        { name: 'companyName', type: 'string' },
        { name: 'country', type: 'string' },
        { name: 'sellDate', type: 'date', format: 'DD/MM/YYYY' },
        { name: 'orderId', type: 'string' },
        { name: 'inStock', type: 'boolean' },
        { name: 'qty', type: 'number' }
    ]
}
```

The `store` has a `readUrl` property, which means it's an AjaxStore. The `readUrl`, `createUrl`, `updateUrl`, and
`deleteUrl` properties define the API endpoints for CRUD operations. The `autoLoad` property sets the store to load
data when the store initializes, and `autoCommit` means that the store will automatically save changes to the server.
The [`useSparseIndex`](#Core/data/mixin/StoreSparseIndex#config-useSparseIndex) property enables sparse index handling,
which automatically manages a `sparseIndex` field on each record. When records are inserted or reordered, the store
calculates a fractional index value between the neighboring records instead of re-indexing all subsequent rows. This
makes insertions and reordering efficient, as only the moved record's `sparseIndex` needs updating. The `fields` array
defines the data model with type information for each field. The `format` property for the `sellDate` field ensures that
the dates are parsed correctly.

Next, update the `src/index.tsx` file to use the Bryntum Grid instead of Handsontable. Replace the existing code with 
the following code:

```tsx
import { createRoot } from "react-dom/client";
import { BryntumGrid } from '@bryntum/grid-react';
import { gridProps } from './gridConfig';
import "./styles.css";

const App = () => {
  return (
    <BryntumGrid {...gridProps} />
  );
};

const rootElement = document.getElementById("root");

createRoot(rootElement as HTMLElement).render(<App />);
```

This code renders the `BryntumGrid` React component and passes in the grid configuration to it as a prop.

Start the frontend development server if it's not already running:

```sh
npm start
```

Open `http://localhost:8080` in your browser. You'll see the Bryntum Grid with the products data loaded from the 
database. You can edit cells directly, and changes will automatically save to the database.

<video controls width="100%">
<source src="data/Grid/images/migration/migrate-from-handsontable-to-bryntum/bryntum-grid-crud.webm" type="video/webm">
Sorry, your browser doesn't support embedded videos.
</video>

### Adding row insertion functionality

You can add rows in the Hansontable table by right-clicking on a cell and selecting "Insert row above" or 
"Insert row below". Let's add this functionality to the Bryntum Grid.

Add the following `cellMenuFeature` and `onCellMenuItem` handler to the `gridProps` object in the `gridConfig.ts` file:

```ts
cellMenuFeature : {
    items : {
        insertRowAbove : {
            text   : 'Insert row above',
            icon   : 'fa fa-arrow-up',
            weight : 200
        },
        insertRowBelow : {
            text   : 'Insert row below',
            icon   : 'fa fa-arrow-down',
            weight : 200
        }
    }
},

onCellMenuItem : ({ source, item, record }) => {
    const store = source.store as AjaxStore;
    const currentIndex = store.indexOf(record);

    let insertionIndex: number;

    if (item.ref === 'insertRowAbove') {
        insertionIndex = currentIndex;
    }
    else if (item.ref === 'insertRowBelow') {
        insertionIndex = currentIndex + 1;
    }
    else {
        return;
    }

    const newRecord = {
        productName : 'New Product',
        companyName : '',
        country     : '',
        sellDate    : new Date().toLocaleDateString('en-GB'),
        orderId     : '',
        inStock     : false,
        qty         : 0
    };

    // sparseIndex is automatically calculated by the store on insert
    store.insert(insertionIndex, newRecord);
},
```

This code adds two custom menu items to the cell context menu: "Insert row above" and "Insert row below". The
`onCellMenuItem` handler determines the insertion position and inserts a new record at that position. Because we enabled
`useSparseIndex` on the store, the `sparseIndex` value for the new record is automatically calculated as a fractional
value between the neighboring records. This means we don't need to manually update the indices of other rows. The
`autoCommit` setting then syncs the new record and its `sparseIndex` to the backend.

Right-click on any cell in the grid to see the context menu with the new "Insert row above" and "Insert row below" 
options. When you insert a row, it will save to the database.

<video controls width="100%">
<source src="data/Grid/images/migration/migrate-from-handsontable-to-bryntum/bryntum-final.webm" type="video/webm">
Sorry, your browser doesn't support embedded videos.
</video>

## Why choose Bryntum Grid over Handsontable?

While both libraries provide powerful data grid functionality, Bryntum Grid offers several advantages over Handsontable 
as discussed in our
[The best JavaScript data grids in 2025](https://bryntum.com/blog/the-best-javascript-data-grids-in-2025/) 
blog post:

- **Performance**: Bryntum Grid handles larger datasets more efficiently with features like lazy loading, minimal DOM 
  interactions, element reuse, and modern CSS optimizations.
- **Built-in features**: Bryntum Grid includes advanced features like AI-powered filtering, export to PDF and PNG, as 
  well as chart visualizations.
- **Data synchronization**: Bryntum Grid's AjaxStore automatically handles CRUD operations with `autoCommit`, reducing 
  the code needed for data synchronization.
- **Customization**: Bryntum Grid provides extensive configuration options for columns, editors, and UI features as well
  as a range of [widgets](https://bryntum.com/products/grid/docs/api/widgets) for common UI elements including buttons, 
  dropdowns, input fields, and chat panels.

## Next steps

Now that you've migrated from Handsontable to Bryntum Grid, you can explore additional features to enhance your 
application:

**Row reordering**: If you want to implement drag-and-drop row reordering, Handsontable uses the `afterRowMove` hook to
persist row changes. With Bryntum Grid, enable the [RowReorder feature](#Grid/feature/RowReorder) to your grid props:

```js
rowReorderFeature : {
    showGrip : true
},
```

Since we already configured `useSparseIndex` on the store, row reordering will automatically update only the moved
record's `sparseIndex` value and sync the change to the backend.

**Lazy loading**: Bryntum Grid supports lazy loading for efficiently handling large datasets. This feature isn't 
available in Handsontable. Learn more in our guide: 
[Lazy data loading (infinite scroll)](#Grid/guides/data/lazyloading.md).

**AI filtering**: Try adding the [AIFilter feature](#Grid/feature/ai/AIFilter) to filter your grid using natural 
language.

**Transitions**: You can configure [transitions](#Grid/view/GridBase#property-transition) for various actions in the 
grid, for a smoother, more polished user experience.

<p class="last-modified">Last modified on 2026-07-22 10:39:04</p>