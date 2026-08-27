import shared from '../_shared/shared.module.js';
import { Splitter, SchedulerPro, ProjectModel, ResourceUtilization, DateHelper, EventModel } from '../../build/schedulerpro.module.js';

class FixedDurationEvent extends EventModel {

    static fields = [
        // Change the event default "schedulingMode" to "FixedDuration"
        // which enforces the event to distribute the provided "effort" value over the event duration
        { name : 'schedulingMode', defaultValue : 'FixedDuration' }
    ];

}

const project = new ProjectModel({
    eventModelClass : FixedDurationEvent,
    loadUrl         : 'data/data.json',
    autoLoad        : true
});

const scheduler = new SchedulerPro({
    appendTo    : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom  : true,
    minHeight   : 0,
    flex        : '1 1 50%',
    collapsible : true,
    header      : false,

    project,

    startDate      : new Date(2020, 3, 26),
    endDate        : new Date(2020, 4, 30),
    viewPreset     : 'dayAndWeek',
    eventStyle     : 'filled',
    tickSize       : 50,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    features : {
        taskEdit : {
            items : {
                // Get rid of "Resources" combo on "General" tab (since we add "Resources" tab)
                generalTab : {
                    items : {
                        resourcesField : false
                    }
                },
                // Add "Resources" tab (grid allowing to edit event assignments)
                resourcesTab : {
                    type      : 'resourcestab',
                    weight    : 400,
                    // display "Units" column allowing to adjust resource effort contribution level
                    showUnits : true
                }
            },
            // slightly extend editor width to fit new tab
            editorConfig : {
                width : '37em'
            }
        }
    },

    columns : [
        { type : 'resourceInfo', text : 'Name', field : 'name', width : 140 },
        { text : 'City', field : 'city', width : 100 }
    ],

    tbar : [
        {
            type     : 'button',
            ref      : 'zoomInButton',
            icon     : 'b-icon-search-plus',
            text     : 'Zoom in',
            onAction : () => scheduler.zoomIn()
        },
        {
            type     : 'button',
            ref      : 'zoomOutButton',
            icon     : 'b-icon b-icon-search-minus',
            text     : 'Zoom out',
            onAction : () => scheduler.zoomOut()
        }
    ]
});

new Splitter({
    appendTo    : 'container',
    showButtons : true
});

const resourceUtilization = new ResourceUtilization({
    project,
    hideHeaders : true,
    partner     : scheduler,
    appendTo    : 'container',
    // set a bit larger row height since we use a custom renderer() below
    rowHeight   : 50,
    minHeight   : 0,
    collapsible : true,
    header      : false,
    flex        : '1 1 50%',
    showBarTip  : true,
    columns     : [
        {
            type  : 'tree',
            field : 'name',
            text  : 'Resource/Event',
            renderer({ record, value }) {
                // lets show event start/end for assignment row
                if (record.origin.isAssignmentModel) {
                    // get the assigned event
                    const event = record.origin.event;

                    // add few nested tags for event name and for start/end dates
                    return {
                        children : [
                            {
                                tag      : 'dl',
                                class    : 'b-assignment-info',
                                children : [
                                    // value has event name
                                    {
                                        tag  : 'dt',
                                        html : value
                                    },
                                    {
                                        tag  : 'dd',
                                        html : DateHelper.format(event.startDate, 'L') + ' - ' + DateHelper.format(event.endDate, 'L')
                                    }
                                ]
                            }
                        ]
                    };
                }

                return value;
            }
        }
    ],

    tbar : [
        {
            type    : 'slidetoggle',
            ref     : 'showBarTip',
            text    : 'Enable bar tooltip',
            tooltip : 'Check to show tooltips when moving mouse over bars',
            checked : true,
            onAction({ source }) {
                resourceUtilization.showBarTip = source.checked;
            }
        }
    ]
});
