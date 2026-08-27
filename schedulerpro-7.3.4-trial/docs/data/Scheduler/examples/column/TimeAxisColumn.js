const scheduler = new Scheduler({
    appendTo : targetElement,

    // makes scheduler as high as it needs to be to fit rows
    autoHeight : true,
    rowHeight  : 60,

    startDate : new Date(2023, 2, 6),
    endDate   : new Date(2023, 2, 13),

    viewPreset : 'dayAndWeek',

    columns : [
        { text : 'Team', field : 'name', width : 120 },
        {
            type : 'timeAxis',
            // Draw custom daily utilization bars showing how capacity changes over time
            renderer({ record }) {
                // Each resource has different utilization per day
                const
                    dailyLoad = record.dailyLoad || [],
                    // Calculate the width for each day bar (100% / 7 days)
                    dayWidth  = 100 / dailyLoad.length,
                    // Create a bar for each day showing time-based utilization
                    children  = dailyLoad.map((load, index) => {
                        const isOverbooked = load > 100;

                        return {
                            style : {
                                position          : 'absolute',
                                left              : `${index * dayWidth}%`,
                                width             : `${dayWidth}%`,
                                top               : 0,
                                bottom            : 0,
                                display           : 'flex',
                                'align-items'     : 'center',
                                'justify-content' : 'center',
                                padding           : '0 2px',
                                'box-sizing'      : 'border-box'
                            },
                            children : [{
                                style : {
                                    width             : `${Math.min(load, 100)}%`,
                                    height            : '32px',
                                    'max-height'      : '32px',
                                    background        : isOverbooked ? '#ef4444' : record.color,
                                    'border-radius'   : '4px',
                                    display           : 'flex',
                                    'align-items'     : 'center',
                                    'justify-content' : 'center',
                                    color             : '#fff',
                                    'font-size'       : '11px',
                                    'font-weight'     : '600',
                                    'white-space'     : 'nowrap',
                                    overflow          : 'hidden'
                                },
                                text : `${load}%`
                            }]
                        };
                    });

                return {
                    style : {
                        position : 'relative',
                        width    : '100%',
                        height   : '100%',
                        overflow : 'hidden'
                    },
                    children
                };
            }
        }
    ],

    resources : [
        {
            id        : 1,
            name      : 'Design',
            color     : '#3b82f6',
            // Mon, Tue, Wed, Thu, Fri, Sat, Sun - showing realistic weekly utilization
            dailyLoad : [85, 90, 75, 95, 80, 40, 0]
        },
        {
            id        : 2,
            name      : 'Development',
            color     : '#10b981',
            dailyLoad : [100, 110, 95, 90, 85, 30, 10]
        },
        {
            id        : 3,
            name      : 'QA',
            color     : '#f59e0b',
            dailyLoad : [40, 50, 60, 80, 90, 20, 0]
        },
        {
            id        : 4,
            name      : 'Marketing',
            color     : '#8b5cf6',
            dailyLoad : [70, 65, 80, 75, 90, 50, 25]
        }
    ]
});
