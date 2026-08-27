import { BryntumSchedulerProProps } from '@bryntum/schedulerpro-react';

export const schedulerproProps: BryntumSchedulerProProps = {

    startDate  : new Date(2022, 2, 23, 2),
    endDate    : new Date(2022, 2, 23, 18),
    rowHeight  : 60,
    barMargin  : 15,
    eventStyle : 'indented',
    viewPreset : 'hourAndDay',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    columns : [
        {
            text      : 'Resource',
            type      : 'resourceInfo',
            showImage : false,
            width     : 150
        }
    ],

    project : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data/data.json'
            }
        }
    }

};

