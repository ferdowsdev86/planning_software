/**
 * Application configuration
 */
import { ProjectModel } from '@bryntum/schedulerpro';

const project = (window.project = new ProjectModel({
    loadUrl  : 'data/data.json',
    autoLoad : true,

    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse : true
}));

export const schedulerProps = {
    project,
    flex           : '1 1 50%',
    startDate      : new Date(2020, 3, 26),
    endDate        : new Date(2020, 4, 10),
    viewPreset     : 'dayAndWeek',
    eventStyle     : 'filled',
    tickSize       : 70,
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    resourceImages : {
        path      : 'users/',
        extension : '.png'
    },
    columns : [
        {
            type  : 'resourceInfo',
            text  : 'Name',
            field : 'name',
            width : 130
        },
        { text : 'City', field : 'city', width : 90 }
    ]
};

export const histogramProps = {
    project,
    flex                   : '1 1 50%',
    hideHeaders            : true,
    rowHeight              : 60,
    showBarTip             : true,
    scheduleTooltipFeature : false,
    nonWorkingTimeFeature  : true,
    resourceImages         : {
        path      : 'users/',
        extension : '.png'
    },
    columns : [
        {
            type           : 'resourceInfo',
            text           : 'Name',
            field          : 'name',
            flex           : 1,
            showEventCount : false
        }
    ]
};

