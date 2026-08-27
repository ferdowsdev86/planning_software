<h1 class="title-with-image"><img src="Core/logo/sharepoint.svg"
alt="Bryntum Scheduler Pro supports React"/>Using Bryntum Scheduler Pro in a SharePoint SPFx Fabric Web Part</h1>

The SharePoint Framework (SPFx) is a page and web part model that provides support for OS independent client-side
SharePoint development. With a few simple steps we can create a React App and upload it as a web part. In this guide we
will show how the Bryntum Scheduler Pro can be easily embedded into SharePoint as a web part.

## Requirements

To get started, you need a Microsoft 365 tenant. If you don't have one, you can get one as part of the Microsoft 365 
developer program. Please see Microsoft's [Set up your Microsoft 365 tenant](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
guide for more information.

You also need an IDE (e.g. WebStorm or VS Code) and a recent version of Node (Microsoft currently recommends node 18).
Microsoft's [Set up your SharePoint Framework development environment](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-development-environment)
has more information.

To get started, a login to Bryntum's npm registry is required. Please refer to [this guide](#SchedulerPro/guides/npm-repository.md)
to set up an account.

```shell
cd examples/frameworks/react/typescript/sharepoint-fabric-drag-from-grid
```

The unplanned `tasks` in the grid should be dragged onto the schedule to assign to a `resource`. And to unassign a task,
right click an task and select `Unassign` to move it to unplanned tasks in the grid.

<div class="note">
This demo uses the <a href=https://bryntum.com/products/grid>Bryntum Grid</a> component to show unplanned tasks for which a
separate license is required. 
</div>

## Initial setup

The demo can be found and launched in the examples folder:

```shell
cd examples/frameworks/react/typescript/sharepoint-fabric
```

To be able to try it, you need to install the dependencies:

```shell
npm i
```

And then modify the `config/serve.json` file to point to your tenant. Replace the `{tenantDomain}` placeholder with your
tenant:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/spfx-serve.schema.json",
  "port": 4321,
  "https": true,
  "initialPage": "https://YOUR_TENANT_URL_GOES_HERE/_layouts/workbench.aspx"
}
```

Now you can start the local workbench with the following command (you can leave `npx` out if you have `gulp` installed
globally):

```shell
npx gulp serve
```

The serve command will open a new browser window pointing the workbench on your tenant. To see if the setup is 
working correctly, click the [+] sign and add `BryntumSchedulerPro` to the page:

![workbench](SchedulerPro/screen_sp_3.png)

If all is set up correctly you should now see Scheduler Pro rendered.

Next, click the "Edit web part" button, and then the "Create Tasklist" button in the web part settings panel. This 
creates an empty task list.

After a few seconds the task list is created on the remote tenant and shown in the Task Lists dropdown field. Pick it
and you should see the resources from your page:

![workbench](SchedulerPro/screen_sp_4.png)

At this point we can modify the sources of the example to our liking. The web part will be rebuilt automatically as long
as we have `gulp serve` running. The changes will be visible after manually refreshing the page in the browser.

## Modify the code

When the workbench is running, we are ready to do some coding and customise the example to our liking.

### List creation and adding data model fields

We can for example add a few extra fields to the EventModel:

```typescript
  // Fields which are not on a default SharePoint TaskList
  static get additionalFields() {
    return [
      { name: 'constraintDate', dataSource: 'ConstraintDate', type : 'date' },
      { name: 'constraintType', dataSource: 'ConstraintType' },
      { name: 'effort', dataSource: 'Effort', type: 'number' },
      { name: 'duration', dataSource: 'Duration', type: 'number', allowNull: true },
      { name: 'manuallyScheduled', dataSource: 'ManuallyScheduled', type:'boolean' }
    ];
  }
```

When creating a new list in the PropertyPane, the fields in the additional section are added to the newly created task
list (on creation).

### Data Model

The data model describes how TaskList data is processed and retrieved by the Scheduler Pro component.

Scheduler Pro is configured with a ProjectModel which is the entity responsible for loading and saving data to 
underlying data stores. We override some methods used for communicating with the server and send our data requests to 
SharePoint using the [pnpjs](https://pnp.github.io/pnpjs/) library.

```typescript
class TaskListModel extends ProjectModel {

  private service: Service;

  // Override of the crudmanager to bypass Ajax response, no decoding needed
  public decode(response: any): any {
    return response;
  }

  // Override of the crudmanager to bypass Ajax response, no encoding needed
  public encode (requestConfig: any): string {
    return requestConfig;
  }

  /**
   * Override of the crudmanager. Use the List Proxy instead of the default AjaxRequest
   * @param request
   */
  public sendRequest(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      switch(request.type) {
          case 'load':
            return this.service.load(request);
          case 'sync':
            return this.service.sync(request);
        }
    });
  }
}
```

The Service class will process data requests and retrieve the data from SharePoint and return the response to the
Project. In case of a load request we do the following in the Service class:

```typescript
public load(request: any): Promise<Response> {

    return new Promise((resolve, reject) => {
      this.proxy.getTaskListItems(this.listId).then(response => {
        this.finish(request, response);
        resolve(response);
      }).catch(handleFail);
    });
  }
```

The service is using a proxy to process the calls with the [pnpjs](https://pnp.github.io/pnpjs/) library.
TaskListItems are retrieved with the [sp package](https://pnp.github.io/pnpjs/sp/).

```typescript
public getTaskListItems(listId: string): Promise<Response> {

    const response = new Response();

    return new Promise((resolve, reject) => {

      sp.web.lists.getById(listId).items.select('*,ParentIDId').getAll().then((tasks) => {

        /*...*/
        response.tasks.rows = ...

        // Get all site users. you might want to filter some out
        sp.web.siteUsers().then((users) => {
          response.resources.rows = users;
          resolve(response);
        });
      }).catch(reject);
    });
  }
```

The returned Response object is passed back to the ProjectModel in the 
[format](#SchedulerPro/guides/data/crud_manager_project.md) expected.

```typescript
interface ITaskList {
  deleteTaskListItems(listId: string, actions: UpdateAction[]): Promise<UpdateAction[]>;
  addTaskListItems(listId: string, actions: UpdateAction[]): Promise<UpdateAction[]>;
  updateTaskListItems(listId: string, actions: UpdateAction[]): Promise<UpdateAction[]>;
  getTaskListItems(listId: string): Promise<Response>;
}
```

### PropertyPane

The example is built with React. The [React](#SchedulerPro/guides/integration/react/guide.md) integration guide provides good
guidelines how to configure and style the gantt component. The PropertyPane for the web part is used to configure it
(e.g. its behavior and appearance). We recommend you to read
this [guide](https://docs.microsoft.com/nl-nl/sharepoint/dev/spfx/web-parts/get-started/build-a-hello-world-web-part)
which shows how to modify the basic structure of a web part.

## Deploy

When we are finished coding and the web part is ready for production use, the solution can be easily packaged by running
a few commands.

```shell
gulp bundle --ship
gulp package-solution --ship
```

We upload the created `bryntum-fabric-sp.sppkg package` to our app catalog.

![deploy](SchedulerPro/screen_sp_5.png)

When pressing [Deploy], the web part is available for all the sites within the organisation.

## Troubleshooting

### No development certificate found

If you get an error saying "No development certificate found" when you run `gulp serve`, you can run the following 
command to generate a certificate:

```shell
npx gulp trust-dev-cert
```

### Module parse failed: Unexpected token

If you encounter an error like:
"You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file."
It might be because the source code hasn't been transpiled. Webpack doesn't understand some of the syntax used in
source code out of the box.

To fix this, you need to transpile the code with Babel. First, install these packages:

```json
    "@babel/core": "7.26.9",
    "@babel/preset-env": "7.26.9",
    "babel-loader": "8.4.1",
```

and add the following code in the `gulpfile.js`:

```javascript
build.configureWebpack.mergeConfig({
    additionalConfiguration : (generatedConfiguration) => {
        // Add Babel loader rule for Bryntum’s code to transpile
        generatedConfiguration.module.rules.push({
            test    : /\.js$/,

            // Only transpile the relevant Bryntum lib files
            include : /node_modules[\\/]+@bryntum[\\/]+\w+-thin[\\/]+lib/,
            use     : {
                loader  : 'babel-loader',
                options : {
                    presets : [
                        [
                            '@babel/preset-env',
                            {
                                targets : {
                                    chrome : '71',
                                },
                            }
                        ]
                    ]
                }
            }
        });

        return generatedConfiguration;
    }
});
```


<p class="last-modified">Last modified on 2026-07-22 10:39:19</p>