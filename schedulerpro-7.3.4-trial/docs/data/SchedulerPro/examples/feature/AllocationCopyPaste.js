// <code-header>
// This example uses Scheduler Pro TimePhasedProjectModel class
// which is named SchedulerProTimePhasedProjectModel in the Gantt distribution
TimePhasedProjectModel = typeof SchedulerProTimePhasedProjectModel !== 'undefined' ? SchedulerProTimePhasedProjectModel : TimePhasedProjectModel;
targetElement.innerHTML = '<p>Select an event effort value then use <kbd>CTRL</kbd> + <kbd>C</kbd> to copy it and then use <kbd>CTRL</kbd> + <kbd>V</kbd> to paste it to another selected location:</p>';
// </code-header>

const resourceUtilization = new ResourceUtilization({
    project : new TimePhasedProjectModel({
        loadUrl          : 'data/SchedulerPro/examples/view/ResourceUtilization2.json',
        autoLoad         : true,
        validateResponse : false
    }),
    columns : [
        {
            type  : 'tree',
            text  : 'Name',
            field : 'name',
            width : 150,
            renderer({ record, value }) {
                return record.generatedParent ? record.key.name : value;
            }
        }
    ],
    // the view is not readOnly to allow pasting
    readOnly : false,
    features : {
        // Allow effort values copy/pasting
        allocationCopyPaste : true,
        allocationCellEdit  : true,
        scheduleContext     : {
            // allow navigating the time axis cells w/ keyboard
            keyNavigation : true,
            // allow multi selecting the time axis cells
            // (can be useful for copy/pasting values there)
            multiSelect   : true
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
    minHeight  : '21em',
    // display tooltip
    showBarTip : true
});
