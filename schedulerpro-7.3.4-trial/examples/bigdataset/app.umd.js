var {
    DateHelper,
    AsyncHelper,
    DataGenerator,
    Mask,
    SchedulerPro
} = window.bryntum.schedulerpro;
const generateResources = async(resourceCount = resourceCountField.value, eventCount = eventCountField.value) => {
        const today = DateHelper.clearTime(new Date()),
            mask = Mask.mask('Generating records', scheduler.element),
            colors = ['cyan', 'green', 'indigo'],
            resources = [],
            events = [],
            assignments = [],
            dependencies = [],
            resourceTimeRanges = [],
            useResourceTimeRanges = !scheduler.features.resourceTimeRanges.disabled,
            useDependencies = !scheduler.features.dependencies.disabled;
        let schedulerEndDate = today,
            j,
            step;
        console.time('generate');
        const generator = DataGenerator.generate(resourceCount);
        while ((step = generator.next()) && !step.done) {
            const res = step.value;
            resources.push(res);
            let startDate = DateHelper.add(today, Math.round(Math.random() * 20), 'days');
            for (j = 0; j < eventCount; j++) {
                const duration = Math.round(Math.random() * 9) + 2,
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
                if (useDependencies && j > 0) {
                    dependencies.push({
                        id   : dependencies.length + 1,
                        from : eventId - 1,
                        to   : eventId,
                        lag  : 3 // Visually nicer than no lag
                    });
                }
                if (useResourceTimeRanges && j % 2 === 0) {
                    resourceTimeRanges.push({
                        id             : resourceTimeRanges.length + 1,
                        resourceId     : res.id,
                        name           : `Range ${resourceTimeRanges.length + 1}`,
                        startDate      : DateHelper.add(startDate, Math.round(Math.random() * 5), 'days'),
                        duration       : Math.round(Math.random() * 5) + 4,
                        timeRangeColor : 'red'
                    });
                }
                if (endDate > schedulerEndDate) {
                    schedulerEndDate = endDate;
                }

                // Add dependency lag to used endDate to get the correct startDate for the next event
                startDate = DateHelper.add(endDate, 3, 'days');
            }
            if (resources.length % 2000 === 0) {
                mask.text = `Generated ${resources.length * eventCount} of ${resourceCount * eventCount} records`;
                await AsyncHelper.animationFrame();
            }
        }
        mask.text = 'Loading data';
        scheduler.element.classList.add('b-prevent-event-transitions');
        console.timeEnd('generate');
        await AsyncHelper.sleep(100);
        if (scheduler.isDestroyed) {
            return;
        }
        scheduler.suspendRefresh();
        scheduler.endDate = schedulerEndDate;
        scheduler.project = {
            assignmentStore : {
                useRawData : true,
                data       : assignments
            },
            resourceStore : {
                useRawData : true,
                data       : resources
            },
            eventStore : {
                useRawData : true,
                data       : events
            },
            dependencyStore : {
                useRawData : true,
                data       : dependencies
            },
            resourceTimeRangeStore : {
                useRawData : true,
                data       : resourceTimeRanges
            }
        };
        scheduler.resumeRefresh(true);
        await scheduler.project.commitAsync();
        mask.close();
        scheduler.element.classList.remove('b-prevent-event-transitions');
    },
    toggleCustom = show => {
        scheduler.widgetMap.rangesButton.hidden = scheduler.widgetMap.dependenciesButton.hidden = resourceCountField.hidden = eventCountField.hidden = !show;
    },
    applyPreset = (resources, events) => {
        toggleCustom(false);
        resourceCountField.value = resources;
        eventCountField.value = events;
        generateResources();
    },
    scheduler = new SchedulerPro({
        appendTo            : 'container',
        // Enables smoother wheel and pinch zooming
        smoothZoom          : true,
        eventStyle          : 'bordered',
        rowHeight           : 50,
        useInitialAnimation : false,
        transitions         : false,
        generateResources,
        columns             : [{
            type : 'rownumber'
        }, {
            text   : 'Id',
            field  : 'id',
            width  : 50,
            hidden : true
        }, {
            text  : 'First name',
            field : 'firstName',
            width : 130
        }, {
            text  : 'Surname',
            field : 'surName',
            width : 130
        }, {
            text  : 'Score',
            field : 'score',
            type  : 'number',
            width : 100
        }],
        features : {
            dependencies       : true,
            resourceTimeRanges : {
                disabled : true
            },
            resourceNonWorkingTime : true,
            nonWorkingTime         : false,
            // Turn sticky events off to boost performance with many events on screen simultaneously
            stickyEvents           : false,
            // Turn off schedule tooltip to boost scrolling performance a bit
            scheduleTooltip        : false
        },
        tbar : ['Presets', {
            type        : 'buttongroup',
            rendition   : 'padded',
            toggleGroup : true,
            items       : [{
                text       : '1K events',
                ref        : '1K',
                pressed    : true,
                dataConfig : {
                    resources : 200,
                    events    : 5
                }
            }, {
                text       : '5K events',
                ref        : '5K',
                dataConfig : {
                    resources : 1000,
                    events    : 5
                }
            }, {
                text       : '10K events',
                ref        : '10K',
                dataConfig : {
                    resources : 1000,
                    events    : 10
                }
            }, {
                text : 'Custom',
                ref  : 'customButton',
                onClick() {
                    toggleCustom(true);
                }
            }],
            onClick({
                source: button
            }) {
                if (button.dataConfig) {
                    applyPreset(button.dataConfig.resources, button.dataConfig.events);
                }
            }
        }, '->', {
            ref                  : 'resourceCountField',
            type                 : 'number',
            placeholder          : 'Number of resources',
            label                : 'Resources',
            tooltip              : 'Enter number of resource rows to generate and press [ENTER]',
            min                  : 1,
            max                  : 10000,
            width                : 'auto',
            inputWidth           : '6em',
            keyStrokeChangeDelay : 500,
            changeOnSpin         : 500,
            hidden               : true,
            onChange             : ({
                userAction
            }) => userAction && generateResources()
        }, {
            ref                  : 'eventCountField',
            type                 : 'number',
            placeholder          : 'Number of events',
            label                : 'Events',
            tooltip              : 'Enter number of events per resource to generate and press [ENTER]',
            min                  : 1,
            max                  : 100,
            width                : 'auto',
            inputWidth           : '5em',
            keyStrokeChangeDelay : 500,
            changeOnSpin         : 500,
            hidden               : true,
            onChange             : ({
                userAction
            }) => userAction && generateResources()
        }, {
            type        : 'button',
            ref         : 'dependenciesButton',
            toggleable  : true,
            icon        : 'fa fa-square',
            pressedIcon : 'fa fa-check-square',
            text        : 'Dependencies',
            pressed     : true,
            hidden      : true,
            onToggle({
                pressed
            }) {
                scheduler.features.dependencies.disabled = !pressed;
                if (pressed && !scheduler.dependencyStore.count) {
                    generateResources();
                }
            }
        }, {
            type        : 'button',
            ref         : 'rangesButton',
            toggleable  : true,
            icon        : 'fa fa-square',
            pressedIcon : 'fa fa-check-square',
            text        : 'Resource ranges',
            hidden      : true,
            onToggle({
                pressed
            }) {
                scheduler.features.resourceTimeRanges.disabled = !pressed;
                if (pressed && !scheduler.resourceTimeRangeStore.count) {
                    generateResources();
                }
            }
        }]
    }),
    resourceCountField = scheduler.widgetMap.resourceCountField,
    eventCountField = scheduler.widgetMap.eventCountField;
applyPreset(200, 5);