import { ResourceInfoColumn } from '@bryntum/scheduler-thin';
import { type BryntumSchedulerProProps, type BryntumSchedulerProProjectModelProps } from '@bryntum/schedulerpro-vue-3-thin';

export const projectProps : BryntumSchedulerProProjectModelProps = {
    loadUrl  : 'data/data.json',
    autoLoad : true
};

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
            type  : ResourceInfoColumn.type,
            text  : 'Name',
            field : 'name',
            width : 130
        }
    ]
};
