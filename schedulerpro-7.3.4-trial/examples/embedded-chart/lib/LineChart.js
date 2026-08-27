import { Chart } from '../../../build/thin/chart.module.thin.js';
import { DateHelper, StringHelper } from '../../../build/thin/core.module.thin.js';

export default class LineChart extends Chart {
    static $name = 'LineChart';

    // Factoryable type name
    static type = 'linechart';

    static configurable = {
        showControls : false,
        showLegend   : false,
        showAxes     : false,
        showPoints   : false,
        animate      : false,
        height       : '100px',
        chartPadding : {
            top    : 5,
            left   : 0,
            right  : 0,
            bottom : -19
        },
        labels : {
            field : 'label'
        },
        series : [{
            field       : 'value',
            label       : '% Utilization',
            strokeColor : '#ff572244',
            fillColor   : '#ff572211',
            stepped     : true,
            fill        : true
        }, {
            field       : 'maxValue',
            label       : 'Max Capacity',
            strokeColor : '#4caf50',
            borderDash  : [5, 5],
            strokeWidth : 2
        }]
    };

    refresh({
        record,
        timeAxisViewModel
    }) {
        if (!record.rowExpanded) {
            return;
        }

        const
            { timeAxis } = timeAxisViewModel,
            labels       = timeAxis.map(({ startDate }) => DateHelper.format(startDate, 'LL')).concat(100),
            maxValue     = record.showCapacityLine ? timeAxis.map(_ => record.maxCapacity).concat(record.maxCapacity) : [];

        this.element.ariaLabel = StringHelper.xss`Chart showing lab results for experiments in ${record.name}`;

        this.data = record.getUtilizationData(timeAxis.records).concat(100).map((r, i) => {
            return {
                label    : labels[i],
                value    : r,
                maxValue : maxValue[i]
            };
        });

        // stretch the chart to take the whole timeaxis width
        this.width = `${timeAxisViewModel.totalSize + 10}px`;
    }
}

// Register this widget type with its Factory
LineChart.initClass();
