const
    eventRecord = new EventModel({
        id             : 1,
        name           : 'Every other week',
        startDate      : '2018-01-01',
        duration       : 3,
        recurrenceRule : 'FREQ=WEEKLY;INTERVAL=2'
    }),
    confirmation = new RecurrenceConfirmationPopup({
        rootElement : document.body,
        bbar        : {
            items : {
                // Disable button
                changeSingleButton : {
                    disabled : true
                }
            }
        }
    });

new Button({
    appendTo : targetElement,
    text     : 'Click to show recurrence dialog',
    onClick() {
        confirmation.confirm({
            eventRecord,
            actionType : 'delete'
        });
    }
});
