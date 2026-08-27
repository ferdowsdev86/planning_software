import ResourceModel from '../../../lib/SchedulerPro/model/ResourceModel.js';

export default class DriverResource extends ResourceModel {
    static get fields() {
        return [
            'vehicle',
            'active'
        ];
    }
}
