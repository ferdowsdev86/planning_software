import { type BryntumSchedulerProProps, type BryntumSchedulerProProjectModelProps } from '@bryntum/schedulerpro-angular-thin';

export const projectProps : BryntumSchedulerProProjectModelProps = {
    loadUrl  : 'assets/data/data.json',
    autoLoad : true
};

export const schedulerProProps : BryntumSchedulerProProps = {
    startDate         : new Date(2024, 0, 1, 6),
    endDate           : new Date(2024, 0, 1, 20),
    viewPreset        : 'hourAndDay',
    rowHeight         : 50,
    barMargin         : 5,
    multiEventSelect  : true,
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,
    resourceImagePath : 'assets/users/',
    columns           : [
        {
            type  : 'resourceInfo',
            text  : 'Name',
            field : 'name',
            width : 130
        }
    ]

};
