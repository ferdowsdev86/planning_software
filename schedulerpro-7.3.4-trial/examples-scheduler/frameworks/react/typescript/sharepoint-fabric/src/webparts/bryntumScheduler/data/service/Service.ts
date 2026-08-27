import BaseService from './BaseService';

import { getSP } from '../../pnpjsConfig';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/site-users';
import '@pnp/sp/fields';
import { CalendarType, DateTimeFieldFormatType } from '@pnp/sp/fields/types';

import TaskList from './proxy/TaskList';
import MyEventModel from '../model/SchedulerEventModel';
import MyResourceModel from '../model/SchedulerResourceModel';
import MyDependencyModel from '../model/SchedulerDependencyModel';
import { SchedulerAssignmentModel } from '@bryntum/schedulerpro-thin';

/**
 * Service used on the Tenant
 */
export default class Service extends BaseService {

    constructor() {

        super({
            resourceStore   : { modelClass : MyResourceModel },
            eventStore      : { modelClass : MyEventModel },
            assignmentStore : { modelClass : SchedulerAssignmentModel },
            dependencyStore : { modelClass : MyDependencyModel }
        });

        this.proxy = new TaskList();
    }

    /**
     * Create a new tasklist with demo data.
     *
     * @param name
     * @param sampleData
     */
    public ensureList(name: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {

            const sp = getSP();
            sp.web.lists.ensure(name, 'Bryntum demo', 171, true, {
                AllowContentTypes : true,
                EnableAttachments : true
            }).then(async listEnsureResult => {

                const
                    list = listEnsureResult.list,
                    data = await list();

                if (listEnsureResult.created) {
                    const fieldsToAdd = MyEventModel.additionalFields;

                    try {
                        for (let i = 0; i < fieldsToAdd.length; i++) {
                            const field = fieldsToAdd[i];
                            switch (field.type) {
                                case 'number':
                                    await list.fields.addNumber(field.dataSource);
                                    break;
                                case 'date':
                                    await list.fields.addDateTime(field.dataSource, { DisplayFormat : DateTimeFieldFormatType.DateTime, DateTimeCalendarType : CalendarType.Gregorian });
                                    break;
                                case 'boolean':
                                    await list.fields.addBoolean(field.dataSource);
                                    break;
                                default:
                                    await list.fields.addText(field.dataSource);
                                    break;
                            }
                        }
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                resolve(data.Id);
            }).catch(() => {});
        });
    }

    /**
     * Get all SharePoint tasklists.
     */
    public getTaskLists(): Promise<{ key: string; text: string }[]> {
        return new Promise((resolve, reject) => {
            const sp = getSP();
            // Template id 171 is the default for a SharePoint TaskList
            sp.web.lists.filter('BaseTemplate eq 171')().then((lists: any) => {
                if (lists.length > 0) {
                    // We filter on `Bryntum demo`.
                    resolve(lists.filter(item => item.Description === 'Bryntum demo').map((list: any) => {
                        return { key : list.Id, text : list.Title };
                    }));
                }
                else {
                    reject({ code : 2, message : 'Please create a tasklist.' });
                }
            }).catch(reject);
        });
    }
}
