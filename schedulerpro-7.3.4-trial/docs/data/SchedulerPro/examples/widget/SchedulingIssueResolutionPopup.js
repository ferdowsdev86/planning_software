const scheduler = new SchedulerPro({
    project : {
        events : [
            {
                id           : 1,
                name         : 'Write docs',
                resourceId   : 1,
                startDate    : '2020-03-23',
                duration     : 2,
                durationUnit : 'h'
            }
        ],

        resources : [
            { id : 1, name : 'Albert' },
            { id : 2, name : 'Bill' }
        ]
    },

    appendTo   : targetElement,
    startDate  : '2020-03-23',
    endDate    : '2020-03-24',
    autoHeight : true,
    eventStyle : 'colored',
    viewPreset : 'hourAndDay',
    columns    : [
        {
            text  : 'Resource',
            field : 'name'
        }
    ],
    tbar : [
        {
            text : 'Add invalid dependency',
            icon : 'fa fa-bug',
            cls  : 'b-invalid-dependency-button b-no-monkeys',
            onClick() {
                // Here we add an invalid dependency linking "Arrive" event to itself
                // which naturally building a cycle...
                scheduler.dependencyStore.add({ fromEvent : 1, toEvent : 1 });
            }
        }
    ]
});
