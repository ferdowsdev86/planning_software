import EventModel from '../../../lib/SchedulerPro/model/EventModel.js';

// Custom Task model, based on EventModel with additional fields and changed defaults
export default class Task extends EventModel {
    static fields = [
        { name : 'iconCls', defaultValue : 'fa fa-bus' },
        { name : 'licensePlate', defaultValue : '', description : 'The license plate of the vehicle being worked on' },
        { name : 'skillIds', type : 'array' },
        { name : 'durationUnit', defaultValue : 'h' },
        { name : 'skills' }
    ];

    get skills() {
        const skillStore = this.firstStore?.crudManager.getCrudStore('skills');
        return skillStore && this.skillIds ? skillStore.getByIds(this.skillIds) : [];
    }

    get requiredSkillNames() {
        return this.skills?.map(s => s.name) || [];
    }
}
