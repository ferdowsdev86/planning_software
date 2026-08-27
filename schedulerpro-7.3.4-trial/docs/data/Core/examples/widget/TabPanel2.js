new TabPanel({
    appendTo : targetElement,
    height   : '25em',

    onRequirementSearchFieldChange({ value }) {
        this.activeItem.store.filter('name', value);
    },

    onAddWorkOrder() {
        this.activeItem.store.add({ workOrderName : 'New work order' });
    },

    onRequirementsReload() {
        this.activeItem.mask('Fake reload...');
        this.setTimeout(() => this.activeItem.unmask(), 2000);
    },

    items : {
        main : {
            type     : 'grid',
            title    : 'Open Requirements',
            features : {
                sort   : 'name',
                stripe : true
            },
            tabBarItems : [
                {
                    type                 : 'textfield',
                    placeholder          : 'Search',
                    field                : 'name',
                    clearable            : true,
                    height               : '2.5em',
                    onChange             : 'up.onRequirementSearchFieldChange',
                    keyStrokeChangeDelay : 300
                },
                {
                    type    : 'button',
                    cls     : 'b-transparent',
                    icon    : 'fa fa-rotate',
                    onClick : 'up.onRequirementsReload'
                }
            ],
            columns : [
                {
                    text  : 'Name',
                    field : 'name',
                    width : 200
                },
                {
                    type  : 'date',
                    text  : 'From Date',
                    field : 'fromDate',
                    width : 120
                },
                {
                    type  : 'date',
                    text  : 'To Date',
                    field : 'toDate',
                    width : 120
                },
                {
                    text       : 'Priority',
                    field      : 'priority',
                    width      : 100,
                    htmlEncode : false,
                    renderer   : ({ value }) => {
                        return `<span style="background: ${value === 'Critical' ? 'red' : 'green'};width:10px;height:10px;border-radius: 50%;margin-inline-end:.5em"></span>${value}`;
                    }
                },
                {
                    text  : 'Duration',
                    field : 'duration',
                    width : 100
                },
                {
                    text  : 'Proposed Duration',
                    field : 'proposedDuration',
                    width : 150
                },
                {
                    text  : 'Fulfilled Duration',
                    field : 'fulfilledDuration',
                    width : 150
                },
                {
                    text  : 'Remaining Duration',
                    field : 'remainingDuration',
                    width : 150
                },
                {
                    text  : 'Territory',
                    field : 'territory',
                    width : 150
                },
                {
                    text  : 'Time From Promised',
                    field : 'timeFromPromised',
                    width : 150
                },
                {
                    text  : 'Time To Promised',
                    field : 'timeToPromised',
                    width : 150
                }
            ],
            store : {
                fields : [
                    { name : 'fromDate', type : 'date' },
                    { name : 'toDate', type : 'date' },
                    { name : 'duration' },
                    { name : 'proposedDuration' },
                    { name : 'fulfilledDuration' },
                    { name : 'remainingDuration' },
                    { name : 'priority' },
                    { name : 'territory' },
                    { name : 'timeFromPromised' },
                    { name : 'timeToPromised' }
                ],
                data : [
                    {
                        id                : 1,
                        name              : 'TAB1 - Cable Burial',
                        fromDate          : '2024-09-12 10:00',
                        toDate            : '2024-09-12 10:30',
                        duration          : '30 mins',
                        proposedDuration  : '0 mins',
                        fulfilledDuration : '0 mins',
                        remainingDuration : '30 mins',
                        priority          : 'Critical',
                        territory         : 'Borders East',
                        timeFromPromised  : '5 mins',
                        timeToPromised    : '0 mins'
                    },
                    {
                        id                : 2,
                        name              : 'SUB2 - Subsea cable',
                        fromDate          : '2024-09-12 09:00',
                        toDate            : '2024-09-12 10:00',
                        duration          : '1 hr',
                        proposedDuration  : '0 mins',
                        fulfilledDuration : '0 mins',
                        remainingDuration : '1 hr',
                        priority          : 'Critical',
                        territory         : 'Bedfordshire',
                        timeFromPromised  : '0 mins',
                        timeToPromised    : '15 mins'
                    },
                    {
                        id                : 3,
                        name              : 'TOW43 - Cell Tower',
                        fromDate          : '2024-09-12 08:15',
                        toDate            : '2024-09-12 09:00',
                        duration          : '45 mins',
                        proposedDuration  : '0 mins',
                        fulfilledDuration : '0 mins',
                        remainingDuration : '45 mins',
                        priority          : 'Low',
                        territory         : 'Berkshire West',
                        timeFromPromised  : '10 mins',
                        timeToPromised    : '5 mins'
                    }
                ]
            }
        },
        secondary : {
            type     : 'grid',
            title    : 'Unscheduled Work Orders',
            features : {
                sort   : 'workOrderName',
                stripe : true
            },
            tabBarItems : [
                {
                    type    : 'button',
                    text    : 'Add work order',
                    onClick : 'up.onAddWorkOrder'
                }
            ],
            columns : [
                {
                    text  : 'Work Order Name',
                    field : 'workOrderName',
                    width : 200
                },
                {
                    text  : 'Job Type',
                    field : 'jobType',
                    width : 150
                },
                {
                    text  : 'Assigned Crew',
                    field : 'assignedCrew',
                    width : 150
                },
                {
                    text  : 'Estimated Duration',
                    field : 'estimatedDuration',
                    width : 150
                },
                {
                    text  : 'Priority',
                    field : 'priority',
                    width : 100
                },
                {
                    text  : 'Location',
                    field : 'location',
                    width : 200
                },
                {
                    text  : 'Status',
                    field : 'status',
                    width : 120
                }
            ],
            store : {
                fields : [
                    { name : 'workOrderName' },
                    { name : 'jobType' },
                    { name : 'assignedCrew' },
                    { name : 'estimatedDuration' },
                    { name : 'priority' },
                    { name : 'location' },
                    { name : 'status' }
                ],
                data : [
                    {
                        id                : 1,
                        workOrderName     : 'WO123 - Underground Cabling',
                        jobType           : 'Cable Installation',
                        assignedCrew      : 'Crew A',
                        estimatedDuration : '3 hours',
                        priority          : 'Critical',
                        location          : 'Borders East',
                        status            : 'Pending'
                    },
                    {
                        id                : 2,
                        workOrderName     : 'WO124 - Fiber Optic Laying',
                        jobType           : 'Fiber Optic',
                        assignedCrew      : 'Crew B',
                        estimatedDuration : '2 hours',
                        priority          : 'Low',
                        location          : 'Bedfordshire',
                        status            : 'Pending'
                    },
                    {
                        id                : 3,
                        workOrderName     : 'WO125 - Electrical Wiring',
                        jobType           : 'Electrical Work',
                        assignedCrew      : 'Crew C',
                        estimatedDuration : '1.5 hours',
                        priority          : 'Critical',
                        location          : 'Berkshire West',
                        status            : 'Scheduled'
                    }
                ]
            }
        }
    }
});
