import shared from '../_shared/shared.module.js';
import { StringHelper, SchedulerPro } from '../../build/schedulerpro.module.js';

const scheduler = new SchedulerPro({
    // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
    // loading data into all stores at once
    project : {
        autoLoad : true,
        loadUrl  : './data/data.json'
    },

    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    startDate  : '2020-03-23',
    endDate    : '2020-03-24',
    rowHeight  : 60,
    barMargin  : 15,
    viewPreset : 'hourAndDay',
    eventStyle : 'traced',

    features : {
        eventDrag : {
            // Prevent reassigning events using drag and drop
            constrainDragToResource : true
        },
        stickyEvents : false
    },

    columns : [
        // A column using a custom render to display an icon + text
        {
            text       : 'Resource',
            width      : 150,
            field      : 'name',
            // We want to use custom markup
            htmlEncode : false,
            // Renderer that returns a DOM config object, a more performant way than returning a html string, allows
            // reusing elements as cells are re-rendered
            renderer   : ({ record }) => ({
                children : [
                    // <i> tag with the icon
                    record.icon ? {
                        tag       : 'i',
                        className : `fa fa-fw ${record.icon}`,
                        style     : 'margin-right: .5em'
                    } : null,
                    // text node with the name
                    record.name
                ]
            })
        }
    ],

    eventRenderer({ eventRecord }) {
        // Display name from the segment, or the event it belongs to
        return StringHelper.encodeHtml(eventRecord.name || eventRecord.event?.name);
    },

    tbar : [
        {
            type    : 'slidetoggle',
            text    : 'Auto-merge adjacent segments',
            checked : true,
            tooltip : 'If two segments are placed next to each other, you can either have them be merged or keep them separated',
            onChange({ checked }) {
                scheduler.project.autoMergeAdjacentSegments = checked;
            }
        }
    ]

});
