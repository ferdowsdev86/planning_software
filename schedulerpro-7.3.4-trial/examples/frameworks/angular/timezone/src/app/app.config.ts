import { BryntumSchedulerProProps } from '@bryntum/schedulerpro-angular';

export const schedulerProProps: BryntumSchedulerProProps = {
    resourceImagePath : './assets/users/',
    barMargin         : 5,
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,

    project : {
        loadUrl : 'timezone-data'
    },

    timeRangesFeature : {
        showCurrentTimeLine : true,
        showHeaderElements  : false
    },

    resourceTimeRangesFeature : true,
    nestedEventsFeature       : true,

    columns : [
        { type : 'resourceInfo', text : 'Staff', field : 'name', width : '10em' }
    ],

    viewPreset : 'hourAndDay',
    rowHeight  : 90
};
