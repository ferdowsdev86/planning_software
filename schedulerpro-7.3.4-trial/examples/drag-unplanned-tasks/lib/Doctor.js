import ResourceModel from '../../../lib/SchedulerPro/model/ResourceModel.js';

// Custom Doctor resource model, based on ResourceModel with additional fields
export default class Doctor extends ResourceModel {
    static fields = [
        'role',
        'roleIconCls'
    ];
}
