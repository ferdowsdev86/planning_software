import shared from '../_shared/shared.module.js';
import { Scheduler } from '../../build/schedulerpro.module.js';

new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    minHeight      : '20em',
    barMargin      : 1,
    rowHeight      : 50,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    eventStyle  : 'indented',
    columnLines : false,
    startDate   : new Date(2021, 5, 3, 8),
    endDate     : new Date(2021, 5, 3, 18),
    viewPreset  : 'hourAndDay',

    columns : [
        { type : 'resourceCollapse' },
        { type : 'resourceInfo', text : 'Staff' }
    ],

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
    }
});
