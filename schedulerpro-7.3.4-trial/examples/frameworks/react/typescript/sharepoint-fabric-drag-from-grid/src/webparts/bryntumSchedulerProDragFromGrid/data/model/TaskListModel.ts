import { ProjectModel, ProjectModelConfig } from '@bryntum/schedulerpro-thin';
import Service from '../service/Service';

/**
 * A ProjectModel populated from a SharePoint Task List
 */
export default class TaskListModel extends ProjectModel {
    private service: Service;

    constructor(config?: Partial<ProjectModelConfig>) {
        // Turn on auto syncing with the server (SharePoint)
        config.autoSync = true;

        super(config);

        this.service = config['service'];

        // Any change in the dependency store needs to be reflected to the eventStore in the task PredecessorId field.
        this.dependencyStore.on('change', this.onDependencyChange, this);
        // Only support F-S types for the default SharePoint SPTaskList
        this.dependencyStore.isValidDependency = async(dependencyOrFromId, toId, type) => {
            return type === 2;
        };

        // Changes to assignments need to be reflected to the AssignedToId field in the event
        this.assignmentStore.on('change', this.onAssignmentChange, this);
    }

    private onAssignmentChange({ action, records, changes }) {
        if (action !== 'dataset') {
            for (const record of records) {
                const id = record.resource ? record.resourceId : null;
                record.event?.setFieldChangeToLookupField(action, 'assignedToId', id, changes?.resourceId?.oldValue);
            }
        }
    }

    private onDependencyChange({ action, records }) {
        if (action !== 'dataset') {
            for (const record of records) {
                const id = record.fromEvent ? record.fromEvent.id : null;
                record.toEvent?.setFieldChangeToLookupField(action, 'predecessorId', id);
            }
        }
    }

    // Override of the crudmanager to bypass Ajax response, no decoding needed
    public decode(response: any): any {
        return response;
    }

    // Override of the crudmanager to bypass Ajax response, no encoding needed
    public encode(requestConfig: any): string {
        return requestConfig;
    }

    /**
     * Use the List Proxy instead of the default AjaxRequest
     * @param request
     */
    public sendRequest(request: any): Promise<any> {
        return new Promise((resolve, reject) => {

            const end = (response) => {
                this.trigger?.('responseReceived', { success : response.success });

                if (response.success) {
                    resolve(response);
                }
                else {
                    reject(response);
                }
            };

            switch (request.type) {
                case 'load':
                    this.service.load(request).then(end).catch(end);
                    break;
                case 'sync':
                    this.service.sync(request).then(end).catch(end);
                    break;
            }
        });
    }

}
