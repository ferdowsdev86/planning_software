import { type CalendarModelConfig, type CheckboxListeners, PresetManager, StringHelper, ViewPreset } from '@bryntum/schedulerpro';
import type { BryntumSchedulerProProjectModelProps, BryntumSchedulerProProps } from '@bryntum/schedulerpro-react';

const zoomLevels: Record<string, boolean> = {
    minuteAndHour : true,
    hourAndDay    : true
};

const durationColors: Record<number, string> = {
    0 : 'blue',
    1 : 'indigo',
    2 : 'violet'
};

export const calendars: CalendarModelConfig[] = [
    {
        id                       : 'workhours',
        name                     : 'Working hours',
        unspecifiedTimeIsWorking : true
    }
];

export const calendarsWithIntervals: CalendarModelConfig[] = [
    {
        id                       : 'workhours',
        name                     : 'Working hours',
        unspecifiedTimeIsWorking : true,
        intervals                : [
            {
                recurrentStartDate : 'at 16:00',
                recurrentEndDate   : 'at 00:00',
                isWorking          : false,
                name               : 'Non working time'
            },
            {
                startDate : new Date(2020, 2, 23, 2, 0),
                endDate   : new Date(2020, 2, 23, 4, 0),
                isWorking : false,
                cls       : 'factoryShutdown',
                name      : 'Factory shutdown'
            }
        ]
    }
];

export const useSchedulerProProps = ({ onFilter, onIntervals }: {
    onFilter: CheckboxListeners['change']
    onIntervals: CheckboxListeners['change']
}): BryntumSchedulerProProps => ({
    // Limit zoom levels to those which use hours to make filtering non-working time works better in this demo
    presets    : (PresetManager.records as ViewPreset[]).filter(preset => zoomLevels[preset.id]),
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    startDate         : '2020-03-23',
    endDate           : '2020-03-28',
    rowHeight         : 90,
    barMargin         : 15,
    eventStyle        : 'bordered',
    resourceImagePath : './users/',

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

    // Custom event renderer that displays small thumbs for assigned resources
    eventRenderer({ eventRecord, renderData }) {

        // Project length determines color
        renderData.eventColor = durationColors[Math.min(Math.floor(eventRecord.duration / 9), 2)];

        // Custom content, displays images for assigned resources + event name
        return [
            {
                html : StringHelper.encodeHtml(eventRecord.name)
            },
            {
                className : 'assigned',
                children  : eventRecord.resources.map(resource => ({
                    tag       : 'img',
                    draggable : false,
                    src       : resource.image !== false ? this.resourceImagePath + resource.name.toLowerCase() + '.png' : null,
                    alt       : StringHelper.encodeHtml(resource.name),
                    dataset   : {
                        resourceId : resource.id
                    }
                }))
            }
        ];
    },

    tbar : [
        // Add a button to filter out non-working time
        {
            ref      : 'filterCheck',
            type     : 'slidetoggle',
            text     : 'Filter out non-working time',
            onAction : onFilter
        },
        {
            ref      : 'clearIntervalsCheck',
            type     : 'slidetoggle',
            text     : 'Use non-working time intervals',
            checked  : true,
            onAction : onIntervals
        }

    ]
});

export const projectProps: BryntumSchedulerProProjectModelProps = {
    autoLoad  : true,
    transport : {
        load : {
            url : './data/data.json'
        }
    },
    calendar : 'workhours'
};
