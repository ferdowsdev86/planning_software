/**
 * Application configuration
 */
import { StringHelper } from '@bryntum/schedulerpro';

export const schedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    eventStyle : null,
    eventColor : null,
    rowHeight  : 50,
    barMargin  : 8,

    startDate : new Date(2017, 11, 1),
    endDate   : new Date(2017, 11, 3),

    columns : [
        {
            text  : 'Production line',
            width : 150,
            field : 'name'
        }
    ],
    stripeFeature         : true,
    dependenciesFeature   : true,
    dependencyEditFeature : {
        showLagField : false
    },
    timeRangesFeature : true,
    eventDragFeature  : {
        constrainDragToResource : true
    },
    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    viewPreset : {
        base           : 'hourAndDay',
        tickWidth      : 25,
        columnLinesFor : 0,
        headers        : [
            {
                unit       : 'd',
                align      : 'center',
                dateFormat : 'ddd DD MMM'
            },
            {
                unit       : 'h',
                align      : 'center',
                dateFormat : 'HH'
            }
        ]
    },
    eventRenderer : ({ eventRecord, resourceRecord, renderData }) => {
        const bgColor = resourceRecord.bg || '';

        renderData.style = `background:${bgColor};border-color:${bgColor};color:${resourceRecord.textColor}`;
        renderData.iconCls.add('fa', `fa-${resourceRecord.icon}`);

        return StringHelper.encodeHtml(eventRecord.name);
    }
};

