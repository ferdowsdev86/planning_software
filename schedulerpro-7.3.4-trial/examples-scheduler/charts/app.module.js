import shared from '../_shared/shared.module.thin.js';
import { Toast } from '../../build/thin/core.module.thin.js';
import '../../build/thin/chart.module.thin.js';
import '../../build/thin/grid.module.thin.js';
import { Scheduler, ResourceModel } from '../../build/thin/scheduler.module.thin.js';

class Gate extends ResourceModel {
    static fields = [
        { name : 'capacity', type : 'number' },
        { name : 'waiting', type : 'number' },
        { name : 'domestic', type : 'boolean' }
    ];
}

const scheduler = new Scheduler({
    appendTo          : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,
    flex              : 1,
    rowHeight         : 50,
    barMargin         : 5,
    multiEventSelect  : true,
    eventStyle        : 'border',
    resourceImagePath : '../_shared/images/transparent-users/',
    features          : {
        charts : {
            popup : {
                minWidth  : '60em',
                minHeight : '30em'
            },
            chartDesigner : {
                chartType : 'barVertical'
            }
        },
        tree : true
    },
    startDate  : new Date(2024, 8, 12, 8),
    viewPreset : 'hourAndDay',

    crudManager : {
        autoLoad      : true,
        resourceStore : {
            modelClass : Gate
        },
        loadUrl : 'data/data.json'
    },
    columns : [
        {
            type  : 'tree',
            text  : 'Name',
            width : 220,
            field : 'name'
        },
        {
            type  : 'number',
            text  : 'Capacity',
            width : 90,
            field : 'capacity',
            align : 'right'
        },
        {
            type  : 'number',
            text  : 'Waiting time',
            width : 90,
            field : 'waiting',
            align : 'right'
        }
    ]
});

scheduler.resourceStore.once('load', () => {
    scheduler.selectRows([4, 5, 6, 7, 8]);
    scheduler.features.charts.openPopup();
});

Toast.show({
    html    : 'This example uses the <b>Bryntum Chart</b> module, which is built upon the <a href="https://www.chartjs.org/">Chart.js</a> library (MIT license)',
    timeout : 10000
});
