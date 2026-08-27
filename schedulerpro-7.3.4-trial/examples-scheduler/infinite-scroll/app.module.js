import shared from '../_shared/shared.module.js';
import { Scheduler } from '../../build/schedulerpro.module.js';

const scheduler = new Scheduler({
    appendTo     : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom   : true,
    // Don't allow zooming out beyond week and month view, that would require loading a lot of data
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
        group              : false,
        filter             : false,
        resourceTimeRanges : true
    },

    columns : [
        {
            text   : 'Name',
            field  : 'name',
            width  : 200,
            editor : {
                type     : 'textfield',
                required : true
            }
        }
    ],

    resourceStore : {
        lazyLoad : true,
        // Uncomment these and comment out below to use the express.js backend
        // readUrl   : 'http://lh:3000/read-resources',
        // createUrl : 'http://lh:3000/create-resources',
        // deleteUrl : 'http://lh:3000/delete-resources',
        // updateUrl : 'http://lh:3000/update-resources',

        // Comment out these and uncomment above to use the express.js backend
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
        lazyLoad : true,

        // Uncomment these and comment out below to use the express.js backend
        // readUrl   : 'http://localhost:3000/read-events',
        // createUrl : 'http://localhost:3000/create-events',
        // deleteUrl : 'http://localhost:3000/delete-events',
        // updateUrl : 'http://localhost:3000/update-events',

        // Comment out these and uncomment above to use the express.js backend
        readUrl   : './php/event/read.php',
        createUrl : './php/event/create.php',
        deleteUrl : './php/event/delete.php',
        updateUrl : './php/event/update.php',

        autoCommit : true,
        fields     : [{ name : 'duration', persist : false }]
    },

    resourceTimeRangeStore : {
        lazyLoad : true,

        // Uncomment this line and comment out below to use the express.js backend
        // readUrl : 'http://lh:3000/read-resourcetimeranges'
        readUrl : './php/resourcetimerange/read.php'
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
                // In addition to clearing all records, this will also remove any lazy loading cache on these stores
                scheduler.resourceStore.data = null;
                scheduler.eventStore.data = null;
                scheduler.resourceTimeRangeStore.data = null;
                // As the SchedulerResourceStore is an AjaxStore, calling load with a params object will include these parameters
                // in the lazy load server request.
                scheduler.resourceStore.load({ reset : true });
            }
        }
    ]
});
