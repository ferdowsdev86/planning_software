import { SchedulerDependencyModel } from '@bryntum/schedulerpro-thin';

export default class MyDependencyModel extends SchedulerDependencyModel {

    // We do not store Lag in this demo.
    static get fields() {
        return [
            { name : 'lag', readOnly : true }
        ];
    }
}
