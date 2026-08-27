import shared from '../_shared/shared.module.js';
import { SchedulerPro, DateHelper, StringHelper } from '../../build/schedulerpro.module.js';



const
    constraintNames = {
        muststarton         : 'Must start on',
        mustfinishon        : 'Must finish on',
        startnoearlierthan  : 'Start no earlier than',
        startnolaterthan    : 'Start no later than',
        finishnoearlierthan : 'Finish no earlier than',
        finishnolaterthan   : 'Finish no later than'
    },
    rightJustifyIcon  = {
        finishnoearlierthan : 1,
        finishnolaterthan   : 1,
        mustfinishon        : 1
    };

const scheduler = new SchedulerPro({
    // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
    // loading data into all stores at once
    project : {
        autoLoad : true,
        loadUrl  : './data/data.json'
    },

    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    startDate      : '2020-03-23',
    endDate        : '2020-03-28',
    rowHeight      : 70,
    barMargin      : 15,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    eventColor : 'blue',
    eventStyle : 'tonal',

    viewPreset : 'dayAndWeek',

    features : {
        eventTooltip : {
            // Custom event tooltip template, to display constraint info
            template : ({ eventRecord : { startDate, duration, durationUnit, constraintType, constraintDate } }) => ({
                children : [
                    {
                        tag      : 'dl',
                        children : [
                            { tag : 'dt', html : 'Start' },
                            { tag : 'dd', html : DateHelper.format(startDate, 'll LT') },
                            { tag : 'dt', html : 'Duration' },
                            { tag : 'dd', html : `${Math.round(10 * duration) / 10} ${durationUnit}${duration > 1 ? 's' : ''}` },
                            constraintType
                                ? { tag : 'dt', html : 'Constraint' }
                                : null,
                            constraintType
                                ? { tag : 'dd', html : `${constraintNames[constraintType]} ${DateHelper.format(constraintDate, 'll LT')}` }
                                : null
                        ]
                    }
                ]
            })
        }
    },

    columns : [
        // A column using a custom render to display an icon + text
        {
            text       : 'Property',
            width      : 180,
            field      : 'name',
            // We want to use custom markup
            htmlEncode : false,
            // Renderer that returns a DOM config object, a more performant way than returning a html string, allows
            // reusing elements as cells are re-rendered
            renderer   : ({ record }) => ({
                children : [
                    // <i> tag with the icon
                    {
                        tag       : 'i',
                        className : record.iconCls
                    },
                    // text node with the name
                    record.name
                ]
            })
        }
    ],

    // Custom event renderer used to visualize constraintNames
    eventRenderer({ eventRecord, renderData }) {
        const { constraintType } = eventRecord;

        if (constraintType) {
            renderData.cls[constraintType] = 1;
            renderData.iconCls['fa'] = renderData.iconCls['fa-thumbtack'] = 1;

            if (constraintType === 'mustfinishon' || constraintType === 'muststarton') {
                renderData.eventColor = 'red';
            }
            else if (constraintType) {
                renderData.eventColor = 'orange';
            }
        }

        // If we want the icon to be right justified, place it outside of the
        // content directly as a child of the event element.
        if (rightJustifyIcon[constraintType]) {
            renderData.children.unshift({
                tag       : 'i',
                className : renderData.iconCls
            });

            // We've put the icon in place.
            // Now null it out so that the default processing does not inject it.
            renderData.iconCls = null;
        }
        return StringHelper.encodeHtml(eventRecord.name);
    }
});
