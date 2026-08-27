import { AjaxHelper } from '@bryntum/schedulerpro';

// The content of this file makes it possible for the demo Scheduler to show events for any given time period displayed
// It is not suitable to be used as the base for any type of real-world app

let eventId = 1;
const
    generatedDates = [],
    setDates = (record, date) => {
        const startDate = new Date(date.getTime());

        startDate.setUTCHours(record.startDate);

        record.startDate = startDate;
        record.utcString = startDate.toISOString();

        record.id = eventId;
        eventId += 1;

        record.children?.forEach(childEvent => setDates(childEvent, date));

    },
    createAssignments = event => {
        const assignments = [{ id : event.id, eventId : event.id, resourceId : event.resourceId }];
        delete event.resourceId;

        event.children?.forEach(child => assignments.push(...createAssignments(child)));

        return assignments;
    };

AjaxHelper.mockUrl('timezone-data', async(url, urlParams, { queryParams } : { queryParams : Record<string, string> }) => {
    const
        date = new Date(JSON.parse(queryParams.data).params.date),
        assignments = [];
    let resources = [],
        events = [],
        timeRanges = [],
        resourceTimeRanges = [];

    if (!generatedDates.includes(date.getTime())) {
        const data = await fetch('assets/data/data.json').then(async response => await response.json());

        if (eventId === 1) {
            // First load request only
            ({ resources, timeRanges, resourceTimeRanges } = data);
        }

        // Use one data set on even days and another on odd
        events = date.getDate() % 2 === 0 ? data.eventsEven : data.eventsOdd;

        events.forEach(event => {
            setDates(event, date);
            assignments.push(...createAssignments(event));
        });

        generatedDates.push(date.getTime());
    }

    return {
        responseText : JSON.stringify({
            success   : true,
            resources : {
                rows   : resources,
                append : true // Tells the CrudManager to add, not replace data
            },
            events : {
                rows   : events,
                append : true
            },
            assignments : {
                rows   : assignments,
                append : true
            },
            timeRanges : {
                rows   : timeRanges,
                append : true
            },
            resourceTimeRanges : {
                rows   : resourceTimeRanges,
                append : true
            }
        })
    };

});
