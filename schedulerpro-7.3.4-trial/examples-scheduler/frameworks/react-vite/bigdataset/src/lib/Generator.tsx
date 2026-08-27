/**
 * Data generator
 */
import { DataGenerator, DateHelper, Mask, AsyncHelper, Scheduler, ProjectModel } from '@bryntum/schedulerpro';
import randomWords from 'random-words';

export async function generateResources(
    resourceCount: number,
    eventCount: number,
    scheduler: Scheduler
) {
    const
        today                 = DateHelper.clearTime(new Date()),
        mask                  = Mask.mask('Generating records', scheduler.element),
        colors                = ['purple', 'green', 'indigo'],
        resources             = [],
        events                = [],
        assignments           = [],
        dependencies          = [],
        resourceTimeRanges    = [],
        timeRanges            = [],
        useResourceTimeRanges = !scheduler.features.resourceTimeRanges.disabled,
        useTimeRanges         = !scheduler.features.timeRanges.disabled,
        useDependencies       = !scheduler.features.dependencies.disabled,
        resourceImages        = [
            'amit',
            'angelo',
            'arcady',
            'arnold',
            'celia',
            'chang',
            'dan',
            'dave',
            'emilia',
            'george',
            'gloria',
            'henrik',
            'hitomi',
            'jong',
            'kate',
            'lee',
            'linda',
            'lisa',
            'lola',
            'macy',
            'madison',
            'malik',
            'mark',
            'maxim',
            'mike',
            'rob',
            'steve'
        ];

    let schedulerEndDate = today,
        i, step;

    const generator = DataGenerator.generate(resourceCount);

    while ((step = generator.next()) && !step.done) {
        const res      = step.value as {
            image: string
            eventColor: string
            id: string
        };
        res.image      = `${resourceImages[Math.floor(Math.random() * resourceImages.length)]}.png`;
        res.eventColor = colors[resources.length % 3];
        resources.push(res);

        for (i = 0; i < eventCount; i++) {
            const
                startDate  = DateHelper.add(today, Math.round(Math.random() * (i + 1) * 20), 'days'),
                duration   = Math.round(Math.random() * 5) + 9,
                endDate    = DateHelper.add(startDate, duration, 'days'),
                eventId    = (events.length + 1) as number,
                name       = randomWords({
                    exactly        : 1,
                    wordsPerString : 1,
                    join           : ' ',
                    formatter      : (word: string, index: number) => {
                        return index === 0 ? word.slice(0, 1).toUpperCase().concat(word.slice(1)) : word;
                    }
                }),
                percentage = Math.ceil(Math.random() * 100);

            events.push({
                id         : eventId,
                name,
                startDate,
                duration,
                endDate,
                eventColor : res.eventColor,
                percentage
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

    mask.text = 'Loading data';

    // Give the UI a chance to catch up, to update the mask before proceeding
    await AsyncHelper.sleep(100);

    if (!scheduler || scheduler.isDestroyed || scheduler.isDestroying) {
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
        },
        timeRangeStore : {
            useRawData : true,
            data       : timeRanges
        }
    };

    scheduler.resumeRefresh(true);
    await (scheduler.project as ProjectModel).commitAsync();
    mask.close();
}
