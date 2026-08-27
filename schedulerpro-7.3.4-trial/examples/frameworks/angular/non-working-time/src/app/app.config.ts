import { PresetManager } from '@bryntum/schedulerpro';
import { BryntumSchedulerProProps } from '@bryntum/schedulerpro-angular';

const zoomLevels = {
    minuteAndHour : 1,
    hourAndDay    : 1
};

export const schedulerProProps: BryntumSchedulerProProps = {
    // Limit zoom levels to those which use hours to make filtering non-working time works better in this demo
    presets : PresetManager.records.filter(preset => zoomLevels[preset.id]),

    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
    // loading data into all stores at once
    project : {
        autoLoad  : true,
        transport : {
            load : {
                url : './assets/data/data.json'
            }
        }
    },
    startDate         : '2020-03-23',
    endDate           : '2020-03-28',
    rowHeight         : 90,
    barMargin         : 15,
    eventStyle        : 'bordered',
    resourceImagePath : './assets/users/',

    // Custom viewPreset (based on 'hourAndDay') that displays a compact 24 hour bottom header
    viewPreset : {
        base              : 'hourAndDay',
        tickWidth         : 30,
        displayDateFormat : 'll HH:mm',
        headers           : [
            {
                unit       : 'day',
                dateFormat : 'ddd DD/MM' //Mon 01/10
            },
            {
                unit       : 'hour',
                dateFormat : 'HH'
            }
        ]
    },

    // Not using the dependencies feature
    dependenciesFeature : false,

    columns : [
    // Column that displays a thumb for the resource
        {
            type : 'resourceInfo',
            text : 'Manager'
        }
    ],

    tbar : [
    // Add a button to filter out non-working time
        {
            ref  : 'filterButton',
            type : 'slidetoggle',
            text : 'Filter out non-working time'
        }
    ]
};
