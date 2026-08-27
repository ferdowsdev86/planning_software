import { BryntumSchedulerProProps } from '@bryntum/schedulerpro-angular';

export const schedulerProProps: BryntumSchedulerProProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
    // loading data into all stores at once
    project    : {
        autoLoad  : true,
        transport : {
            load : {
                url : './assets/data/data.json'
            }
        }
    },

    startDate             : '2020-03-23',
    endDate               : '2020-03-24',
    rowHeight             : 60,
    barMargin             : 15,
    eventStyle            : 'indented',
    viewPreset            : 'hourAndDay',
    highlightSuccessors   : true,
    highlightPredecessors : true,

    dependenciesFeature : {
        highlightDependenciesOnEventHover : true
    },
    dependencyEditFeature : {
        // Allow editing lag in the dependency editor
        showLagField : true
    },
    eventDragFeature : {
        // Prevent reassigning events using drag and drop
        constrainDragToResource : true
    },
    resourceTimeRangesFeature : true,

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
            renderer   : ({ record }): object => ({
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

    tbar : {
        cls   : 'b-demo-toolbar',
        items : [
            {
                ref  : 'addInvalidDependencyButton',
                text : 'Add invalid dependency',
                icon : 'fa-bug',
                cls  : 'b-invalid-dependency-button'
            },
            {
                ref  : 'addInvalidCalendarButton',
                text : 'Add invalid calendar',
                icon : 'fa-bug',
                cls  : 'b-invalid-calendar-button'
            }
        ]
    }
};
