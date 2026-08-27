import Model from '../../../lib/Core/data/Model.js';

export default class Skill extends Model {
    static fields = [
        // Add additional Skill related fields here
        { name : 'name', description : 'The name of the skill' }
    ];

    get classDisplayName() {
        return this.name;
    }
}
