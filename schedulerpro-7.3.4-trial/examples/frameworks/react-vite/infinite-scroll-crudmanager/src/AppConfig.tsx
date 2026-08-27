import { BryntumSchedulerProProps } from '@bryntum/schedulerpro-react';
import { SchedulerPro } from '@bryntum/schedulerpro';

const phpUrl = '../php/';

export const schedulerProps : BryntumSchedulerProProps = {
    viewPreset : 'dayAndMonth',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    // To center the view on a certain date
    visibleDate : new Date(2024, 1, 6),

    // Enables endless timeline scrolling
    infiniteScroll  : true,
    // The infiniteScroll gets a better UX if a larger bufferCoef is used. When using lazyLoading, this only means that
    // the timeline "shifts" more seldom. Only events inside or close to the visible date range is requested from the
    // backend
    bufferCoef      : 20,
    // Affects when the timespan shifts upon horizontal scroll
    bufferThreshold : 0.01,

    // Current backend easily runs out of memory, this prevents the requested date ranges from being too long
    minZoomLevel : 'weekAndDayLetter',

    tickSize : 30,

    project : {
        autoLoad        : true,
        autoSync        : true,
        lazyLoad        : true,
        loadUrl         : phpUrl + 'read.php',
        syncUrl         : phpUrl + 'sync.php',
        phantomIdField  : 'phantomId',
        assignmentStore : {
            syncDataOnLoad : false
        },
        resourceStore : {
            syncDataOnLoad : false,
            fields         : [
                { name : 'calendar', persist : false },
                { name : 'maxUnit', persist : false },
                { name : 'parentId', persist : false }
            ]
        },
        eventStore : {
            syncDataOnLoad : false,
            fields         : [
                { name : 'duration', persist : false },
                { name : 'effort', persist : false },
                { name : 'constraintDate', persist : false }
            ]
        }
    },

    // Grouping is not supported when using a lazyLoad store
    groupFeature  : false,
    filterFeature : false,

    columns : [
        {
            text       : 'Resource',
            field      : 'name',
            width      : 200,
            sortable   : false,
            filterable : false
        }
    ],

    tbar : [
        {
            type : 'viewpresetcombo'
        },
        '->',
        {
            type : 'button',
            text : 'Reset data',
            icon : 'fa fa-refresh',
            ref  : 'resetButton',
            onClick({ source }) {
                const scheduler = source.up(SchedulerPro.type) as SchedulerPro;

                // In addition to clearing all records, this will also remove any lazy loading cache on these stores
                scheduler.eventStore.data = [];
                scheduler.assignmentStore.data = [];
                scheduler.resourceStore.data = [];
                fetch(phpUrl + 'reset.php').then(() => {
                    scheduler.project.load();
                });
            }
        }
    ]
};
