import { UpdateAction } from './UpdatePackage';

/**
 * Basic store item response structure for both loading and sync
 */
export class Result {
    public rows: any[] = [];
    public removed: any[] = [];
}

/**
 * A response which can be consumed by the crudmanager
 */
export class Response {
    public success = true;
    public message = '';
    public requestId;
    public revision;
    public type;
    public events = new Result();
    public dependencies = new Result();
    public assignments = new Result();
    public resources = new Result();

    /**
     * Just pass changes back to the crudmanager without persisting data and unphantom added records.
     *
     * @param changes
     */
    private prepareNonPersistedChanges(changes): Result {
        const
            updates = new Result(),
            rows    = (changes.added || []).concat(changes.updated || []);

        if (rows.length) {
            rows.forEach(change => {
                if (change['$PhantomId']) {
                    change['id'] = change['$PhantomId'];
                }
            }, this);

            updates['rows'] = rows;
        }

        updates['removed'] = changes['removed'];
        return updates;
    }

    /**
     * Prepare persisted task changes for the crudmanager
     *
     * @param executedActions
     */
    private prepareTaskData(executedActions: UpdateAction[]): object[] {
        return executedActions.map(action => {
            if (action.record.isPhantom) {
                action.data['$PhantomId'] = action.record.id;
            }
            else {
                action.data['id'] = action.record.id;
            }

            return action.data;
        });
    }

    public addNonPersistedDependencyChanges(changes) {
        this.dependencies = this.prepareNonPersistedChanges(changes);
    }

    public addNonPersistedAssignmentChanges(changes) {
        this.assignments = this.prepareNonPersistedChanges(changes);
    }

    public addTaskRows(executedActions: UpdateAction[]) {
        this.events.rows = this.events.rows.concat(this.prepareTaskData(executedActions));
    }

    public addTaskRemoved(executedActions: UpdateAction[]) {
        this.events.removed = this.events.removed.concat(this.prepareTaskData(executedActions));
    }

    // The crudmanager expects this function because it thinks it gets an Ajax response
    public text() {
        return new Promise(resolve => {
            resolve(this);
        });
    }
}
