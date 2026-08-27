import { getSP } from '../../../pnpjsConfig';
import '@pnp/sp/site-users';

import ITaskList from './ITaskList';
import { TaskListHelper as Helper } from './TaskListHelper';
import { UpdateAction } from './UpdatePackage';
import { Response } from './Response';

/**
 * Proxy to handle tasklist updates.
 */
export default class TaskList implements ITaskList {

    // assignments and deps are not stored we handle id management locally
    public assignmentId = 0;
    public dependencyId = 0;

    /**
     * Delete items from the tasklist.
     * @param listId
     * @param actions
     */
    public async deleteTaskListItems(listId: string, actions: UpdateAction[]): Promise<UpdateAction[]> {
        const
            sp                   = getSP(),
            [batchedSP, execute] = sp.batched(),
            list                 = batchedSP.web.lists.getById(listId);

        // We only need to delete the parents
        actions.forEach(action => {
            const parent = actions.find(item => item.record.id === action.record.ParentIDId);
            if (parent) {
                action['skip'] = true;
            }
        });

        try {
            if (actions.length) {
                actions.forEach(action => {
                    const listItem = list.items.getById(action.record.id);
                    if (!action.skip) {
                        listItem.delete();
                    }
                });

                await execute();
            }

            return actions;
        }
        catch (error) {
            throw error;
        }
    }

    /**
     * Add new items to the tasklist
     *
     * @param listId
     * @param actions
     */
    public async addTaskListItems(listId: string, actions: UpdateAction[]): Promise<UpdateAction[]> {
        const
            sp                   = getSP(),
            [batchedSP, execute] = sp.batched(),
            list                 = batchedSP.web.lists.getById(listId);

        if (actions.length) {
            try {
                actions.forEach(action => {
                    list.items.add(action.data).then(result => {
                        Object.assign(action.data, result.data);
                        // Id is needed to unphantom new records and to be able to add child nodes later on
                        action.data.id = result.data.Id;
                    }).catch(error => {
                        throw error;
                    });
                });

                await execute();
            }
            catch (error) {
                throw error;
            }
        }

        return actions;
    }

    /**
     * Batch update on tasklist items
     *
     * @param listId
     * @param actions
     */
    public async updateTaskListItems(listId: string, actions: UpdateAction[]): Promise<UpdateAction[]> {
        const
            sp                   = getSP(),
            [batchedSP, execute] = sp.batched(),
            list                 = batchedSP.web.lists.getById(listId);

        try {
            actions.forEach(action => {
                const listItem = list.items.getById(action.record.id);
                listItem.update(action.data).catch(error => {
                    throw error;
                });
            });

            await execute();
        }
        catch (error) {
            throw error;
        }

        return actions;
    }

    /**
     * Get the whole project structure at once by processing a SP TaskList.
     *
     * Assignments are retrieved from AssignedToId
     * Dependencies are retrieved from PredecessorsId
     * Resources are the unfiltered site users
     *
     * Returns a Response which the crudmanager can load.
     *
     * @param listId
     */
    public async getTaskListItems(listId: string): Promise<Response> {
        const
            sp       = getSP(),
            response = new Response(),
            tasks    = await sp.web.lists.getById(listId).items.select('*,ParentIDId').getAll();

        for (const task of tasks) {
            task.id = task.Id;
            Object.keys(task).forEach(prop => {
                if (task[prop] === null) {
                    delete task[prop];
                }
            });

            // Fetch the dependencies as predecessors from the PredecessorId multi lookup field
            const predecessors = task.PredecessorsId || [];
            predecessors.forEach(predecessor => {
                response.dependencies.rows.push({ fromEvent : predecessor, toEvent : task.id, id : ++this.dependencyId });
            });
            task.PredecessorsId = predecessors;

            // Fetch the assignment from the AssignmentToId multi lookup field
            const assignments = task.AssignedToId || [];
            assignments.forEach(assignment => {
                response.assignments.rows.push({ event : task.id, resource : assignment, id : ++this.assignmentId });
            });
            task.AssignedToId = assignments;

            task['PercentComplete'] = task['PercentComplete'] * 100;// SP stores percent done as percentage value
        }

        // flat loading is not supported at the moment, create a tree structure for loading
        response.events.rows = Helper.getRootNodes(tasks);

        // Get all site users
        const users = await sp.web.siteUsers();

        // Filter out users without a UserPrincipalName (groups etc)
        response.resources.rows = users.filter(u => u.UserPrincipalName);

        return response;
    }
}
