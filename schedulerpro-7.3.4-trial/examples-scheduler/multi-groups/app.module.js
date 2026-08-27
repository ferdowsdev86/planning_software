import shared from '../_shared/shared.module.js';
import { Scheduler } from '../../build/schedulerpro.module.js';

new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    startDate      : new Date(2023, 8, 19),
    endDate        : new Date(2023, 8, 26),
    barMargin      : 15,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },

    features : {
        group : {
            field : 'team'
        }
    },

    columns : [
        {
            type           : 'resourceInfo',
            text           : 'Name',
            field          : 'name',
            width          : 220,
            showEventCount : false,
            showMeta(resource) {
                return resource.team.join(', ');
            }
        }
    ],

    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data/data.json'
            }
        },

        resourceStore : {
            // Additional resource fields
            fields  : ['team'],
            // Sort by name initially
            sorters : [
                { field : 'name', ascending : true }
            ]
        }
    }
});
