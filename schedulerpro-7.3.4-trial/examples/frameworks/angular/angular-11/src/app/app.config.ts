import { BryntumSchedulerProProps } from '@bryntum/schedulerpro-angular';

export const schedulerProProps: BryntumSchedulerProProps = {
    startDate  : '2022-03-23',
    endDate    : '2022-03-24',
    viewPreset : 'hourAndDay',
    forceFit   : true,
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    columns    : [
        {
            type           : 'resourceInfo',
            text           : 'Name',
            field          : 'name',
            showEventCount : false,
            width          : 150
        }
    ]
};
