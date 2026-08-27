import AjaxHelper from '../../../lib/Core/helper/AjaxHelper.js';

// The content of this file makes it possible for the demo Scheduler to show events for any given period displayed
// It is unsuitable to be used as the base for any type of real-world app

let eventId = 1;
const
    generatedDates = [],
    setDates       = (record, date) => {
        const startDate = new Date(date.getTime());

        startDate.setUTCHours(record.startDate);

        record.startDate = startDate;
        record.utcString = startDate.toISOString();

        record.id = eventId;
        eventId += 1;

        record.children?.forEach(childEvent => setDates(childEvent, date));
    };

AjaxHelper.mockUrl('timezone-data', async(url, urlParams, { queryParams }) => {
    const
        date = new Date(JSON.parse(queryParams.data).params.date);
    let resources  = [],
        events     = [],
        timeRanges = [];

    if (!generatedDates.includes(date.getTime())) {
        const data = await fetch('data/data.json').then(async response => await response.json());

        if (eventId === 1) {
            // First load request only
            ({ resources, timeRanges } = data);
        }

        // Use one data set on even days and another on odd
        events = date.getDate() % 2 === 0 ? data.eventsEven : data.eventsOdd;

        events.forEach(event => setDates(event, date));

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
            timeRanges : {
                rows   : timeRanges,
                append : true
            }
        })
    };
});
