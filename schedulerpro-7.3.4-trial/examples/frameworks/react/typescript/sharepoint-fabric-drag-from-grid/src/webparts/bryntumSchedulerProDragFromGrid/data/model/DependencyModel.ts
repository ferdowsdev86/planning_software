import { DependencyModel } from '@bryntum/schedulerpro-thin';

export default class MyDependencyModel extends DependencyModel {

    // We do not store Lag in this demo.
    static get fields() {
        return [
            { name : 'lag', readOnly : true }
        ];
    }
}
