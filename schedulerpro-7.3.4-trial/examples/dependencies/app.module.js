import shared from '../_shared/shared.module.js';
import { SchedulerPro, Toast, StringHelper } from '../../build/schedulerpro.module.js';

const scheduler = new SchedulerPro({
    // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
    // loading data into all stores at once
    project : {
        autoLoad   : true,
        loadUrl    : './data/data.json',
        eventStore : {
            fields : ['highlight']
        }
        // Uncomment to limit which types dependencies can be created in the UI
        // dependencyStore : {
        //     allowedDependencyTypes : [DependencyModel.Type.EndToStart, DependencyModel.Type.EndToEnd]
        // },
    },

    appendTo              : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom            : true,
    startDate             : '2020-03-23',
    endDate               : '2020-03-24',
    rowHeight             : 70,
    barMargin             : 15,
    eventStyle            : 'tonal',
    viewPreset            : 'hourAndDay',
    highlightSuccessors   : true,
    highlightPredecessors : true,

    features : {
        dependencies : {
            // Makes dependency lines easier to click. Note that configuring clickWidth > 0 can be costly in terms of
            // performance, if you have a lot of dependencies on screen at the same time. Using it draws two paths for
            // each dependency, instead of one.
            clickWidth : 5,

            // Round the corners of the dependency lines. Note that configuring radius > 0 can be costly in terms of
            // performance, if you have a lot of dependencies on screen at the same time. It is cheaper to draw straight
            // lines, than lines with rounded corners.
            radius : 10,

            // Highlight dependency lines when hovering over an event
            highlightDependenciesOnEventHover : true,

            // Enables simple deletion of dependencies by clicking on them
            enableDependencyDelete : true,

            // These are the default values, included here to show that they can be configured. If you have a lot of
            // dependencies on screen at the same time, you might want to opt out of these to make other scheduler
            // interactions smoother.
            drawOnScroll           : true,
            drawOnEventInteraction : true
        },
        dependencyMenu : true,
        dependencyEdit : {
            // Allow editing lag in the dependency editor
            showLagField : true
        },
        eventDrag : {
            // Prevent reassigning events using drag and drop
            constrainDragToResource : true
        },
        resourceTimeRanges : true
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

    eventRenderer({ eventRecord, renderData }) {
        // Add 'highlight' css class for highlighted records
        renderData.cls.highlight = eventRecord.highlight;

        return StringHelper.encodeHtml(eventRecord.name);
    },

    tbar : [
        {
            type    : 'slidetoggle',
            label   : 'Highlight dependent events',
            checked : true,
            onChange({ checked }) {
                if (checked && !scheduler.selectedEvents.length) {
                    Toast.show('Select an event to highlight the dependency chain');
                }

                scheduler.highlightSuccessors = scheduler.highlightPredecessors = checked;
            }
        }
    ]
});
