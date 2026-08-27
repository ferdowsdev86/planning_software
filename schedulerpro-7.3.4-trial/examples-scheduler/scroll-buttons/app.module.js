import shared from '../_shared/shared.module.js';
import { Scheduler } from '../../build/schedulerpro.module.js';

new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    rowHeight      : 55,
    startDate      : new Date(2024, 2, 24),
    endDate        : new Date(2024, 2, 25),
    infiniteScroll : true,
    eventColor     : 'blue',
    viewPreset     : 'hourAndDay',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    rowLines                 : false,
    scrollExtensionThreshold : '2 week',
    crudManager              : {
        autoLoad : true,
        loadUrl  : './data/data.json'
    },
    columns : [
        { type : 'resourceInfo', text : 'Name', field : 'name', showEventCount : false },
        { text : 'Role', field : 'role' }
    ],
    features : {
        // Custom Renderer for scrollButtons which shows the number of events which are out of view on a row
        scrollButtons : {
            labelRenderer({ resourceRecord, isBefore, nbrEvents }) {
                return `${nbrEvents} ${nbrEvents > 1 ? 'Events' : 'Event'}`;
            }
        }
    }
});
