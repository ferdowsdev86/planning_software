# SharePoint Online SPFx Data Connection

This guide describes the flow to connect to a TaskList or any list on SharePoint.

To connect to SharePoints API we use the `pnpjs` library: https://pnp.github.io/pnpjs

The pnp `sp` `list` and `listitem` package provides handles to read and update SharePoint task lists. We use a
service to tunnel `CrudManager` requests to the SharePoint API. First we describe the implementation of the
`CrudManager`.

### The TaskList CrudManager

The `CrudManager` can be found in the file `model\TaskListModel.ts` which extends Bryntum's
[CrudManager](https://bryntum.com/products/scheduler/docs/api/Scheduler/data/CrudManager).

We override some methods of CrudManager to use the `AjaxRequest` hooks to
intercept the data requests sent from the `CrudManager`.

```typescript
class TaskListModel extends CrudManager {

    private service: Service;

    // Override of the crudmanager to bypass Ajax response, no decoding needed
    public decode(response: any): any {
        return response;
    }

    // Override of the crudmanager to bypass Ajax response, no encoding needed
    public encode(requestConfig: any): string {
        return requestConfig;
    }

    /**
     * Override of the crudmanager. Use the List Proxy instead of the default AjaxRequest
     * @param request
     */
    public sendRequest(request: any): Promise<any> {
        return new Promise((resolve, reject) => {
            switch (request.type) {
                case 'load':
                    return this.service.load(request);
                case 'sync':
                    return this.service.sync(request);
            }
        });
    }
}
```

The service will now handle any `load` and `sync` request send from the `CrudManager`. The service will need to handle
the crud actions using a proxy and on response return the correct data format back to the `CrudManager`. For that reason
we describe the data formats expected by the `CrudManager` in the next section.

### DataFormat CrudManager

The expected data package format for the `CrudManager` is described in this
[guide](https://bryntum.com/products/scheduler/docs/guide/Scheduler/data/crud_manager).

Using TypeScript the structure looks like:

```typescript
class Result {
    public rows: any[] = [];
    public removed: any[] = [];
}

/**
 * A response which can be consumed by the crudmanager
 */
class Response {
    public success: boolean = true;
    public message = '';
    public requestId;
    public revision;
    public type;
    public tasks: Result;
    public dependencies: Result;
    public assignments: Result;
    public resources: Result;
}
```

### TaskList proxy

The service will use a proxy to send the crud actions to SharePoint using the `pnpjs` library.
The crud requests data format need to be transformed into a data format which the proxy can handle.

Example:

```typescript
class UpdateAction {
    public record: any;// needs to have at least { id: id } not needed for adding records
    public data: any;// modifications
}

class UpdatePackage {
    public add: UpdateAction[] = [];
    public update: UpdateAction[] = [];
    public remove: UpdateAction[] = [];
}
```

The `UpdateAction` `data` fields contains modified field data for only the fields that exist in the SharePoint list, else
we get errors in the api. The `record` field contains the original `SchedulerEventModel`. We put the updates in slots: `add`
, `update` and `remove`.

For writing the proxy we use the following interface

```typescript
interface ITaskList {
  deleteTaskListItems(listId: string, actions: UpdateAction[]): Promise<UpdateAction[]>;
  addTaskListItems(listId: string, actions: UpdateAction[]): Promise<UpdateAction[]>;
  updateTaskListItems(listId: string, actions: UpdateAction[]): Promise<UpdateAction[]>;
  getTaskListItems(listId: string): Promise<Response>;
}
```

The implementation of the `ITaskList` interface can be found in the file `data\service\proxy\TaskList.ts`

Then we can continue with the implementation of the service which will send `load` and `sync` requests back and forth
between the CrudManger and the API proxy.

### Service

The service will put all the pieces together. It receives the requests from the `CrudManager` and passes it to
the `Proxy`. When the proxy has finished handling the request it sends back the response to the `CrudManager`.

#### Handle the Load request

```typescript
  public load(request: any): Promise<Response> {
    // Set auto sync to false during loading to prevent getting `dataset` changes
    this.model.autoSync = false;

    const handleFail = (error) => {
      this.handleFail(request, error);
    };

    return new Promise((resolve, reject) => {
      this.proxy.getTaskListItems(this.listId).then(response => {
        this.finish(request, response);
        resolve(response);
        // Auto sync is set to true to automatically persist changes
        this.model.autoSync = true;
      }).catch(handleFail);
    });
  }
```

We set `autoSync` to true to automatically sync any change in the chart to SharePoint.

#### Handle Sync request

When a sync request comes in, changes are retrieved directly from the modification field in the `TaskList` model,
because we want to have the original event records. The function `getTaskListUpdatePackage` will create the
update package for the proxy to handle.

```typescript
public async sync(request: any): Promise<Response> {
    const
        response                      = new Response(),
        { dependencies, assignments } = request.data,
        // Create an update package for the proxy/list to handle
        updatePackage: UpdatePackage  = this.getTaskListUpdatePackage();
    
    // Code redacted for brevity

    try {
        const { proxy, listId } = this;
    
        const removed = await proxy.deleteTaskListItems(listId, updatePackage.remove);
        response.addTaskRemoved(removed);
    
        const added = await proxy.addTaskListItems(listId, updatePackage.add);
        // Code redacted for brevity
        response.addTaskRows(added);
    
        const updated = await proxy.updateTaskListItems(listId, updatePackage.update);
        response.addTaskRows(updated);

        // Code redacted for brevity
        
        if (assignments) {
            response.addNonPersistedAssignmentChanges(assignments);
        }
    
        return this.finish(request, response);
    }
    catch (error) {
        return this.handleFail(request, error)
    }
}
```

When the proxy has resolved all update actions to SharePoint we pass the response back to the `CrudManager` in a 
`Response` object. The functions `finish` and `fail` will handle the passing of the proxy result.

```typescript
// Pass the proxy response to the crudmanager
  private finish(request, response: Response) {
    // RequestId is needed for the crudmanager to map to the current outstanding request
    response.requestId = request.data.requestId;
    response.type = request.type;//load or sync
    response.revision = ++this.revision;

    if(response.success) {
      request.success.call(this.model, response);
    } else {
      request.failure.call(this.model, response);
    }
  }

  // Handle a proxy sync failure
  private handleFail(request, error: any) {
    const response = new Response();
    response.success = false;
    response.message = error;
    this.finish(request, response);
  }
```

### SchedulerEventModel

The solution will be able to read a default SharePoint TaskList. The model is defined in the file 
`data\model\SchedulerEventModel.ts`. The default SharePoint tasklist fields are defined in the static `fields` property of the 
model.

When any change in the assignment - and dependency store occur, the changes are stored in `AssignedToId` and
`PredecessorsId` fields. These fields contain a comma separated field value which is converted into a SharePoint Lookup
field value.

```typescript
[
    {
        name         : 'predecessorId',
        dataSource   : 'PredecessorsId',
        serialize    : (value, record) => record.serializeMultiLookupValue(value),
        convert      : this.setIntArrayAsStringValue,
        defaultValue : ''
    },
    {
        name         : 'assignedToId',
        dataSource   : 'AssignedToId',
        serialize    : (value, record) => record.serializeMultiLookupValue(value),
        convert      : this.setIntArrayAsStringValue,
        defaultValue : ''
    }
]
```

The current demo doesn't support `Lag` on dependencies. But you can create additional fields
to store these values separately.

Additional fields can be added to the TaskList. You can add any new field in the TaskList and
map the fields in the model. They can be added in the following manner:

```typescript
  // For example, we have a count field which has number dataType
  static get additionalFields() {
    return [
      { name: 'count', dataSource: 'Count', type : 'number' }
    ];
  }
```

Happy coding!
