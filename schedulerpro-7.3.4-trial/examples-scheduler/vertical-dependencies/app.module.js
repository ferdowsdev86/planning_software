import shared from '../_shared/shared.module.js';
import { Scheduler, DateHelper } from '../../build/schedulerpro.module.js';

const scheduler = new Scheduler({
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    mode : 'vertical',

    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/data.json'
    },

    startDate  : new Date(2022, 2, 7, 7),
    endDate    : new Date(2022, 2, 7, 18),
    // Customize the hourAndDay preset, to only show hours
    viewPreset : {
        base    : 'hourAndDay',
        headers : [{ unit : 'hour', dateFormat : 'LT' }]
    },
    // Make time axis occupy less space
    subGridConfigs : {
        locked : {
            width : 30
        }
    },
    barMargin      : 5,
    resourceMargin : 5,
    tickSize       : 80,

    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },

    features : {
        resourceColumnReorder : true,
        dependencies          : {
            // Round corners where dependency line segments connect
            radius : 6
        },
        regionResize : false
    },

    eventRenderer : ({ eventRecord }) => ({
        children : [
            { className : 'event-name', text : eventRecord.name },
            { className : 'event-time', text : `${DateHelper.format(eventRecord.startDate, 'LT')} - ${DateHelper.format(eventRecord.endDate, 'LT')}` }
        ]
    })
});
