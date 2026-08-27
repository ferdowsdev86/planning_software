targetElement.innerHTML = '<p>This demo shows how to use TickCells feature:</p>';
const scheduler = new Scheduler({
    appendTo : targetElement,

    // makes scheduler as high as it needs to be to fit rows
    autoHeight : true,

    startDate : new Date(2024, 5, 3),
    endDate   : new Date(2024, 5, 5),

    columns : [
        { field : 'name', text : 'Name', width : 100 }
    ],

    resources : [
        { id : 1, name : 'Bernard' }
    ],

    features : {
        tickCells : {
            resourceTicksData : [
                {
                    id           : 1,
                    startDate    : '2024-06-03',
                    value        : 3,
                    resourceId   : 1,
                    durationUnit : 'day',
                    duration     : 1
                },
                {
                    id           : 2,
                    startDate    : '2024-06-04',
                    value        : 8,
                    resourceId   : 1,
                    durationUnit : 'day',
                    duration     : 1
                },
                {
                    id           : 3,
                    startDate    : '2024-06-05',
                    value        : 13,
                    resourceId   : 1,
                    durationUnit : 'day',
                    duration     : 1
                }
            ],
            tickRenderer({ value = 0 }) {
                const
                    hours = Math.floor(value),
                    hourFraction =  60 * (value - hours);
                return value ? `${hours}:${String(hourFraction).padStart(2, '0')}` : '';
            }
        }
    }
});
