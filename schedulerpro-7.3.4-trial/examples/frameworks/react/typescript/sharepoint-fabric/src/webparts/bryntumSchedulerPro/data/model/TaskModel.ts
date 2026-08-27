import LookupTaskModel from './LookupTaskModel';

export default class TaskModel extends LookupTaskModel {

    // Fields which are not on a default SharePoint TaskList. Needs to be added to the TaskList.
    static get additionalFields() {
        return [
            { name : 'constraintDate', dataSource : 'ConstraintDate', type : 'date' },
            { name : 'constraintType', dataSource : 'ConstraintType' },
            { name : 'effort', dataSource : 'Effort', type : 'number' },
            { name : 'duration', dataSource : 'Duration', type : 'number', allowNull : true },
            { name : 'manuallyScheduled', dataSource : 'ManuallyScheduled', type : 'boolean' }
        ];
    }

    // Fields available on a default SharePoint TaskList.
    static get fields() {
        return [
            { name : 'startDate', dataSource : 'StartDate', type : 'date' },
            { name : 'endDate', dataSource : 'DueDate', type : 'date' },
            { name : 'percentDone', dataSource : 'PercentComplete', type : 'number', serialize : val => val / 100, defaultValue : 0 },
            { name : 'GUID' },
            { name : 'status', dataSource : 'Status' },
            { name : 'priority', dataSource : 'Priority' },
            { name : 'note', dataSource : 'Body' },
            { name : 'name', dataSource : 'Title' },
            {
                name         : 'predecessorId',
                dataSource   : 'PredecessorsId',
                convert      : LookupTaskModel.setIntArrayAsStringValue,
                serialize    : (value, record) => record.serializeMultiLookupValue(value),
                defaultValue : ''
            },
            {
                name         : 'assignedToId',
                dataSource   : 'AssignedToId',
                convert      : LookupTaskModel.setIntArrayAsStringValue,
                serialize    : (value, record) => record.serializeMultiLookupValue(value),
                defaultValue : ''
            }
        ].concat(this.additionalFields);
    }
}
