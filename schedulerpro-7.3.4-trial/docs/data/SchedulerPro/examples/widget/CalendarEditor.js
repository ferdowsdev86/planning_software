const schedulerPro = new SchedulerPro({
    appendTo : targetElement,
    flex     : '1 0 100%',
    // Project contains all the data and is responsible for correct scheduling
    project  : {
        calendar : 1,

        calendars : [{
            id                       : 1,
            name                     : 'Project Calendar',
            unspecifiedTimeIsWorking : true,
            intervals                : [
                {
                    recurrentStartDate : 'on Sat',
                    recurrentEndDate   : 'on Mon',
                    isWorking          : false
                },
                {
                    name      : 'Day-off',
                    startDate : '2023-12-13',
                    endDate   : '2023-12-14',
                    isWorking : false
                }
            ]
        }],

        events : [{
            id       : 1,
            name     : 'Write docs',
            expanded : true,
            children : [
                { id : 2, name : 'Proof-read docs', startDate : '2023-12-12', duration : 3 },
                { id : 3, name : 'Release docs', startDate : '2023-12-19', duration : 5 }
            ]
        }],

        resources : [
            { id : 1, name : 'Albert' },
            { id : 2, name : 'Bill' }
        ],

        assignments : [
            { event : 2, resource : 1 },
            { event : 3, resource : 2 }
        ]
    },
    startDate : new Date(2023, 11, 11),
    endDate   : new Date(2023, 11, 31),
    height    : 250,
    tbar      : [{
        type : 'button',
        icon : 'fa fa-calendar',
        text : 'Edit Project Calendar',
        async onAction() {
            // wait till project finished its calculations
            await schedulerPro.project.commitAsync();
            // scheduler might be destroyed during the commit
            if (schedulerPro.isDestroyed) {
                return;
            }

            let editor = this.calendarEditor;

            // create calendar editor
            if (!editor)  {
                this.calendarEditor = editor = new CalendarEditor({
                    owner    : schedulerPro,
                    // don't show it right away
                    autoShow : false,
                    modal    : true
                });
            }

            // edit project calendar
            editor.calendar   = schedulerPro.project.calendar;
            editor.activeDate = schedulerPro.visibleDateRange.startDate;
            editor.show();
        }
    }],
    columns : [
        { field : 'name', text : 'Name' }
    ]
});
