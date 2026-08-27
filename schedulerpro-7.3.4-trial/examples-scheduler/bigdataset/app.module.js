import shared from '../_shared/shared.module.js';
import { DateHelper, AsyncHelper, DataGenerator, Mask, Scheduler } from '../../build/schedulerpro.module.js';

// hide data generation
async function generateResources(
    resourceCount = resourceCountField.value,
    eventCount = eventCountField.value
) {
    const
        today                 = DateHelper.clearTime(new Date()),
        mask                  = Mask.mask('Generating records', scheduler.element),
        colors                = ['cyan', 'green', 'indigo'],
        resources             = [],
        events                = [],
        assignments           = [],
        dependencies          = [],
        resourceTimeRanges    = [],
        timeRanges            = [],
        useResourceTimeRanges = !scheduler.features.resourceTimeRanges.disabled,
        useTimeRanges         = !scheduler.features.timeRanges.disabled,
        useDependencies       = !scheduler.features.dependencies.disabled;

    let schedulerEndDate = today,
        i, step;

    console.time('generate');

    const generator = DataGenerator.generate(resourceCount);

    while ((step = generator.next()) && !step.done) {
        const res = step.value;

        resources.push(res);

        for (i = 0; i < eventCount; i++) {
            const
                startDate = DateHelper.add(today, Math.round(Math.random() * (i + 1) * 20), 'days'),
                duration  = Math.round(Math.random() * 9) + 2,
                endDate   = DateHelper.add(startDate, duration, 'days'),
                eventId   = events.length + 1;

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

            if (useDependencies && i > 0) {
                dependencies.push({
                    id   : dependencies.length + 1,
                    from : eventId - 1,
                    to   : eventId
                });
            }

            if (useResourceTimeRanges && i % 2 === 0) {
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
        }

        if (resources.length % 2000 === 0) {
            mask.text = `Generated ${resources.length * eventCount} of ${resourceCount * eventCount} records`;

            await AsyncHelper.animationFrame();
        }
    }

    if (useTimeRanges) {
        let startDate = today;
        for (let i = 0; i < eventCount; i++) {

            startDate = DateHelper.add(startDate, Math.round(Math.random() * 8) + 15, 'days');

            timeRanges.push({
                id       : i + 1,
                name     : `Time range ${i + 1}`,
                startDate,
                duration : Math.round(Math.random() * 5) + 4
            });
        }
    }

    console.timeEnd('generate');

    mask.text = 'Loading data';

    // Give the UI a chance to catch up, to update the mask before proceeding
    await AsyncHelper.sleep(100);

    scheduler.suspendRefresh();
    scheduler.endDate = schedulerEndDate;
    scheduler.project = {
        assignments,
        resources,
        events,
        dependencies,
        resourceTimeRanges,
        timeRanges
    };
    scheduler.resumeRefresh(true);
    await scheduler.project.commitAsync();
    mask.close();
}
// end-hide

function toggleCustom(show) {
    scheduler.widgetMap.featuresButton.hidden = resourceCountField.hidden  = eventCountField.hidden = !show;
}

function applyPreset(resources, events) {
    toggleCustom(false);

    resourceCountField.value = resources;
    eventCountField.value = events;

    generateResources();
}

const scheduler = new Scheduler({
    appendTo                      : 'container',
    eventStyle                    : 'traced',
    rowHeight                     : 50,
    // Turn off animations, to speed up the demo a bit since a lot will be on screen
    useInitialAnimation           : false,
    transitions                   : false,
    // Don't track timeline context while scrolling, speeds up scrolling a bit by hitting DOM less
    updateTimelineContextOnScroll : false,
    // Disabling sticky headers speeds up scrolling a bit, since `position: sticky` promotes element to its own layer
    stickyHeaders                 : false,
    // Opt-in to use the new smoother zooming experience
    smoothZoom                    : true,

    generateResources,

    columns : [
        { type : 'rownumber' },
        { text : 'Id', field : 'id', width : 50, hidden : true },
        { text : 'First name', field : 'firstName', width : 125 },
        { text : 'Surname', field : 'surName', width : 125 },
        { text : 'Score', field : 'score', type : 'number', width : 100 }
    ],

    features : {
        // Features that can be toggled in Custom mode
        dependencies : {
            disabled : true
        },
        resourceTimeRanges : {
            disabled : true
        },
        timeRanges : {
            disabled       : true,
            enableResizing : true
        },
        eventNonWorkingTime : {
            disabled : true
        },
        nonWorkingTime : {
            disabled : true
        },
        // Turn off schedule tooltip to boost scrolling performance a bit
        scheduleTooltip : false,
        // Disabling sticky events speeds up scrolling a bit, since `position: sticky` promotes element to its own layer
        stickyEvents    : false
    },

    // hide toolbar settings
    tbar : [
        {
            type : 'label',
            html : 'Preset'
        },
        {
            type        : 'buttongroup',
            rendition   : 'padded',
            toggleGroup : true,
            items       : [
                {
                    text       : '1K events',
                    ref        : '1K',
                    pressed    : true,
                    dataConfig : {
                        resources : 200,
                        events    : 5
                    }
                },
                {
                    text       : '5K events',
                    ref        : '5K',
                    dataConfig : {
                        resources : 1000,
                        events    : 5
                    }
                },
                {
                    text       : '10K events',
                    ref        : '10K',
                    dataConfig : {
                        resources : 1000,
                        events    : 10
                    }
                },
                {
                    text : 'Custom',
                    ref  : 'customButton',
                    onClick() {
                        toggleCustom(true);
                    }
                }
            ],
            onClick({ source : button }) {
                if (button.dataConfig) {
                    applyPreset(button.dataConfig.resources, button.dataConfig.events);
                }
            }
        },
        '->',
        {
            ref                  : 'resourceCountField',
            type                 : 'number',
            placeholder          : 'Number of resources',
            label                : 'Resources',
            tooltip              : 'Enter number of resource rows to generate and press [ENTER]',
            min                  : 1,
            max                  : 10000,
            width                : 'auto',
            inputWidth           : '7em',
            keyStrokeChangeDelay : 500,
            changeOnSpin         : 500,
            hidden               : true,
            onChange             : ({ userAction }) => userAction && generateResources()
        },
        {
            ref                  : 'eventCountField',
            type                 : 'number',
            placeholder          : 'Number of events',
            label                : 'Events',
            tooltip              : 'Enter number of events per resource to generate and press [ENTER]',
            min                  : 1,
            max                  : 100,
            width                : 'auto',
            inputWidth           : '6em',
            keyStrokeChangeDelay : 500,
            changeOnSpin         : 500,
            hidden               : true,
            onChange             : ({ userAction }) => userAction && generateResources()
        },
        {
            type : 'button',
            ref  : 'featuresButton',
            text : 'Features',
            menu : [
                {
                    text     : 'Dependencies',
                    checked  : false,
                    onToggle : ({ checked }) => {
                        scheduler.features.dependencies.disabled = !checked;

                        if (checked && !scheduler.dependencyStore.count) {
                            generateResources();
                        }
                    }
                },
                {
                    text     : 'Resource ranges',
                    checked  : false,
                    onToggle : ({ checked }) => {
                        scheduler.features.resourceTimeRanges.disabled = !checked;

                        if (checked && !scheduler.resourceTimeRangeStore.count) {
                            generateResources();
                        }
                    }
                },
                {
                    text     : 'Time ranges',
                    checked  : false,
                    onToggle : ({ checked }) => {
                        scheduler.features.timeRanges.disabled = !checked;

                        if (checked && !scheduler.timeRangeStore.count) {
                            generateResources();
                        }
                    }
                },
                {
                    text     : 'Non-working time',
                    checked  : false,
                    onToggle : ({ checked }) => {
                        scheduler.features.nonWorkingTime.disabled = !checked;
                    }
                },
                {
                    text     : 'Event non-working time',
                    checked  : false,
                    onToggle : ({ checked }) => {
                        scheduler.features.eventNonWorkingTime.disabled = !checked;
                    }
                }
            ]
        },
        {
            type    : 'button',
            ref     : 'zoomInButton',
            icon    : 'fa fa-magnifying-glass-plus',
            tooltip : 'Zoom in',
            onClick : () => scheduler.zoomIn({ animate : true })
        },
        {
            type    : 'button',
            ref     : 'zoomOutButton',
            icon    : 'fa fa-magnifying-glass-minus',
            tooltip : 'Zoom out',
            onClick : () => scheduler.zoomOut({ animate : true })
        },
        {
            type    : 'button',
            ref     : 'fitButton',
            icon    : 'fa fa-minimize',
            tooltip : 'Fit to screen',
            onClick : () => scheduler.zoomToFit({ animate : true })
        },
        {
            type : 'timezoomslider',
            ref  : 'zoomSlider'
        }
    ]
    // end hide
});

const { resourceCountField, eventCountField } = scheduler.widgetMap;

applyPreset(200, 5);
