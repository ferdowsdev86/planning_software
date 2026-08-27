import shared from '../_shared/shared.module.js';
import { StringHelper, SchedulerPro } from '../../build/schedulerpro.module.js';

const scheduler = new SchedulerPro({
    // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
    // loading data into all stores at once
    project : {
        autoLoad : true,
        loadUrl  : './data/data.json',

        resourceStore : {
            fields : ['rating']
        }
    },

    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    startDate      : '2022-09-04',
    endDate        : '2022-09-25',
    barMargin      : 10,
    resourceMargin : 20,
    rowHeight      : 90,
    eventStyle     : null,
    eventColor     : null,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    // Custom viewPreset (based on 'hourAndDay') that displays a compact 24 hour bottom header
    viewPreset : 'weekAndDayLetter',

    features : {
        // Not using the dependencies feature or nonWorkingTime feature
        dependencies        : false,
        nonWorkingTime      : false,
        // Using event non-working time feature
        eventNonWorkingTime : true,
        // Custom event tooltip, showing events calendar (if any)
        eventTooltip        : {
            template({ eventRecord }) {
                return eventRecord.calendar?.name ? `Uses "${StringHelper.encodeHtml(eventRecord.calendar.name)}" calendar` : 'Uses project calendar';
            }
        }
    },

    columns : [
        // Column that displays a thumb for the resource
        {
            type  : 'resourceInfo',
            text  : 'Consultant',
            width : 220
        },
        {
            type  : 'rating',
            text  : 'Rating',
            field : 'rating',
            width : 170
        }
    ],

    eventRenderer({ eventRecord, renderData }) {
        renderData.cls += ['cyan', 'green', 'purple', 'apricot'][eventRecord.id % 4] ?? 'cyan';

        if (eventRecord.calendar?.id === 'no-monday') {
            renderData.iconCls = 'fa fa-calendar-day';
        }

        if (eventRecord.calendar?.id === 'tue-thu') {
            renderData.iconCls = 'fa fa-calendar-week';
        }

        return StringHelper.encodeHtml(eventRecord.name);
    }
});
