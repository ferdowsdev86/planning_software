import ResourceModel from '../../../lib/SchedulerPro/model/ResourceModel.js';

export default class Resource extends ResourceModel {
    static fields = [
        'flag'
    ];

    get readOnly() {
        return this.isParent;
    }

    get rowHeight() {
        if (this.isLeaf) {
            return super.rowHeight;
        }
        return 45;
    }
}
