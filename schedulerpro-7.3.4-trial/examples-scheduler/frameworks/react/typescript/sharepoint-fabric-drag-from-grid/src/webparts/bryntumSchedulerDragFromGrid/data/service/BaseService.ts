/* eslint-disable */
import TaskListModel from '../model/TaskListModel';
import ITaskList from './proxy/ITaskList';
import { DateHelper } from '@bryntum/core-thin';
import { UpdatePackage } from './proxy/UpdatePackage';
import { Response } from './proxy/Response';

/**
 * This class interacts between Scheduler's ProjectModel and the SharePoint Task List by using a list proxy. It
 * tunnels sync- and load requests between the model and the Task List, by creating and translating update- and response
 * packages.
 */
export default class BaseService {

    private _listId: string;
    private revision = 0;
    private range = 1;
    private startDate = new Date();

    protected model: TaskListModel;
    protected proxy: ITaskList;
    protected fields: any;
    protected modelConfig: any;

    public schedulerRef: any;
    public gridRef: any;

    constructor(modelConfig: any = {}) {
        this.modelConfig = modelConfig;
        this.model = this.createTaskListModel();
    }

    /**
     * Returns the reference to the Scheduler view
     * https://bryntum.com/products/scheduler/docs/api/Scheduler/view/Scheduler
     */
    get scheduler() {
        return this.schedulerRef.current.instance;
    }

    /**
     * Sets the listId (guid), loads the model and sets the timespan.
     * @param id
     */
    set listId(id) {
        if (id && id !== this._listId) {
            this._listId = id;
            if (this.scheduler) {
                this.model.load().then(() => {
                    this.setTimeSpan(this.startDate, this.range);
                }).catch(() => {});
            }
        }
    }

    // Retrieve current list guid
    get listId() {
        return this._listId;
    }

    // Set the timespan on the Scheduler view
    public setTimeSpan(startDate, range) {
        const scheduler = this.scheduler;
        this.range = range;
        if (scheduler) {
            scheduler.setTimeSpan(startDate, DateHelper.add(startDate, range, 'month'));
        }
    }

    /**
     * Creates a package with update actions for the proxy.
     */
    private getTaskListUpdatePackage(): UpdatePackage {

        const updatePackage = new UpdatePackage();

        const getChanges = (modifications = []) => {
            const
                fields   = Object.keys(modifications ?? []),
                modified = {};

            fields.forEach(field => {
                if (this.fields[field]) {
                    modified[field] = modifications[field];
                }
            });

            return Object.keys(modified).length ? modified : null;
        };

        // Get the changes from the eventStore with the original records
        const tasks: any = this.model.eventStore.changes;

        // Process added, modified and removed records
        tasks?.added?.forEach(task => updatePackage.addActionToUpdatePackage(task, getChanges(task.toJSON())));

        tasks?.modified?.forEach(task => updatePackage.addActionToUpdatePackage(task, getChanges(task.modificationData)));

        tasks?.removed?.forEach(task => updatePackage.addActionToUpdatePackage(task, {}, true));

        return updatePackage;
    }

    // Pass the proxy response to the crudmanager
    private finish(request, response: Response) {
        response.requestId = request.data.requestId;
        response.type = request.type;
        response.revision = ++this.revision;

        if (response.success) {
            request.success.call(this.model, response, null, request);
        }
        else {
            request.failure.call(this.model, response, null, request);
        }

        return response;
    }

    // Handle a proxy sync failure
    private handleFail(request, error: any) {
        const response = new Response();
        response.success = false;
        response.message = error;
        return this.finish(request, response);
    }

    /**
     * The sync request is called by the TaskList project model when changes are detected.
     * @param request
     */
    public async sync(request: any): Promise<Response> {
        const
            response                      = new Response(),
            { dependencies, assignments } = request.data,
            // Create an update package for the proxy/list to handle
            updatePackage: UpdatePackage  = this.getTaskListUpdatePackage();

        if (dependencies) {
            response.addNonPersistedDependencyChanges(dependencies);
        }

        if (assignments?.added) {
            for (const assignment of assignments.added) {
                // Match added assignments to added events, to serialize AssignedToId
                const task = updatePackage.add.find(t => t.record.id === assignment.eventId);
                if (task) {
                    if (!task.data.AssignedToId) {
                        task.data.AssignedToId = [];
                    }

                    task.data.AssignedToId.push(assignment.resourceId);
                }
            }
        }

        try {
            const { proxy, listId } = this;

            const removed = await proxy.deleteTaskListItems(listId, updatePackage.remove);
            response.addTaskRemoved(removed);

            const added = await proxy.addTaskListItems(listId, updatePackage.add);
            // SharePoint does not return the StartDate for some reason, use the one we passed
            for (const event of added) {
                if (!event.data.StartDate && event.record.startDate) {
                    event.data.StartDate = event.record.startDate;
                }
            }

            response.addTaskRows(added);

            const updated = await proxy.updateTaskListItems(listId, updatePackage.update);
            response.addTaskRows(updated);

            // Match added assignments to added events again, to put received event id into assignment
            if (assignments?.added) {
                for (const assignment of assignments.added) {
                    const event = added.find(t => t.data.$PhantomId === assignment.eventId);
                    if (event) {
                        assignment.eventId = event.data.id;
                    }
                }
            }

            if (assignments) {
                response.addNonPersistedAssignmentChanges(assignments);
            }

            return this.finish(request, response);
        }
        catch (error) {
            return this.handleFail(request, error);
        }
    }

    /**
     * The load request is called by the TaskList project model when load is called.
     * @param request
     */
    public async load(request: any): Promise<Response> {
        try {
            const response = await this.proxy.getTaskListItems(this.listId);

            return this.finish(request, response);
        }
        catch (error) {
            return this.handleFail(request, error);
        }
    }

    /**
     * SharePoint only expects data for fields defined in the tasklist. In this case we take the field dataSources defined in the TaskModel.
     */
    private getUpdateFields() {
        const
            fieldName = field => field.dataSource || field.name,
            fields    = (this.model.eventStore.modelClass as any).fields || [];
         
        this.fields = fields.reduce((fieldObj, field) => (fieldObj[fieldName(field)] = true, fieldObj), {});
    }

    // Create a tasklist model / data proxy on the model
    private createTaskListModel() {
        this.model = this.model || new TaskListModel({
            service : this,
            ...this.modelConfig
        });
        this.getUpdateFields();
        return this.model;
    }

    public getTaskListModel(): TaskListModel {
        return this.model;
    }

    public ensureList(name: string, sampleData = 'single'): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            resolve({});
        });
    }

    public getTaskLists(): Promise<{ key: string; text: string }[]> {
        return new Promise((resolve, reject) => {
            resolve([]);
        });
    }
}
