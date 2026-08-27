/**
 * Configuration for the scheduler
 */
import { Scheduler, StringHelper } from '@bryntum/schedulerpro';

export const schedulerProps = {
    eventColor : null,
    barMargin  : 1,
    rowHeight  : 50,
    startDate  : new Date(2017, 1, 7, 8),
    endDate    : new Date(2017, 1, 7, 18),
    viewPreset : 'hourAndDay',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    useInitialAnimation : 'slide-from-left',

    resourceImages : {
        path      : 'users/',
        extension : '.png'
    },

    columns : [
        {
            type  : 'resourceInfo',
            text  : 'Staff',
            field : 'name',
            width : 150
        },
        {
            text       : 'Task color',
            field      : 'eventColor',
            width      : 140,
            htmlEncode : false,
            renderer   : ({ record }) =>
                `<div class="color-box b-bryntum b-color-${record.eventColor}"></div>${StringHelper.capitalize(record.eventColor)}`,
            editor : {
                type        : 'combo',
                items       : Scheduler.eventColors,
                editable    : false,
                listItemTpl : ({ value }) =>
                    `<div class="color-box b-bryntum b-color-${value}"></div><div>${value}</div>`
            }
        }
    ],

    timeRangesFeature : true,

    crudManager : {
        autoLoad         : true,
        loadUrl          : 'data/data.json',
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    }
};

export const sliderProps = {
    min         : 0,
    max         : 3000,
    value       : 600,
    step        : 200,
    showValue   : false,
    showTooltip : true
};
