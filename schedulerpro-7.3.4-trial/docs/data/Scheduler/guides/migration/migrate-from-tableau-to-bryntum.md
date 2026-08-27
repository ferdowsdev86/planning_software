
# Migrate from a Tableau schedule to Bryntum Scheduler

[Tableau](https://www.tableau.com/) is a popular data visualization and analytics platform. While you can also use Tableau to create project management tools like a schedule, the software's project-management functionality is limited. If you need a schedule with more advanced functionality that you can easily customize to suit your project needs, [Bryntum Scheduler](https://bryntum.com/products/scheduler/) is a great choice.    

This tutorial will show you how to migrate a Tableau schedule to Bryntum Scheduler. We'll do the following:

- Create a simple schedule in Tableau using example data from an Excel file.
- Export the schedule data as a CSV file.
- Set up an Express API endpoint to read the CSV data and return the data in JSON format.
- Create a Bryntum Scheduler that gets data from the API endpoint.
- Add some extra features to the Bryntum Scheduler: An extra event editor field, custom task bar colors, a legend, and a summary row of tasks.

## Create a schedule in Tableau

We'll start by creating an example schedule in Tableau as explained in the Tableau tutorial on [using Gantt charts in Tableau to manage projects](https://www.tableau.com/blog/using-gantt-charts-tableau-manage-project-72429). The Gantt chart in the tutorial is more like a schedule than a Gantt chart, as it doesn't show a project timeline and has no task dependencies. 

We'll need some sample data to add to the Tableau schedule, so create a `tableau_scheduler_data.csv` file anywhere on your computer and add the following data to it:
```

Assigned,Project,Draft,Due,Publish Date
Tracy,Blog post,5/19/2024,6/15/2024,6/15/2024
Tracy,Blog post,6/2/2024,6/22/2024,6/22/2024
Tracy,Video,5/27/2024,6/3/2024,6/3/2024
Piper,Viz,4/20/2024,7/1/2024,7/1/2024
Piper,GIF,5/1/2024,5/10/2024,5/10/2024
Emily,Video,6/30/2024,7/3/2024,7/6/2024
Emily,Blog post,5/4/2024,5/8/2024,5/11/2024
Emily,GIF,6/2/2024,6/10/2024,6/10/2024
Ryan,Webpage,6/25/2024,6/28/2024,6/28/2024
Ryan,GIF,4/22/2024,4/26/2024,4/26/2024
Ryan,GIF,4/23/2024,4/26/2024,4/25/2024
Jordan,Workbook,4/22/2024,5/22/2024,5/22/2024
Jordan,Workbook,5/8/2024,5/25/2024,5/25/2024
Marissa,Slideshare,3/20/2024,8/19/2024,8/19/2024
Marissa,Video,7/10/2024,10/2/2024,10/3/2024
Marissa,GIF,6/30/2024,7/7/2024,7/7/2024
Jan,Presentation,5/1/2024,5/10/2024,5/11/2024
Jan,Presentation,8/2/2024,8/15/2024,8/15/2024
Jan,Webpage,6/15/2024,7/20/2024,8/2/2024
Jan,Blog post,6/18/2024,6/28/2024,6/19/2024
Stephanie,css,5/1/2024,5/10/2024,5/10/2024
Stephanie,GIF,7/2/2024,7/17/2024,7/17/2024
Stephanie,Video,8/11/2024,9/22/2024,9/24/2024
Mike,Webpage,7/15/2024,8/4/2024,8/4/2024
Mike,Blog post,7/16/2024,7/16/2024,7/16/2024
Mike,Webpage,7/17/2024,7/28/2024,7/28/2024
Mike,Webpage,7/18/2024,7/20/2024,7/20/2024
Kevin,GIF,5/20/2024,5/20/2024,5/22/2024
Kevin,Blog post,5/21/2024,6/2/2024,6/2/2024
Kevin,Video,7/14/2024,7/20/2024,7/22/2024
```

If you don't have a Tableau account, sign up for a [free Tableau Cloud trial](https://www.tableau.com/products/trial). Once you've created an account, sign in to [Tableau Cloud](https://sso.online.tableau.com/public/idp/SSO) and create a new workbook:

![Create a Tableau Cloud workbook](data/Scheduler/images/migrate-from-tableau/create-workbook.png)
 
A "Connect to Data" modal will open. Upload the `tableau_scheduler_data.csv` file as your workbook data source.

![Tableau workbook: upload data](data/Scheduler/images/migrate-from-tableau/workbook-data-upload.png)

Click the "Publish" button at the top right to publish your workbook and save your changes.

Now we'll create the custom schedule view in your workbook. Start by adding the rows and columns for the schedule.

- Click the "Due" table in the **Data** tab on the left and drag it to the "Columns" shelf at the top.
- Right-click "Due" in the "Columns" shelf and select "Exact Date" in the popup menu.
- Click the "Assigned" and "Project" tables and drag them to the "Rows" shelf.

![Tableau workbook: add "Due" shelf](data/Scheduler/images/migrate-from-tableau/workbook-add-due.gif) 

Next, create a calculated field called "Duration of Project". Click on the arrow to the right of the search input in the **Data** tab and select "Create Calculated Field..." from the dropdown menu.

![Tableau workbook: create duration](data/Scheduler/images/migrate-from-tableau/workbook-create-duration.png)

Give the calculated field the name "Duration of Project" and add the following calculation to calculate the duration of the project:

```bash
DATEDIFF("day",[Draft],[Publish Date])
```

![Tableau workbook: create duration calculation](data/Scheduler/images/migrate-from-tableau/workbook-create-duration-calculation.png)

Click OK.

Now drag the "Duration of Project" field to the "Size" [mark](https://help.tableau.com/current/pro/desktop/en-us/buildmanual_shelves.htm#:~:text=Tableau%20displays%20data%20using%20marks,mark%20type%20is%20a%20bar.). 

![Tableau workbook: add duration](data/Scheduler/images/migrate-from-tableau/workbook-add-duration.gif)

Create a second calculated field to show which projects are late and which are on time. Name the field "Late" and add the following calculation:

```sql
IF [Publish Date] > [Due] THEN "Late" else "On Time" END
```

Click OK to save the field, then drag it to the "Color" mark. Now task bars will be colored according to whether the task is late or on time, and the workbook will include a legend describing what the colors mean. To edit the colors, double-click on the "Color" mark.

![Tableau workbook: complete](data/Scheduler/images/migrate-from-tableau/workbook-complete.png)

## Export Tableau schedule data to a CSV file

We'll now export our Tableau data to a CSV file to use in our Bryntum Scheduler. 

Click on the download button at the top of your workbook view. Select "Data" in the popup menu to choose CSV as the download format. 

![Tableau workbook: export data](data/Scheduler/images/migrate-from-tableau/workbook-download1.png)

A window opens that displays the workbook view data. Select "Full Data" on the left, then click the "Download" button at the top right. On some systems the file can be downloaded with a `UTF-16LE` file encoding which is not compatible with the csv parsing library we are going to use in this guide. In that case you can use a command such as `iconv -f UTF-16LE -t UTF-8 input_file.csv > output_file.csv`, replacing `input_file.csv` with the actual name of your downloaded file or use another tool to convert the file to a compatible file encoding. Read more on converting to different file encodings for your system in this [guide](https://help.alchemer.com/help/encode-an-excel-file-to-utf-8-or-utf-16).

![Tableau workbook: export data to CSV](data/Scheduler/images/migrate-from-tableau/workbook-download2.png)

Compared to our initial Excel data, the downloaded data has two additional columns: "Late" and "Duration of Project". 

<div class="note">
Note: the exact formatting and encoding of the Tableau CSV export depends on the country you selected when signing up for a Tableau account. You might get a file in a different encoding, with different date formats, or with tabs instead of commas as separators. The example code should work in most cases, but you might need to adjust the CSV file manually if not.
</div>

Now let's set up an Express server API endpoint to read the Tableau data in our CSV file. The Bryntum Scheduler we create will get data from this API endpoint.

## Set up an Express server API endpoint that converts CSV data to JSON

First, clone the [Bryntum Scheduler server starter GitHub repository](https://github.com/bryntum/tableau-to-bryntum-scheduler-server-starter). The code for the completed server API endpoint is in the `completed-scheduler` branch. The `server.js` file in the starter repository contains the code for a basic Express server and CORS configuration for making requests to the API endpoint from the client-side Bryntum Scheduler we'll create.

Install the dependencies by running the following command:

```bash
npm install
```

Also install the `date-fns` module which simplifies the process of parsing different date formats in JavaScript.

```bash
npm install date-fns 
```

Add the CSV file you downloaded from Tableau to the root folder and rename it `tableau_scheduler_data.csv`. 

Let's create an API endpoint at the `/api/download` route for GET requests. This route will read the CSV data from our `tableau_scheduler_data.csv` file and send the data as a formatted JSON response. 

First, import the `csvToJson` library in the `server.js` file: 

```javascript
import csvToJson from "csvtojson";
```

Also import the `date-fns` library in the `server.js` file. 

```javascript
import { parse } from "date-fns";
const format = "dd/MM/yyyy"; // change this to match your date format in the downloaded data
```

Change the value of the `format` variable to match the format of the dates in the `tableau_scheduler_data.csv` file. You can learn more on how to use the `parse` function and the valid format strings it accepts [here](https://date-fns.org/v3.3.1/docs/parse).

Add the following API route below the CORS configuration. Note that we use `{delimeter: "auto"}` to handle cases where the Tableau export comes with tabs or spaces. You can change this to specify the delimiter you see in your Tableau export for more reliability.

```javascript
app.get("/api/download", async (req, res) => {
  try {
    const jsonArray = await csvToJson({ delimiter: "auto" }).fromFile(
      "./tableau_scheduler_data.csv"
    );    

    const resourceNames = [...new Set(jsonArray.map((item) => item.Assigned))];
    const resourcesRows = resourceNames.map((name, i) => {
      return {
        id: i,
        name,
      };
    });    
   
    const eventsRows = jsonArray.map((item, i) => {
      const resource = resourcesRows.find(
        (resource) => resource.name === item.Assigned
      );
      return {
        id: i,
        name: item.Project,
        startDate: parse(item.Draft, format, new Date()),
        endDate: parse(item["Publish Date"], format, new Date()),
        resourceId: resource.id,
        duration: parseFloat(item["Duration of Project"]),
        durationUnit: "days",
        due: parse(item.Due, format, new Date()),
      }; 
    });

    const schedulerLoadResponse = {
      success: true,
      events: {
        rows: eventsRows,
      },
      resources: {
        rows: resourcesRows,
      },
    };

    res.json(schedulerLoadResponse);
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).send("An error occurred while processing the request.");
  }
});
```

We use the `csvToJson.fromFile()` method to read the CSV data and convert it to an array. Each row of CSV data is an item in the array, and each item is an object containing CSV headers for properties and row values for values.

We then create a `resourcesRows` array for the Bryntum Scheduler [resources](https://bryntum.com/products/scheduler/docs/api/Scheduler/model/ProjectModel#config-resources) and an `eventsRows` for the Bryntum Scheduler [events](https://bryntum.com/products/scheduler/docs/api/Scheduler/model/ProjectModel#config-events). The fields for each resource and event are some of the fields of the Bryntum Scheduler [ResourceModel](https://bryntum.com/products/scheduler/docs/api/Scheduler/model/ResourceModel#fields) and [EventModel](https://bryntum.com/products/scheduler/docs/api/Scheduler/model/EventModel#fields). The returned JSON has the expected [response format](https://bryntum.com/products/scheduler/docs/guide/Scheduler/data/crud_manager#response-format) when using the Bryntum Scheduler [Crud Manager](https://bryntum.com/products/scheduler/docs/guide/Scheduler/data/crud_manager) to fetch data from a server.

## Create a client-side Bryntum Scheduler

Clone the [Bryntum Scheduler starter GitHub repository](https://github.com/bryntum/tableau-to-bryntum-scheduler-client-starter). The code for the completed Bryntum Scheduler is in the `completed-scheduler` branch. The starter code uses [Vite](https://vitejs.dev/), a development server and JavaScript bundler. Install the Vite dev dependency by running the following command:

```bash
npm install
```

Now let’s install the Bryntum Scheduler component using npm. You can try out Bryntum components for free using our public Bryntum trial packages.
If you have a Bryntum license, please refer to our [Npm Repository Guide](https://bryntum.com/products/scheduler/docs/guide/Scheduler/npm/repository/private-repository-access) to access the private Bryntum repository.

Install the scheduler component by following the guide [here](https://bryntum.com/products/scheduler/docs/guide/Scheduler/quick-start/javascript-npm#install-component).

Add the following lines of code to the `main.js` file to create a Bryntum Scheduler:

```javascript
import { Scheduler } from "@bryntum/scheduler";
import "@bryntum/scheduler/scheduler.stockholm.css";
import "./style.css";
  
const scheduler = new Scheduler({
  appendTo: document.body,
  date: new Date(2024, 4, 20),
  viewPreset: "year",
  resources: [{"id":0,"name":"Tracy"}],
  events: [{
    "id":0,
    "name":"Blog post",
    "startDate":"2024-05-18T22:00:00.000Z",
    "endDate":"2024-06-14T22:00:00.000Z",
    "resourceId":0,
    "duration":27,
    "durationUnit":"days",
    "due":"2024-06-14T22:00:00.000Z"
  }],
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

We initialize the Bryntum Scheduler with some basic configuration. We add some initial data inline using the `resources` and `events` properties. There are some basic CSS styles defined in the `style.css` file that make the Bryntum Scheduler take up the full height of the screen.   

Now run the local development server:

```bash
npm run dev
```

You’ll see a basic scheduler as shown below:

![Initial Bryntum Scheduler with example data](data/Scheduler/images/migrate-from-tableau/Bryntum-scheduler-initial.png)

## Get data from the API endpoint

Let's update our Bryntum Scheduler config to get data from the API endpoint that we created. Delete the `resources` and `events` config properties and then add the following `crudManager` property below the `viewPreset` property of the Bryntum Scheduler in the `main.js` file of the client project:

```javascript
  crudManager: {
    autoLoad: true,
    eventStore: {
      modelClass: Task,
    },
    transport: {
      load: {
        url: "http://localhost:3000/api/download",
      },
    },
  },
```

The [`crudManager`](https://bryntum.com/products/scheduler/docs/guide/Scheduler/data/crud_manager) simplifies loading data from a server and persisting data changes to the server. The [`transport`](https://bryntum.com/products/scheduler/docs/api/Scheduler/crud/transport/AjaxTransport#config-transport) property is used to configure the AJAX requests used by the crud manager to communicate with a server. We set the `url` of the `load` to the URL of our server API endpoint. The [`eventStore`](https://bryntum.com/products/scheduler/docs/api/Scheduler/data/CrudManager#config-eventStore) holds the data for our tasks. It uses a custom `Task` model that we'll define now. 

Create a folder called `lib` in the root folder. In that folder, create a file called `Task.js` and add the following lines of code to it:

```javascript
import { EventModel } from "@bryntum/scheduler";

// Simple task class with an extra due field
export default class Task extends EventModel {
  static fields = [
    { name: "due" }
  ];
}
```

We created a custom `Task` model that extends the Scheduler's [`EventModel`](https://bryntum.com/products/scheduler/docs/api/Scheduler/model/EventModel). We did this to add the custom `due` field. 

In the `main.js` file, import the custom `Task` model:

```javascript
import Task from "./lib/Task";
```

Now run the local development server API with `npm run start`. You'll see the tasks from our Tableau data in the Bryntum Scheduler UI:


![Bryntum Scheduler with data from API endpoint](data/Scheduler/images/migrate-from-tableau/Bryntum-scheduler-data.png)

You can resize and drag and drop events in the scheduler UI, unlike in Tableau. If you double-click on an event bar, you'll see the event editor dialog. Note that the due date field is missing. Let's add it.

## Add a due field to the event editor

Add the following `features` config property below the `viewPreset` config property of the Bryntum Scheduler in the `main.js` file of the client project:

```javascript
  features: {
    // Customize the event editor
    eventEdit: {
      editorConfig: {
        autoUpdateRecord: true,
        items: {
          dueField: {
            type: "date",
            label: "Due",
            name: "due",
            weight: 100,
          },
        },
      },
    },
  },
```

We customize the event editor by changing the config of the [EventEdit](https://bryntum.com/products/scheduler/docs/api/Scheduler/feature/EventEdit) feature. We added an extra due field in the [`items`](https://bryntum.com/products/scheduler/docs/api/Scheduler/feature/EventEdit#config-items) object. There will now be a due input in the event editor dialog. 

You can learn more about customizing the event editor in our blog post [Customizing the event editor for Bryntum Scheduler](https://bryntum.com/blog/customizing-the-event-editor-for-bryntum-scheduler/).

## Color the event bars based on whether a task is late or on time

Let's replicate the coloring of event bars based on whether or not the task is late, as we did in Tableau.

At the top of the `main.js` file in the client project, add the following variables to define the colors for late and on-time tasks:

```javascript
const colorOnTime = "#f28e2b",
  colorLate = "#4e79a7";
```

The on-time color is orange; the late color is dark blue. 

Let's change the color of the task bars based on whether the task end date is past its due date. Add the following lines of code below the `columns` config property:

```javascript
eventRenderer({ renderData, eventRecord }) {
    const { endDate, due } = eventRecord.data;
    const late = new Date(endDate) > new Date(due);
    if (late) {
      renderData.eventColor = colorLate;
    } else {
      renderData.eventColor = colorOnTime;
    }
    return StringHelper.xss`${eventRecord.name}`;
  },
```

The [`eventRenderer`](https://bryntum.com/products/scheduler/docs/api/Scheduler/view/mixin/SchedulerEventRendering#config-eventRenderer) function renders the event bar content, and it's called each time an event is rendered. We use the `renderData` parameter to color the event bars based on whether the task is late or on time. We add the task name to the event bar using the `eventRecord` parameter. 

We use the [`xss`](https://bryntum.com/products/scheduler/docs/api/Core/helper/StringHelper#function-xss-static) method of the [`StringHelper`](https://bryntum.com/products/scheduler/docs/api/Core/helper/StringHelper) function to prevent XSS attacks. Let's import it from the Bryntum Scheduler module: 

```javascript
import { StringHelper } from "@bryntum/scheduler";
```

Now you'll see that the event bars are labeled and colored according to their late or on-time status. If you move a late task to before its due date, its color will change from dark blue to orange.

![Bryntum Scheduler - colored task bars](data/Scheduler/images/migrate-from-tableau/Bryntum-scheduler-colored-task-bars.png)


## Create a legend

Now we'll create a legend for the event bar colors as we had in Tableau. 

Add the following lines of code to the bottom of the `main.js` file:

```javascript
const container = new Container({
  appendTo: document.body,
  cls: "legend",
  width: 120,
  items: {
    late: {
      type: "displayfield",
      label: "Late",
      value: "",
      cls: "legendItemLate",
    },
    onTime: {
      type: "displayfield",
      label: "On Time",
      value: "",
      cls: "legendItemOnTime",
    },
  },
});
```

We create a [`Container`](https://bryntum.com/products/scheduler/docs/api/Core/widget/Container) widget for the legend and append it to the body of the document. Two [`DisplayField`](https://bryntum.com/products/scheduler/docs/api/Core/widget/DisplayField) widgets in the container display the labels for the task colors. Each legend item has a unique CSS class added to it using the `cls` property. 

Import the `Container` widget from the Bryntum Scheduler module:

```javascript
import { Container } from "@bryntum/scheduler";
```

We'll color the labels and position the legend using CSS. Add the following styles to the `style.css` file:

```css
.legend {
  position: absolute;
  bottom: 105px;
  right: 30px;
  display: flex;
  width: 50px;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 5px;
}

.legend label {
  order: 1;
  width: 150px;
  text-align: left;
}

.legendItemLate span {
  background-color: #f28e2b;
}

.legendItemOnTime span {
  background-color: #4e79a7;
}
```

We position the legend at the bottom-right of the scheduler and create the colored squares by making the legend items flex items and setting the background color for each using their unique CSS class. 

![Bryntum Scheduler - legend](data/Scheduler/images/migrate-from-tableau/Bryntum-scheduler-legend.png)

## Create a summary row

Lastly, we'll add a [summary row](https://bryntum.com/products/scheduler/docs/api/Grid/feature/Summary) to our Scheduler footer. Add the following `summary` feature to your scheduler's `features` config property:

```javascript
    summary: {
      summaries: [
        { label: "Total", renderer: ({ events }) => events.length || 0 },
        {
          label: "Late",
          renderer: ({ events }) => {
            const value =
              events.filter((event) => {
                return new Date(event.endDate) > new Date(event.due);
              }).length || 0;
            return `<span style="color: ${colorLate}; font-weight: bold">${value}</span>`;
          },
        },
        {
          label: "On Time",
          renderer: ({ events }) => {
            const value =
              events.filter((event) => {
                return new Date(event.endDate) <= new Date(event.due);
              }).length || 0;
            return `<span style="color: ${colorOnTime}; font-weight: bold">${value}</span>`;
          },
        },
      ],
    },
```

We customize the summary row to display the total number of events for a period, the number of late events, and the number of on-time events. We also color the total number of late and on-time events appropriately. 

In the `columns` config, add the following properties to the workers column: 

```javascript
      sum: "count",
      summaryRenderer: ({ sum }) => "Workers: " + sum,
```

This adds a summary row to our resources column that shows the number of workers.

![Bryntum Scheduler - summary row](data/Scheduler/images/migrate-from-tableau/Bryntum-scheduler-summary-row.png)

## Bryntum Scheduler features

Bryntum Scheduler has more features out of the box than the Tableau schedule we created, such as:

- [Event resizing](https://bryntum.com/products/scheduler/docs/api/Scheduler/feature/EventResize)
- [Event drag and drop](https://bryntum.com/products/scheduler/docs/api/Scheduler/feature/EventDragSelect)
- [Event editor](https://bryntum.com/products/scheduler/docs/api/Scheduler/feature/EventEdit)

The Bryntum Scheduler features are easy to customize to suit your project's needs. Tableau is more suited to data analysis than project management, and its UI is far less customizable. 

Let's take a look at some of these features, which are only a fraction of the features available in Bryntum Scheduler. To see examples of how you can customize your Scheduler, check out our [Scheduler demos](https://bryntum.com/products/scheduler/examples/).

### Undo and redo support

All Bryntum Scheduling products, including Bryntum Scheduler, have built-in [undo and redo](https://bryntum.com/products/scheduler/docs/api/Scheduler/widget/UndoRedo) functionality. This means that you can undo and redo changes to the scheduler data, as can be seen in this [undo/redo demo](https://bryntum.com/products/scheduler/examples/undoredo/).

### Time ranges

The Bryntum Scheduler [TimeRanges](https://bryntum.com/products/scheduler/docs/api/Scheduler/feature/TimeRanges) feature allows you to highlight time ranges in a scheduler's day and week view with ease. 

### Dependencies

Bryntum Scheduler allows you to draw [dependencies](https://bryntum.com/products/scheduler/docs/api/Scheduler/feature/Dependencies) between events, as you can see in this [dependencies demo](https://bryntum.com/products/scheduler/examples/dependencies/).

The Bryntum Scheduler also has these features:

- Configurable time scales
- Cell editing
- Multiple assignment of events
- Infinite timeline scrolling
- Animated UI updates

You can see a list of all of the features [here](https://bryntum.com/products/scheduler/features/).


<p class="last-modified">Last modified on 2026-07-22 10:39:14</p>