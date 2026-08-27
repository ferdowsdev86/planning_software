async function generateResources(renderEarly) {
    const
        today                 = DateHelper.clearTime(new Date()),
        mask                  = scheduler.mask('Generating records'),
        resources             = [],
        events                = [],
        assignments           = [];

    let schedulerEndDate = today,
        j, step;

    const generator = DataGenerator.generate(500);

    while ((step = generator.next()) && !step.done) {
        const res = step.value;

        resources.push(res);

        let startDate = DateHelper.add(today, Math.round(Math.random() * 20), 'days');

        for (j = 0; j < 20; j++) {
            const
                duration  = Math.round(Math.random() * 9) + 2,
                endDate   = DateHelper.add(startDate, duration, 'days'),
                eventId   = events.length + 1;

            events.push({
                id   : eventId,
                name : 'Event #' + (events.length + 1),
                startDate,
                duration,
                endDate
            });

            assignments.push({
                id       : 'a' + eventId,
                event    : eventId,
                resource : res.id
            });

            if (endDate > schedulerEndDate) {
                schedulerEndDate = endDate;
            }

            // Add dependency lag to used endDate to get the correct startDate for the next event
            startDate = DateHelper.add(endDate, 3, 'days');
        }
    }

    mask.text = 'Loading data';

    await AsyncHelper.sleep(100);

    if (scheduler.isDestroyed) {
        return;
    }

    scheduler.suspendRefresh();
    scheduler.endDate = schedulerEndDate;
    scheduler.project = {
        delayCalculation : renderEarly,
        assignments,
        resources,
        events
    };

    scheduler.resumeRefresh();

    await scheduler.project.await('refresh');

    !mask.isDestroyed && mask.close();
}

const scheduler = new SchedulerPro({
    appendTo : targetElement,
    height   : 300,

    columns : [
        { type : 'rownumber' },
        { text : 'Name', field : 'name', width : 200 }
    ],

    tbar : [
        {
            text : 'Render first (faster)',
            cls  : 'b-no-monkeys',
            onClick() {
                generateResources(true);
            }
        },
        {
            text : 'Calculate first (slower)',
            cls  : 'b-no-monkeys',
            onClick() {
                generateResources(false);
            }
        }
    ]
});

generateResources(true);
