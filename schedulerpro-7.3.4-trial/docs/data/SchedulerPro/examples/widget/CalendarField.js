const project = new ProjectModel({
    startDate : '2020-01-02',

    events : [
        {
            id        : 1,
            name      : 'Write docs',
            startDate : '2020-01-02',
            endDate   : '2020-01-05'
        }
    ],

    calendars : [
        {
            id        : 'general',
            name      : '24 hour calendar',
            intervals : [
                {
                    recurrentStartDate : 'on Sat',
                    recurrentEndDate   : 'on Mon',
                    isWorking          : false
                }
            ],
            expanded : true,
            children : [
                {
                    id        : 'business',
                    name      : 'Business hours  (8am - 5pm)',
                    intervals : [
                        {
                            recurrentStartDate : 'every weekday at 12:00',
                            recurrentEndDate   : 'every weekday at 13:00',
                            isWorking          : false
                        },
                        {
                            recurrentStartDate : 'every weekday at 17:00',
                            recurrentEndDate   : 'every weekday at 08:00',
                            isWorking          : false
                        }
                    ]
                },
                {
                    id        : 'nightshift',
                    name      : 'Night shift (10pm - 6am)',
                    intervals : [
                        {
                            recurrentStartDate : 'every weekday at 6:00',
                            recurrentEndDate   : 'every weekday at 22:00',
                            isWorking          : false
                        }
                    ]
                }
            ]
        }
    ]
});

const eventRecord = project.eventStore.getById(1);

const calendarField = new CalendarField({
    appendTo               : targetElement,
    width                  : 250,
    store                  : project.calendarManagerStore,
    // edit "Write docs" event calendar
    value                  : eventRecord.calendar,
    calendarConsumerRecord : eventRecord
});
