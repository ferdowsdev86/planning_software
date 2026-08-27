var {
    Splitter,
    SchedulerPro,
    ProjectModel,
    ResourceUtilization,
    DateHelper,
    Store
} = window.bryntum.schedulerpro;

// Variables used in this demo
// Set group by Resource to City as initial default
let isGroupByResourceToCity = true;
const project = new ProjectModel({
    loadUrl          : 'data/data.json',
    autoLoad         : true,
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only, so please set it to false for production systems.
    validateResponse : true
});
const scheduler = new SchedulerPro({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    minHeight      : 0,
    flex           : '1 1 50%',
    collapsible    : true,
    header         : false,
    project,
    startDate      : new Date(2024, 3, 28),
    endDate        : new Date(2024, 4, 30),
    viewPreset     : 'dayAndWeek',
    eventStyle     : 'tonal',
    tickSize       : 50,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    columns : [{
        type  : 'resourceInfo',
        text  : 'Name',
        field : 'name',
        width : 170
    }, {
        text  : 'City',
        field : 'city',
        width : 110
    }],
    tbar : [{
        type     : 'button',
        ref      : 'zoomInButton',
        icon     : 'b-icon-search-plus',
        text     : 'Zoom in',
        onAction : () => scheduler.zoomIn()
    }, {
        type     : 'button',
        ref      : 'zoomOutButton',
        icon     : 'b-icon b-icon-search-minus',
        text     : 'Zoom out',
        onAction : () => scheduler.zoomOut()
    }]
});
new Splitter({
    appendTo    : 'container',
    showButtons : true
});

// Prepare an array of functions we are going to group the view store by
// (we make a constant since we are going to use it in a few places)
const treeGroupLevels = [
// group by resource
    ({
        origin
    }) => {
        // If record is a resource means it has no assignments since this function is called for leaves only.
        // So further grouping makes no sense - stop grouping.
        if (origin.isResourceModel) {
            return Store.StopBranch;
        }
        return origin.resource;
    },
    // group by resource city
    ({
        origin
    }) => origin.isResourceModel ? origin.city : origin.resource.city];
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
    features    : {
        treeGroup : {
            levels : treeGroupLevels
        },
        nonWorkingTime : false
    },
    columns : [{
    // this `cellCls` config is only used to target the example hint
        cellCls : 'tree-resource-event',
        type    : 'tree',
        text    : 'Resource/Event',
        width   : 240,
        flex    : 1,
        renderer({
            record,
            grid
        }) {
            var _record$key;
            record = grid.resolveRecordToOrigin(record);

            // let's show event start/end for assignment row
            if (record.isAssignmentModel) {
                // get the assigned event
                const {
                    event
                } = record;

                // add few nested tags for event name and for start/end dates
                return {
                    children : [{
                        tag      : 'dl',
                        class    : 'b-assignment-info',
                        children : [
                            // value has event name
                            {
                                tag  : 'dt',
                                text : event.name
                            }, {
                                tag  : 'dd',
                                text : DateHelper.format(event.startDate, 'L') + ' - ' + DateHelper.format(event.endDate, 'L')
                            }]
                    }]
                };
            }
            else if (record.isResourceModel) {
                return record.name;
            }

            // record.key will have either resource or event so display its name
            return ((_record$key = record.key) === null || _record$key === undefined ? undefined : _record$key.name) || record.key;
        }
    }],
    // Render the rects as shrunken circles, to allow for nicer demo styling
    getBarDOMConfig(series, domConfig) {
        if (domConfig.height > 0) {
            const {
                    owner
                } = this,
                shrink = 5,
                // Pixels to shrink the bar compared to height
                pxSizeX = domConfig.width / owner.tickSize,
                {
                    width
                } = domConfig;

            // This fairly complicated calculation is needed to make a square rect that is inset `shrink` px from row
            // top. It is complicated since coordinate system is in a SVG, where height and width are 0..1 based, and
            // x is the whole width of the time axis, while y is the whole height of the row.

            domConfig.y = shrink / owner.rowHeight;
            domConfig.height = 1 - shrink * 2 / owner.rowHeight;
            domConfig.width = pxSizeX * (50 - shrink * 2);
            domConfig.x += (width - domConfig.width) / 2;

            // Make the squares circular
            domConfig.rx = 1;
        }
        return domConfig;
    },
    tbar : [{
        type    : 'checkbox',
        ref     : 'showBarTip',
        text    : 'Enable bar tooltip',
        tooltip : 'Check to show tooltips when moving mouse over bars',
        checked : true,
        onAction({
            source
        }) {
            resourceUtilization.showBarTip = source.checked;
        }
    }, '->', {
        type : 'label',
        text : 'Group by'
    }, {
        type        : 'buttongroup',
        rendition   : 'padded',
        toggleGroup : true,
        cls         : 'group-buttons',
        items       : [{
            ref                  : 'resourceToCityButton',
            // for testing purpose
            text                 : 'Resource - City',
            tooltip              : 'Click to group by Resource - City',
            pressed              : true,
            supportsPressedClick : true,
            onAction() {
                // toggle grouping fields order by resource to city
                !isGroupByResourceToCity && treeGroupLevels.reverse();
                isGroupByResourceToCity = true;
                resourceUtilization.group(treeGroupLevels);
            }
        }, {
            ref                  : 'cityToResourceButton',
            // for testing purpose
            text                 : 'City - Resource',
            tooltip              : 'Click to group by City - Resource',
            pressed              : false,
            supportsPressedClick : true,
            onAction() {
                // toggle grouping fields order by city to resource
                isGroupByResourceToCity && treeGroupLevels.reverse();
                isGroupByResourceToCity = false;
                resourceUtilization.group(treeGroupLevels);
            }
        }, {
            ref     : 'defaultButton',
            // for testing purpose
            text    : 'Default',
            tooltip : 'Disable tree group feature and back to default Resource - Assignment look',
            onAction() {
                if (!isGroupByResourceToCity) {
                    treeGroupLevels.reverse();
                    isGroupByResourceToCity = true;
                }
                resourceUtilization.clearGroups();
            }
        }]
    }]
});