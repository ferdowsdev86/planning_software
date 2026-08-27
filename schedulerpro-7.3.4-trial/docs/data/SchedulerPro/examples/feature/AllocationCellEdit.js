// <code-header>
// This example uses Scheduler Pro TimePhasedProjectModel class
// which is named SchedulerProTimePhasedProjectModel in the Gantt distribution
TimePhasedProjectModel = typeof SchedulerProTimePhasedProjectModel !== 'undefined' ? SchedulerProTimePhasedProjectModel : TimePhasedProjectModel;
targetElement.innerHTML = '<p>Double click an event row effort value to edit it. Use <kbd>F2</kbd> or <kbd>ENTER</kbd> to complete the editing and <kbd>ESC</kbd> to reject changes:</p>';
// </code-header>

const resourceUtilization = new ResourceUtilization({
    project : new TimePhasedProjectModel({
        loadUrl  : 'data/SchedulerPro/examples/view/ResourceUtilization.json',
        autoLoad : true
    }),
    columns : [
        {
            type  : 'tree',
            text  : 'Name',
            field : 'name',
            width : 170,
            renderer({ record, value }) {
                return record.generatedParent ? record.key.name : value;
            }
        }
    ],
    // the view should not be readOnly to allow editing
    readOnly : false,
    features : {
        // Allow effort values editing
        allocationCellEdit : true,
        scheduleContext    : {
            // allow navigating the time axis cells w/ keyboard
            keyNavigation : true
        },
        treeGroup : {
            // group by resource
            levels : [
                // group by resource
                ({ origin }) => {
                    // origin could be an array of time-phased assignments
                    origin = origin[0] || origin;

                    return origin.resource;
                }
            ]
        }
    },
    startDate  : new Date(2020, 3, 26),
    endDate    : new Date(2020, 4, 15),
    appendTo   : targetElement,
    rowHeight  : 40,
    tickSize   : 40,
    minHeight  : '20em',
    // display tooltip
    showBarTip : true
});
