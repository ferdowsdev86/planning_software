import shared from '../_shared/shared.module.thin.js';
import { Container, DomHelper, StringHelper, Toast, GlobalEvents } from '../../build/thin/core.module.thin.js';
import '../../build/thin/chart.module.thin.js';
import '../../build/thin/grid.module.thin.js';
import '../../build/thin/scheduler.module.thin.js';



const
    fillColors = {
        green : '#e2f7e1',
        red   : '#f6dfdc',
        blue  : '#d9e6fd'
    },
    darkFillColors = {
        green : '#192916',
        red   : '#3d1e18',
        blue  : '#21365e'
    },
    strokeColors = {
        green : '#78c16b',
        red   : '#d56853',
        blue  : '#568ef8'
    };

const container = new Container({
    appendTo : 'container',
    layout   : 'hbox',
    flex     : 1,
    items    : {
        scheduler : {
            type          : 'scheduler',
            // Enables smoother wheel and pinch zooming
            smoothZoom    : true,
            flex          : 2,
            startDate     : '2025-05-11',
            endDate       : '2025-05-18',
            eventStyle    : 'indented',
            eventColor    : 'green',
            resourceStore : {
                fields : [
                    'driver',
                    'truck',
                    { name : 'capacity', type : 'number' }
                ]
            },
            columns : [
                { text : 'Driver', field : 'driver', width : 150 },
                { text : 'Truck', field : 'truck', width : 150 },
                { text : 'Capacity', field : 'capacity', width : 85, type : 'number', unit : ' t' }
            ],
            crudManager : {
                loadUrl       : 'data/data.json',
                autoLoad      : true,
                resourceStore : {
                    listeners : {
                        refresh() {
                            // React to sorting, filtering etc.
                            updateChart();
                        }
                    }
                },
                listeners : {
                    load() {
                        // Set initial chart data
                        updateChart();
                    },
                    hasChanges() {
                        // Lazy approach, update chart on all data changes
                        updateChart();
                    }
                }
            },
            eventRenderer({ eventRecord, renderData }) {
                // Mark long hauls
                if (eventRecord.duration > 2) {
                    renderData.eventColor = 'blue';
                }
                return StringHelper.encodeHtml(eventRecord.name);
            }
        },
        splitter : {
            type : 'splitter'
        },
        chartPanel : {
            type     : 'panel',
            flex     : 1,
            minWidth : 400,
            layout   : 'fit',
            tbar     : {
                items : {
                    label : {
                        type : 'label',
                        html : 'Chart data'
                    },
                    datasetButtons : {
                        type        : 'buttongroup',
                        toggleGroup : true,
                        rendition   : 'padded',
                        items       : {
                            capacity : {
                                text  : 'Capacity',
                                value : 'capacity'
                            },
                            trips : {
                                text    : 'Trip count',
                                value   : 'trips',
                                pressed : true
                            },
                            longest : {
                                text  : 'Longest trips',
                                value : 'longest'
                            }
                        },
                        onToggle({ pressed }) {
                            pressed && updateChart();
                        }
                    }
                }
            },
            items : {
                chart : {
                    type                : 'chart',
                    flex                : 1,
                    minWidth            : 400,
                    title               : 'Employee Recruitment Progress',
                    chartType           : 'bar',
                    showTitle           : true,
                    seriesLineThickness : 1,
                    titleFont           : {
                        family : 'Poppins',
                        bold   : false,
                        size   : 18
                    },
                    showLegend   : false,
                    chartPadding : {
                        top    : 0,
                        left   : 25,
                        right  : 25,
                        bottom : 25
                    },
                    labels : {
                        field : 'label'
                    },
                    series : [
                        {
                            field            : 'value',
                            label            : 'Value',
                            fillColorField   : 'color',
                            strokeColorField : 'strokeColor',
                            borderRadius     : 5
                        }
                    ]
                }
            }
        }

    }
});

function updateChart() {
    const
        { datasetButtons, chart, scheduler } = container.widgetMap,
        { resourceStore, eventStore }        = scheduler,
        datasetName                          = datasetButtons.value,
        useFillColors                        = DomHelper.isDarkTheme ? darkFillColors : fillColors;

    let data;

    switch (datasetName) {
        case 'capacity': {
            const
                max = resourceStore.max('capacity'),
                min = resourceStore.min('capacity');

            data = resourceStore.map(resource => {
                const color = resource.capacity === max ? 'green'
                    : resource.capacity === min ? 'red'
                        : 'blue';

                return {
                    label       : resource.driver,
                    value       : resource.capacity,
                    color       : useFillColors[color],
                    strokeColor : strokeColors[color]
                };
            });

            chart.title = `Truck capacity (${min} t - ${max} t)`;
        } break;

        case 'trips' :
            data = resourceStore.map(resource => ({
                label       : resource.driver,
                value       : resource.events.length,
                color       : useFillColors.blue,
                strokeColor : strokeColors.blue
            }));

            chart.title = 'Trip count';
            break;

        case 'longest': {
            const
                // All assigned events, sorted by duration
                allEvents     = eventStore.records.filter(e => e.resource).sort((a, b) => a.duration - b.duration),
                // Take the last 5 events, which are the longest ones
                longestEvents = allEvents.slice(-5);

            data = longestEvents.map(event => ({
                label       : event.name,
                value       : event.duration,
                color       : useFillColors.blue,
                strokeColor : strokeColors.blue
            }));

            chart.title = 'Top 5 longest trips';
        } break;
    }

    chart.data = data;
}

GlobalEvents.on('theme', () => {
    updateChart();
});


Toast.show({
    html    : 'This example uses the <b>Bryntum Chart</b> module, which is built upon the <a href="https://www.chartjs.org/">Chart.js</a> library (MIT license)',
    timeout : 10000
});
