import shared from '../_shared/shared.module.js';
import { Scheduler, SchedulerResourceModel, StringHelper } from '../../build/schedulerpro.module.js';

class Gate extends SchedulerResourceModel {
    static get fields() {
        return [{
            name : 'capacity',
            type : 'number'
        }];
    }
}

new Scheduler({
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    eventColor : null,
    eventStyle : null,

    features : {
        timeRanges : {
            showHeaderElements : false
        },
        tree         : true,
        regionResize : true
    },

    rowHeight : 45,
    barMargin : 5,

    columns : [
        {
            type  : 'tree',
            text  : 'Name',
            width : 240,
            field : 'name'
        }, {
            type  : 'aggregate',
            text  : 'Capacity',
            width : 110,
            field : 'capacity'
        }
    ],

    startDate  : new Date(2017, 11, 2, 8),
    //endDate   : new Date(2017, 11, 3),
    viewPreset : 'hourAndDay',

    crudManager : {
        autoLoad      : true,
        resourceStore : {
            modelClass : Gate
        },
        loadUrl : 'data/data.json'
    },

    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        const { isLeaf } = resourceRecord;

        // Custom icon
        renderData.iconCls = 'fa fa-plane';

        // Add custom CSS classes to the template element data by setting property names
        renderData.cls.leaf = isLeaf;
        renderData.cls.group = !isLeaf;

        return isLeaf ? StringHelper.encodeHtml(eventRecord.name) : '\xa0';
    }
});
