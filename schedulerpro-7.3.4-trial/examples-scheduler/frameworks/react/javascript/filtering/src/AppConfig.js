/**
 * Scheduler config file
 */
import { DateHelper, StringHelper } from '@bryntum/schedulerpro';

export const schedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    eventStyle     : 'traced',
    eventColor     : null,
    resourceImages : {
        path      : 'users/',
        extension : '.png'
    },
    columns : [{
        type  : 'resourceInfo',
        text  : 'Staff',
        width : 170
    }, {
        text   : 'Role',
        field  : 'role',
        width  : 140,
        editor : {
            type        : 'combo',
            items       : ['Sales', 'Developer', 'Marketing', 'Product manager'],
            editable    : false,
            pickerWidth : 140
        }
    }],
    filterBarFeature  : true,
    stripeFeature     : true,
    timeRangesFeature : true,
    eventEditFeature  : {
        items : {
            locationField : {
                type    : 'text',
                name    : 'location',
                label   : 'Location',
                dataset : { eventType : 'Meeting' },
                weight  : 200
            }
        }
    },

    barMargin : 5,
    rowHeight : 55,

    startDate  : new Date(2017, 1, 7, 8),
    endDate    : new Date(2017, 1, 7, 18),
    viewPreset : 'hourAndDay',

    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data/data.json'
            }
        }
    },

    // Specialized event bar template with header and footer
    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        renderData.style = `background-color:${resourceRecord.color}`;

        return StringHelper.xss`
            <section>
                <div class="b-sch-event-header">${DateHelper.format(eventRecord.startDate, this.displayDateFormat)}</div>
                <div class="b-sch-event-footer">${eventRecord.name || ''}</div>
            </section>
        `;
    }
};

export const findProps = {
    placeholder          : 'Find tasks by name',
    keyStrokeChangeDelay : 80,
    clearable            : true,
    width                : '15em',
    triggers             : {
        filter : {
            align : 'start',
            cls   : 'fa fa-filter'
        }
    }
};

export const highlightProps = {
    placeholder          : 'Highlight tasks',
    keyStrokeChangeDelay : 80,
    clearable            : true,
    width                : '15em',
    triggers             : {
        filter : {
            align : 'start',
            cls   : 'fa fa-search'
        }
    }
};

