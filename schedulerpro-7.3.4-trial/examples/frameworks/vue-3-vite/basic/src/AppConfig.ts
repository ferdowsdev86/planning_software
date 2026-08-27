import { type BryntumSchedulerProProps } from '@bryntum/schedulerpro-vue-3';

export const schedulerProProps : BryntumSchedulerProProps = {
    startDate         : new Date(2024, 0, 1, 6),
    endDate           : new Date(2024, 0, 1, 20),
    viewPreset        : 'hourAndDay',
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,
    rowHeight         : 50,
    barMargin         : 5,
    multiEventSelect  : true,
    resourceImagePath : 'users/',
    columns           : [
        {
            type  : 'resourceInfo',
            text  : 'Name',
            field : 'name',
            width : 130
        }
    ],
    // CrudManager arranges loading and syncing of data in JSON form from/to a web service
    project : {
        loadUrl  : 'data/data.json',
        autoLoad : true
    }
};
