/**
 * Configuration of project, scheduler, histogram and toolbar
 */
import { ProjectModel } from '@bryntum/schedulerpro';

const project = ((window as any).project = new ProjectModel({
    transport : {
        load : {
            url : 'assets/data/data.json'
        }
    },
    autoLoad : true,

    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse : true
}));

export const schedulerProProps = {
    schedulerId       : 'top-scheduler',
    startDate         : new Date(2020, 3, 26),
    endDate           : new Date(2020, 4, 10),
    viewPreset        : 'dayAndWeek',
    eventStyle        : 'filled',
    tickSize          : 70,
    resourceImagePath : 'assets/users',
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,

    columns : [
        {
            type  : 'resourceInfo',
            text  : 'Name',
            field : 'name',
            width : 130
        },
        { text : 'City', field : 'city', width : 90 }
    ],

    project
};

export const histogramProps = {
    partner : 'top-scheduler',
    columns : [
        {
            type           : 'resourceInfo',
            text           : 'Name',
            field          : 'name',
            flex           : 1,
            showEventCount : false
        }
    ],
    resourceImagePath      : 'assets/users',
    rowHeight              : 60,
    scheduleTooltipFeature : false,
    showBarText            : false,
    showBarTip             : true,
    showMaxEffort          : true,
    project
};
