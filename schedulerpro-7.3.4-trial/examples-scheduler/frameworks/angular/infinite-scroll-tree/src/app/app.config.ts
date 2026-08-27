import { Scheduler } from '@bryntum/schedulerpro';
import { BryntumSchedulerProps } from '@bryntum/schedulerpro-angular';

const phpBaseUrl = './assets/php/';

export const schedulerProps : BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom   : true,
    viewPreset   : 'weekAndDayLetter',
    // Don't allow zooming out beyond week view, that would require loading a lot of data
    minZoomLevel : 'weekAndDayLetter',

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

    tickSize : 30,

    selectionMode : { rowNumber : true },

    columns : [
        {
            type  : 'tree',
            text  : 'Name',
            field : 'name',
            width : 270
        }
    ],

    resourceStore : {
        tree      : true,
        lazyLoad  : true,
        readUrl   : phpBaseUrl + 'resource/read.php',
        createUrl : phpBaseUrl + 'resource/create.php',
        deleteUrl : phpBaseUrl + 'resource/delete.php',
        updateUrl : phpBaseUrl + 'resource/update.php',

        autoLoad        : true,
        autoCommit      : true,
        sortParamName   : 'sort',
        filterParamName : 'filter'
    },

    eventStore : {
        lazyLoad  : true,
        readUrl   : phpBaseUrl + 'event/read.php',
        createUrl : phpBaseUrl + 'event/create.php',
        deleteUrl : phpBaseUrl + 'event/delete.php',
        updateUrl : phpBaseUrl + 'event/update.php',

        autoCommit : true,
        fields     : [
            { name : 'duration', persist : false }
        ]
    },

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
                const scheduler = source.up(Scheduler.type) as Scheduler;
                scheduler.resourceStore.load({ reset : true });
            }
        }
    ]
};
