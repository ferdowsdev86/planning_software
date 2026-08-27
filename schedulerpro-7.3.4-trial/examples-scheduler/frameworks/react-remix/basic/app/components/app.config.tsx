/**
 * Application configuration
 */
import { BryntumSchedulerProps } from '@bryntum/schedulerpro-react';

export const schedulerProps: BryntumSchedulerProps = {

    // Enables smoother wheel and pinch zooming
    smoothZoom       : true,
    startDate        : new Date(2022, 2, 20, 6),
    endDate          : new Date(2022, 2, 20, 20),
    viewPreset       : 'hourAndDay',
    rowHeight        : 50,
    barMargin        : 5,
    multiEventSelect : true,

    columns : [
        { text : 'Name', field : 'name', width : 130 }
    ],

    crudManager : {
        loadUrl  : 'data/project-data.json',
        autoLoad : true
    }
};

