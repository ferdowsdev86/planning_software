targetElement.innerHTML = '<p>Hover cells to highlight the context:</p>';

const scheduler = new Scheduler({
    appendTo : targetElement,

    features : {
        scheduleContext : {
            triggerEvent : 'mouseover',
            widget       : {
                type    : 'button',
                cls     : 'context-button',
                icon    : 'fa fa-plus',
                tooltip : 'Add event',
                style   : 'border-radius: 0',
                onClick() {
                    const { timelineContext } = this.owner;

                    scheduler.eventStore.add({
                        name         : 'Created from schedule context widget click',
                        startDate    : timelineContext.tickStartDate,
                        duration     : 1,
                        durationunit : 'd',
                        resourceId   : timelineContext.resourceRecord.id
                    });
                }
            }
        }
    },

    // makes scheduler as high as it needs to be to fit rows
    autoHeight : true,

    startDate : new Date(2021, 1, 6),
    endDate   : new Date(2021, 1, 13),

    columns : [
        { field : 'name', text : 'Name', width : 100 }
    ],

    resources : [
        { id : 1, name : 'Bernard' },
        { id : 2, name : 'Bianca' }
    ],

    events : [
        { id : 1, resourceId : 1, name : 'Hover outside me', startDate : '2021-02-07', endDate : '2021-02-10', iconCls : 'fa fa-mouse-pointer' }
    ]
});
