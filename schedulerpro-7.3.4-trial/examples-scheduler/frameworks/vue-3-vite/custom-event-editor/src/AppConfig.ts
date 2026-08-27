import { type BryntumSchedulerProps } from '@bryntum/schedulerpro-vue-3';

export const schedulerProps : BryntumSchedulerProps = {
    startDate        : new Date(2025, 4, 1, 6),
    endDate          : new Date(2025, 4, 1, 20),
    viewPreset       : 'hourAndDay',
    rowHeight        : 50,
    barMargin        : 5,
    multiEventSelect : true,
    // Enables smoother wheel and pinch zooming
    smoothZoom       : true,
    resourceImages   : {
        path      : 'users/',
        extension : '.png'
    },

    dependenciesFeature   : true,
    dependencyEditFeature : {
        showLagField : false
    },

    columns : [
        {
            type  : 'resourceInfo',
            text  : 'Name',
            field : 'name',
            width : 130
        }
    ],

    // CrudManager arranges loading and syncing of data in JSON form from/to a web service
    crudManager : {
        loadUrl  : 'data/data.json',
        autoLoad : true
    }
};
