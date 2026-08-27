import { AssignmentModel, DateHelper, EventModel, ResourceModel, ResourceUtilization, ResourceUtilizationModel, SchedulerPro, Store, Widget } from '@bryntum/schedulerpro';
import { BryntumResourceUtilizationProps, BryntumSchedulerProProjectModelProps, BryntumSchedulerProProps } from '@bryntum/schedulerpro-angular';

// Access top widget, which has this child widget inside and save in the variable, which can be used in tbar widget.
const
    schedulerPro        = (widget: Widget): SchedulerPro => widget.up(SchedulerPro.type),
    resourceUtilization = (widget: Widget): ResourceUtilization => widget.up(ResourceUtilization.type);

// Variables used in the demo configuration
// Set group by Resource to City as initial default
let isGroupByResourceToCity = true;

export const projectProps: BryntumSchedulerProProjectModelProps = {
    loadUrl  : 'assets/data/data.json',
    autoLoad : true,

    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse : true

};

export const schedulerProProps: BryntumSchedulerProProps = {
    minHeight         : '10em',
    flex              : '1 1 50%',
    startDate         : new Date(2020, 3, 26),
    endDate           : new Date(2020, 4, 30),
    viewPreset        : 'dayAndWeek',
    eventStyle        : 'filled',
    tickSize          : 50,
    resourceImagePath : './assets/users/',
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,

    columns : [
        { type : 'resourceInfo', text : 'Name', field : 'name', width : 130 },
        { text : 'City', field : 'city', width : 90 }
    ],

    tbar : [
        {
            type     : 'button',
            ref      : 'zoomInButton',
            icon     : 'b-icon-search-plus',
            text     : 'Zoom in',
            onAction : ({ source }) => schedulerPro(source).zoomIn()
        },
        {
            type     : 'button',
            ref      : 'zoomOutButton',
            icon     : 'b-icon b-icon-search-minus',
            text     : 'Zoom out',
            onAction : ({ source }) => schedulerPro(source).zoomOut()
        }
    ]
};

// Prepare an array of functions we are going to group the view store by
// (we make a constant since we are going to use it in few places)
const treeGroupLevels = [
    // group by resource
    ({ origin }: any) => {
        // If record is a resource means it has no assignments, since this function is called for leaves only.
        // So further grouping makes no sense - stop grouping.
        if (origin.isResourceModel) {
            return Store.StopBranch;
        }

        return origin.resource;
    },
    // group by resource city
    ({ origin }: any) => origin.isResourceModel ? origin.city : origin.resource.city
];

export const resourceUtilizationProps: BryntumResourceUtilizationProps = {
    hideHeaders      : true,
    // set a bit larger row height since we use a custom renderer() below
    rowHeight        : 50,
    minHeight        : '10em',
    flex             : '1 1 50%',
    showBarTip       : true,
    treeGroupFeature : {
        levels : treeGroupLevels
    },
    columns : [
        {
            type : 'tree',
            text : 'Resource/Event',
            flex : 1,
            renderer({ record, grid }) {
                const resourceUtilization = grid as ResourceUtilization;

                record = resourceUtilization.resolveRecordToOrigin(record as ResourceUtilizationModel);

                // let's show event start/end for assignment row
                if (record instanceof AssignmentModel) {
                    // get the assigned event
                    const event = record.event as EventModel;

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
                                        text : event.name
                                    },
                                    {
                                        tag  : 'dd',
                                        text : DateHelper.format(event.startDate as Date, 'L') + ' - ' + DateHelper.format(event.endDate as Date, 'L')
                                    }
                                ]
                            }
                        ]
                    };
                }
                else if (record instanceof ResourceModel) {
                    return record.name;
                }

                // record.key will have either resource or event so display its name
                return record.key?.name || record.key;
            }
        }
    ],

    tbar : [
        {
            type     : 'checkbox',
            ref      : 'showBarTip',
            text     : 'Enable bar tooltip',
            tooltip  : 'Check to show tooltips when moving mouse over bars',
            checked  : true,
            onAction : ({ source }) => resourceUtilization(source).showBarTip = source.checked
        },
        '->',
        {
            type : 'label',
            text : 'Group by'
        },
        {
            ref         : 'group',
            type        : 'buttongroup',
            toggleGroup : true,
            cls         : 'group-buttons',
            items       : [
                {
                    ref                  : 'resourceToCityButton', // for testing purpose
                    text                 : 'Resource - City',
                    tooltip              : 'Click to group by Resource → City',
                    pressed              : true,
                    supportsPressedClick : true,
                    onAction({ source }) {
                        // toggle grouping fields order by resource to city
                        !isGroupByResourceToCity && treeGroupLevels.reverse();
                        isGroupByResourceToCity = true;
                        resourceUtilization(source).group(treeGroupLevels);
                    }
                },
                {
                    ref                  : 'cityToResourceButton', // for testing purpose
                    text                 : 'City - Resource',
                    tooltip              : 'Click to group by City → Resource',
                    pressed              : false,
                    supportsPressedClick : true,
                    onAction({ source }) {
                        // toggle grouping fields order by city to resource
                        isGroupByResourceToCity && treeGroupLevels.reverse();
                        isGroupByResourceToCity = false;
                        resourceUtilization(source).group(treeGroupLevels);
                    }
                },
                {
                    ref     : 'defaultButton', // for testing purpose
                    text    : 'Default',
                    tooltip : 'Disable tree group feature and back to default Resource → Assignment look',
                    onAction({ source }) {
                        if (!isGroupByResourceToCity) {
                            treeGroupLevels.reverse();
                            isGroupByResourceToCity = true;
                        }
                        resourceUtilization(source).clearGroups();
                    }
                }
            ]
        }
    ]
};

