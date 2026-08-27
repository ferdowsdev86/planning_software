new TabPanel({
    appendTo : targetElement,
    height   : '25em',

    onAddTabClick() {
        this.add({
            type  : 'panel',
            title : 'New tab',
            items : {
                button : {
                    type : 'button',
                    text : 'Click me',
                    onClick() {
                        Toast.show('Awesome!');
                    }
                }
            }
        });
    },

    tabBar : {
        items : {
            addButton : {
                type    : 'button',
                text    : 'Add tab',
                onClick : 'up.onAddTabClick'
            }
        }
    },

    items : {
        main : {
            type     : 'grid',
            title    : 'Open Requirements',
            features : {
                sort   : 'name',
                stripe : true
            },
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
                }
            ],
            store : {
                fields : [
                    { name : 'name' },
                    { name : 'fromDate', type : 'date' }
                ],
                data : [
                    {
                        id       : 1,
                        name     : 'TAB1 - Cable Burial',
                        fromDate : '2024-09-12 10:00'
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
                    }
                ]
            }
        }
    }
});
