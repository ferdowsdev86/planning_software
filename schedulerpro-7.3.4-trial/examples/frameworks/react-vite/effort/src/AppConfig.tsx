import { AssignmentModel, DateHelper, EventModel, ResourceUtilizationModel } from '@bryntum/schedulerpro';
import { BryntumResourceUtilizationProps, type BryntumSchedulerProProjectModelProps, BryntumSchedulerProProps } from '@bryntum/schedulerpro-react';
import { FixedDurationEvent } from './lib/FixedDurationEvent';

export const schedulerProProjectProps: BryntumSchedulerProProjectModelProps = {
    loadUrl          : './data/data.json',
    eventModelClass  : FixedDurationEvent,
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only, so please set it to false for production systems.
    validateResponse : true,
    autoLoad         : true
};

export const schedulerProps: BryntumSchedulerProProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,
    startDate         : new Date(2025, 3, 26),
    endDate           : new Date(2025, 4, 30),
    viewPreset        : 'dayAndWeek',
    eventStyle        : 'filled',
    tickSize          : 50,
    resourceImagePath : 'users',
    taskEditFeature   : {
        items : {
            // Hide "Resources" combo on "General" tab (since we add "Resources" tab)
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
        // Slightly extend editor width to fit new tab
        editorConfig : {
            width : '37em',
            // added ref for test purpose
            ref   : 'task-editor'
        }
    },
    columns : [
        { type : 'resourceInfo', text : 'Name', field : 'name', width : 130 },
        { text : 'City', field : 'city', width : 90 }
    ]
};

export const resourceUtilizationProps: BryntumResourceUtilizationProps = {
    hideHeaders : true,
    rowHeight   : 50,
    showBarTip  : true,
    columns     : [
        {
            type  : 'tree',
            field : 'name',
            text  : 'Resource/Event',
            renderer({ record, value }) {
                const resource = record as ResourceUtilizationModel;
                // show event start/end for assignment
                if (resource.origin instanceof AssignmentModel) {
                    // get the assigned event
                    const event = resource.origin.event as EventModel;
                    // add few nested tags for event name and for start/end dates
                    return {
                        children : [
                            {
                                tag      : 'dl',
                                class    : 'b-assignment-info',
                                children : [
                                    // Value has event name
                                    {
                                        tag  : 'dt',
                                        text : value
                                    },
                                    {
                                        tag  : 'dd',
                                        html : DateHelper.format((event.startDate as Date), 'L') + ' - ' + DateHelper.format((event.endDate as Date), 'L')
                                    }
                                ]
                            }
                        ]
                    };
                }

                return value;
            }
        }
    ]
};
