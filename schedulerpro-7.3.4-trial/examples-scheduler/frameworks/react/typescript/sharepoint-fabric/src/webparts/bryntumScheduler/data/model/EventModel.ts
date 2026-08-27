import LookupEventModel from './LookupEventModel';

export default class SchedulerEventModel extends LookupEventModel {

    // Fields which are not on a default SharePoint TaskList should be added here
    static get additionalFields() {
        return [];
    }

    // Fields available on a default SharePoint TaskList.
    static get fields() {
        return [
            { name : 'startDate', dataSource : 'StartDate', type : 'date' },
            { name : 'endDate', dataSource : 'DueDate', type : 'date' },
            { name : 'GUID' },
            { name : 'note', dataSource : 'Body' },
            { name : 'name', dataSource : 'Title' },
            {
                name         : 'predecessorId',
                dataSource   : 'PredecessorsId',
                convert      : LookupEventModel.setIntArrayAsStringValue,
                serialize    : (value, record) => record.serializeMultiLookupValue(value),
                defaultValue : ''
            },
            {
                name         : 'assignedToId',
                dataSource   : 'AssignedToId',
                convert      : LookupEventModel.setIntArrayAsStringValue,
                serialize    : (value, record) => record.serializeMultiLookupValue(value),
                defaultValue : ''
            }
        ].concat(this.additionalFields);
    }
}
