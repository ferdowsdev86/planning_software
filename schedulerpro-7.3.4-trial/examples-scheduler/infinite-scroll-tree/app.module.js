import shared from '../_shared/shared.module.js';
import { Scheduler } from '../../build/schedulerpro.module.js';

const scheduler = new Scheduler({
    appendTo     : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom   : true,
    // Don't allow zooming out beyond week view, that would require loading a lot of data
    minZoomLevel : 'weekAndDayLetter',
    viewPreset   : 'weekAndDayLetter',

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

    features : {
        // Grouping is not supported when using a lazyLoad store
        group  : false,
        filter : false,
        tree   : true
    },

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
        readUrl   : './php/resource/read.php',
        createUrl : './php/resource/create.php',
        deleteUrl : './php/resource/delete.php',
        updateUrl : './php/resource/update.php',

        autoLoad        : true,
        autoCommit      : true,
        sortParamName   : 'sort',
        filterParamName : 'filter'
    },

    eventStore : {
        lazyLoad  : true,
        readUrl   : './php/event/read.php',
        createUrl : './php/event/create.php',
        deleteUrl : './php/event/delete.php',
        updateUrl : './php/event/update.php',

        autoCommit : true,
        fields     : [{ name : 'duration', persist : false }]
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
            onClick() {
                scheduler.resourceStore.load({ reset : true });
            }
        }
    ]
});
