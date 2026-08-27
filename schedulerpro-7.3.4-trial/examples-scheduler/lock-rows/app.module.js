import shared from '../_shared/shared.module.js';
import { StringHelper, Scheduler } from '../../build/schedulerpro.module.js';

const scheduler = new Scheduler({
    appendTo            : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom          : true,
    rowHeight           : 60,
    tickSize            : 50,
    useInitialAnimation : false,
    // Looks nicer when locking rows without sticky headers
    stickyHeaders       : false,

    startDate   : new Date(2024, 6, 3),
    end         : new Date(2024, 7, 28),
    crudManager : {
        autoLoad      : true,
        loadUrl       : 'data/data.json',
        resourceStore : {
            fields : [
                { name : 'favorite', type : 'boolean' }
            ]
        }
    },

    columns : [
        { type : 'rownumber' },
        { type : 'check', text : 'Fav', field : 'favorite', width : 60, sortable : false, filterable : false },
        {
            text       : 'Name',
            field      : 'name',
            width      : 250,
            htmlEncode : false,
            filterable : {
                filterField : {
                    placeholder : 'Search machines...',
                    triggers    : {
                        search : {
                            align : 'start',
                            cls   : 'fa fa-magnifying-glass'
                        }
                    }
                }
            },
            renderer : ({ record }) => {
                return StringHelper.xss`<div class="name">${record.name}</div><div class="type">${record.type}</div>`;
            }
        }
    ],

    features : {
        regionResize : false,
        lockRows     : {
            fieldName        : 'favorite',
            bottomGridConfig : {
                hideHeaders : false,
                features    : {
                    filterBar : { compactMode : true }
                }
            }
        },
        cellMenu : {
            processItems({ items, record }) {
                if (items.toggleLocked) {
                    items.toggleLocked.text = 'Toggle favorite';
                }
            }
        },
        // Looks nicer when locking rows without sticky events
        stickyEvents : false
    },

    viewPreset : {
        base           : 'weekAndDayLetter',
        // Column lines for weeks instead of days, for a cleaner look
        columnLinesFor : 0
    }
});
