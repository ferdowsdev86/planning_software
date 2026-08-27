var {
    DateHelper,
    DataGenerator,
    Scheduler
} = window.bryntum.schedulerpro;
const
    // region data
    today = DateHelper.clearTime(new Date()),
    generateData = (resourceCount, eventCount) => {
        const colors = ['purple', 'violet', 'pink'],
            resources = [],
            events = [],
            assignments = [],
            generator = DataGenerator.generate(resourceCount);
        let i, step;
        while ((step = generator.next()) && !step.done) {
            const res = step.value;
            resources.push(res);
            for (i = 0; i < eventCount; i++) {
                const startDate = DateHelper.add(today, Math.round(Math.random() * (i + 1) * 20), 'days'),
                    duration = Math.round(Math.random() * 9) + 2,
                    endDate = DateHelper.add(startDate, duration, 'days'),
                    eventId = events.length + 1;
                events.push({
                    id         : eventId,
                    name       : 'Task #' + (events.length + 1),
                    startDate,
                    duration,
                    endDate,
                    eventColor : colors[resources.length % 3]
                });
                assignments.push({
                    id       : 'a' + eventId,
                    event    : eventId,
                    resource : res.id
                });
            }
        }
        scheduler.project = {
            assignments,
            resources,
            events
        };
    },
    startDate = DateHelper.clearTime(new Date()),
    endDate = DateHelper.add(startDate, 4, 'months'),
    // endregion
    scheduler = new Scheduler({
        appendTo            : 'container',
        // Enables smoother wheel and pinch zooming
        smoothZoom          : true,
        rowHeight           : 60,
        tickSize            : 30,
        useInitialAnimation : false,
        // Looks nicer when splitting without sticky headers
        stickyHeaders       : false,
        startDate,
        endDate,
        columns             : [{
            type : 'rownumber'
        }, {
            text  : 'First name',
            field : 'firstName',
            width : 100
        }, {
            text  : 'Surname',
            field : 'surName',
            width : 100
        }, {
            text  : 'Score',
            field : 'score',
            type  : 'number',
            width : 100
        }],
        features : {
            split        : true,
            stripe       : true,
            // Looks nicer when splitting without sticky events
            stickyEvents : false
        },
        viewPreset : {
            base           : 'weekAndDayLetter',
            // Column lines for weeks instead of days, for a cleaner look
            columnLinesFor : 0
        },
        // Keep buttons in sync with split state (user might split using context menu)
        listeners : {
            split({
                options
            }) {
                this.widgetMap[options.direction].pressed = true;
            },
            unsplit() {
                this.widgetMap.none.pressed = true;
            }
        },
        tbar : [{
            type : 'label',
            text : 'Split'
        }, {
            type        : 'buttongroup',
            rendition   : 'padded',
            ref         : 'buttons',
            toggleGroup : true,
            items       : [{
                ref  : 'horizontal',
                text : 'Horizontal'
            }, {
                ref  : 'vertical',
                text : 'Vertical'
            }, {
                ref  : 'both',
                text : 'Both'
            }, {
                ref     : 'none',
                text    : 'None',
                pressed : true
            }],
            async onToggle({
                source,
                pressed,
                userAction
            }) {
                // Only react to user clicks, not programmatic changes from our listeners above
                if (pressed && userAction) {
                    // Action may take a while
                    const {
                        buttons
                    } = scheduler.tbar.widgetMap;
                    buttons.disabled = true;
                    if (source.ref === 'none') {
                        await scheduler.unsplit();
                    }
                    else {
                        await scheduler.split({
                            direction : source.ref
                        });
                    }
                    buttons.disabled = false;
                }
            }
        }, {
            type : 'label',
            text : 'Or use the schedule context menu'
        }]
    });
generateData(100, 5);
scheduler.split({
    atDate : DateHelper.add(today, '2 weeks')
});