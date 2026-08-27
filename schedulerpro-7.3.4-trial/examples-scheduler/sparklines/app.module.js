import shared from '../_shared/shared.module.thin.js';
import { StringHelper, Toast } from '../../build/thin/core.module.thin.js';
import '../../build/thin/chart.module.thin.js';
import '../../build/thin/grid.module.thin.js';
import { Scheduler, ResourceModel } from '../../build/thin/scheduler.module.thin.js';



// Define a custom data model to use in the grid store
class SparklineResource extends ResourceModel {
    static fields = [
        { name : 'name' },
        { name : 'jan', type : 'number' },
        { name : 'feb', type : 'number' },
        { name : 'mar', type : 'number' },
        { name : 'apr', type : 'number' },
        { name : 'may', type : 'number' },
        // Data for the Sales sparkline
        { name : 'monthlySales', calculate : data => [data.jan, data.feb, data.mar, data.apr, data.may] },
        // Data for the Event progress pie chart, calculated below when events change
        { name : 'eventProgress', type : 'array', defaultValue : [] }
    ];
}

const
    today  = new Date(2025, 1, 4),
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

new Scheduler({

    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    features : {
        timeRanges : true
    },
    startDate        : new Date(2025, 0, 1),
    endDate          : new Date(2025, 4, 31),
    eventStyle       : 'rounded',
    rowHeight        : 45,
    barMargin        : 10,
    zoomOnMouseWheel : false,

    crudManager : {
        autoLoad      : true,
        loadUrl       : 'data/data.json',
        resourceStore : {
            modelClass : SparklineResource
        },
        eventStore : {
            listeners : {
                change({ records : eventRecords }) {
                    if (eventRecords) {
                        // Quite costly to collect and update this data for each event change,
                        // but keeps the demo simple
                        for (const eventRecord of eventRecords) {
                            const { resource } = eventRecord;
                            if (resource) {
                                resource.eventProgress = [
                                    ...resource.events.reduce((counts, event) => {
                                        counts[event.endDate < today ? 0 : 1]++;
                                        return counts;
                                    }, [0, 0])
                                ];
                            }
                        }
                    }
                }
            }
        },
        listeners : {
            load() {
                // Shade "past" dates using a time range and a line
                this.timeRangeStore.add([
                    {
                        id        : 1,
                        startDate : '2024-12-29T00:00',
                        endDate   : '2025-02-04T00:00'
                    },
                    {
                        id        : 2,
                        startDate : '2025-02-04T00:00',
                        duration  : 0,
                        iconCls   : 'fa fa-clock'
                    }
                ]);
            }
        }
    },

    subGridConfigs : {
        locked : {
            width : 560
        }
    },

    columns : [
        {
            text  : 'Name',
            field : 'name',
            width : 200
        },
        {
            id    : 'line',
            text  : 'Sales',
            width : 120,
            type  : 'sparkline',
            field : 'monthlySales'
        },
        {
            text         : 'Sales data',
            collapsible  : true,
            collapsed    : true,
            collapseMode : 'toggleAll',
            children     : [
                {
                    text            : 'Summary',
                    toggleAllHidden : true,
                    width           : 140,
                    editor          : false,
                    renderer({ record }) {
                        const
                            min = Math.min(...record.monthlySales),
                            max = Math.max(...record.monthlySales);

                        return `Min: ${min}, Max: ${max}`;
                    }
                },
                ...months.map(monthName => ({
                    type  : 'number',
                    field : monthName.toLowerCase(),
                    text  : monthName,
                    width : 80
                }))
            ]
        },
        {
            id                   : 'pie',
            text                 : 'Event<br/>progress',
            htmlEncodeHeaderText : false,
            width                : 80,
            type                 : 'sparkline',
            chartType            : 'pie',
            field                : 'eventProgress'
        }
    ],

    eventRenderer({ eventRecord, renderData }) {
        if (eventRecord.endDate < today) {
            renderData.eventColor = 'gray';
        }

        return StringHelper.encodeHtml(eventRecord.name);
    }
});

Toast.show({
    html    : 'This example uses the <b>Bryntum Chart</b> module, which is built upon the <a href="https://www.chartjs.org/">Chart.js</a> library (MIT license)',
    timeout : 10000
});
