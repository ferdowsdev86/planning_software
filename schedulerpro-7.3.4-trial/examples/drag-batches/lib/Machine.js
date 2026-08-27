import ResourceModel from '../../../lib/SchedulerPro/model/ResourceModel.js';

// Custom Machine model, based on ResourceModel with additional fields
export default class Machine extends ResourceModel {
    static fields = [
        'capacity',
        'running',
        'statusMessage'
    ];
}
