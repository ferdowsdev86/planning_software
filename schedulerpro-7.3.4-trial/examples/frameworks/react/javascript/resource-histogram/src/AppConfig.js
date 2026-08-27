/**
 * Application configuration
 */
import React from 'react';
// Toolbar
const onAction = ({ source }) => {
    source.up('resourcehistogram').extraData.onToolbarAction(source);
};

const toolbarConfig = {
    cls   : 'histogram-toolbar',
    items : [
        {
            type    : 'checkbox',
            dataset : { action : 'showBarText' },
            text    : 'Show bar texts',
            tooltip : 'Check to show resource allocation in the bars',
            checked : false,
            onAction
        },
        {
            type    : 'checkbox',
            dataset : { action : 'showMaxEffort' },
            text    : 'Show max allocation',
            tooltip : 'Check to display max resource allocation line',
            checked : true,
            onAction
        },
        {
            type    : 'checkbox',
            dataset : { action : 'showBarTip' },
            text    : 'Enable bar tooltip',
            tooltip : 'Check to show tooltips when moving mouse over bars',
            checked : true,
            onAction
        }
    ]
};

export const projectProps = {
    transport : {
        load : {
            url : 'data/data.json'
        }
    },
    autoLoad : true,

    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse : true
};

// Scheduler
export const schedulerProps = {
    flex              : '1 1 50%',
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,
    startDate         : new Date(2020, 3, 26),
    endDate           : new Date(2020, 4, 10),
    viewPreset        : 'dayAndWeek',
    eventStyle        : 'filled',
    tickSize          : 70,
    resourceImagePath : 'users/',
    subGridsConfigs   : {
        locked : {
            width : '30em'
        }
    },

    columns : [
        {
            type  : 'resourceInfo',
            text  : 'Name',
            field : 'name',
            width : '10em'
        },
        {
            text                 : 'City<div><small>React JSX</small></div>',
            htmlEncodeHeaderText : false,
            field                : 'city',
            width                : '9em',
            renderer             : ({ value }) => <div>{value}</div>
        }
    ]
};

// Histogram
export const histogramProps = {
    flex                   : '1 1 50%',
    hideHeaders            : true,
    rowHeight              : 60,
    resourceImagePath      : 'users/',
    nonWorkingTimeFeature  : true,
    scheduleTooltipFeature : false,
    showBarTip             : true,
    bbar                   : toolbarConfig,
    columns                : [
        {
            type           : 'resourceInfo',
            text           : 'Name',
            field          : 'name',
            flex           : 1,
            showEventCount : false
        }
    ]
};

