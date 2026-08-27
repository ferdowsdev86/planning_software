import DependencyModel from '../../../lib/Scheduler/model/DependencyModel.js';
import ProjectModel from '../../../lib/SchedulerPro/model/ProjectModel.js';
import Machine from './Machine.js';
import Order from './Order.js';
import Task from './Task.js';

// Custom Project model, based on ProjectModel with an extra API method to schedule an order
export default class ProductionProject extends ProjectModel {
    static configurable = {
        eventStore : {
            modelClass : Task
        },
        resourceStore : {
            modelClass : Machine
        },

        crudStores : [
            {
                id         : 'templates',
                tree       : true,
                modelClass : Task
            },
            {
                id         : 'orders',
                modelClass : Order
            }
        ]
    };

    get templates() {
        return this.getCrudStore('templates');
    }

    async scheduleOrder(order, startDate) {
        // First, copy template tasks into the Order model
        const
            template    = this.getCrudStore('templates').getById(order.type),
            orderTasks  = template.children.map(task => task.copy({
                orderId : order.id
            })),
            firstOrderTask = orderTasks[0];

        order.appendChild(orderTasks);

        order.firstTaskId = firstOrderTask.id;
        order.lastTaskId = order.lastChild.id;

        firstOrderTask.startDate = startDate;

        this.eventStore.add(order.children);

        /* Tasks are automatically assigned to the resource specified in the template:
        *
        *     {
        *         "name"       : "Weld",
        *         "resourceId" : 1,
        *         "duration"   : 3
        *     }
        *
        * Remains to create dependency links between them
        */
        order.children.forEach((orderTask, i) => {
            if (i < order.children.length - 1) {
                this.dependencyStore.add({
                    fromEvent : orderTask,
                    toEvent   : order.children[i + 1],
                    type      : DependencyModel.Type.EndToStart,
                    fromSide  : 'bottom',
                    toSide    : 'left'
                });
            }
        });

        // Commit changes immediately
        await this.project.commitAsync();
    }
}
