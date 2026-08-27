import { AppEventModel } from './AppEventModel';
import { BryntumSchedulerProps } from '@bryntum/scheduler-react-thin';

export const schedulerProps: BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    resourceImages : {
        path      : 'users/',
        extension : '.png'
    },

    startDate : new Date(2018, 1, 7, 8),
    endDate   : new Date(2018, 1, 7, 22),

    viewPreset : 'hourAndDay',

    crudManager : {
        eventStore : {
            modelClass : AppEventModel
        },
        loadUrl  : 'data/data.json',
        autoLoad : true
    },

    timeRangesFeature : {
        narrowThreshold : 10
    },

    columns : [
        {
            type      : 'resourceInfo',
            text      : 'Staff',
            showImage : true,
            width     : 130
        },
        {
            text  : 'Type',
            field : 'role',
            width : 130
        }
    ]
};
