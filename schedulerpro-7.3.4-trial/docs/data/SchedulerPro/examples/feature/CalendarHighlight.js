const schedulerPro = new SchedulerPro({
    appendTo : targetElement,

    // makes scheduler as high as it needs to be to fit rows
    autoHeight : true,
    snap       : true,
    startDate  : new Date(2022, 4, 15),
    endDate    : new Date(2022, 4, 29),

    columns : [
        { field : 'name', text : 'Name', width : 100 }
    ],

    features : {
        eventDrag : {
            snapToResource : true
        },
        dependencies      : false,
        scheduleTooltip   : false,
        calendarHighlight : true
    },

    project : {
        calendarManagerStore : {
            validateForCalendarEditorOnLoad : false
        },

        resources : [
            { id : 1, name : 'Bernard' },
            { id : 2, name : 'Bianca' }
        ],

        events : [
            { id : 1, name : 'Drag me', startDate : '2022-05-18', duration : 2, resizable : false, calendar : 'inspection' }
        ],

        assignments : [
            {
                id       : 1,
                event    : 1,
                resource : 1
            }
        ],
        calendars : [
            {
                id                       : 'inspection',
                name                     : 'Inspection period May 16-23',
                unspecifiedTimeIsWorking : false,
                intervals                : [
                    {
                        name      : 'Inspection period',
                        startDate : '2022-05-16',
                        endDate   : '2022-05-24',
                        isWorking : true
                    }
                ]
            }
        ]
    },

    getDateConstraints(resourceRecord, eventRecord) {
        if (eventRecord) {
            const { startDate, endDate } = eventRecord.effectiveCalendar.intervals.first;

            if (startDate) {
                return {
                    start : startDate,
                    end   : endDate
                };
            }
        }
    }
});
(async() => {
    await schedulerPro.project.commitAsync();
    if (!schedulerPro.isDestroyed) {
        schedulerPro.features.calendarHighlight.highlightEventCalendars(schedulerPro.eventStore.first);
    }
})();
