const scheduler = new SchedulerPro({
    appendTo : targetElement,

    project : {
        events : [
            { id : 1, startDate : '2021-08-23', duration : 2, prio : 'low' },
            { id : 2, startDate : '2021-08-25', duration : 2, prio : 'high', eventColor : 'red' },
            { id : 3, startDate : '2021-08-27', duration : 2, prio : 'high', eventColor : 'red' }
        ],
        resources : [
            { id : 1, name : 'Mike' }
        ],
        assignments : [
            { id : 1, resource : 1, event : 1 },
            { id : 2, resource : 1, event : 2 },
            { id : 3, resource : 1, event : 3 }
        ]
    },

    startDate   : new Date(2021, 7, 22),
    endDate     : new Date(2021, 7, 29),
    autoHeight  : true,
    rowHeight   : 50,
    eventLayout : {
        type    : 'stack',
        groupBy : 'prio'
    },

    columns : [
        { type : 'resourceInfo', text : 'Worker', field : 'name', width : 160 }
    ],
    resourceImagePath : 'data/Scheduler/images/transparent-users/',

    eventRenderer({ eventRecord }) {
        return eventRecord.prio;
    },

    tbar : [
        {
            type        : 'buttonGroup',
            rendition   : 'padded',
            toggleGroup : true,
            defaults    : {
                width : '12em'
            },
            items : [
                {
                    type    : 'button',
                    ref     : 'prio',
                    text    : 'Priority',
                    pressed : true
                },
                {
                    type : 'button',
                    ref  : 'prioReverse',
                    text : 'Priority (reversed)'
                },
                {
                    type : 'button',
                    ref  : 'noneButton',
                    text : 'None'
                }
            ],
            onAction({ source : button }) {
                switch (button.ref) {
                    case 'prio':
                        scheduler.eventLayout = {
                            type    : 'stack',
                            groupBy : 'prio'
                        };
                        break;
                    case 'prioReverse':
                        scheduler.eventLayout = {
                            type    : 'stack',
                            weights : {
                                low  : 100,
                                high : 200
                            },
                            groupBy : 'prio'
                        };
                        break;
                    case 'noneButton':
                    default:
                        scheduler.eventLayout = 'stack';
                        break;
                }
            }
        }
    ]
});
