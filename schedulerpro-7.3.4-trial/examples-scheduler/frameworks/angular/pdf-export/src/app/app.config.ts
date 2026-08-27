import { StringHelper,  SchedulerEventModel, SchedulerResourceModel } from '@bryntum/schedulerpro';
import { BryntumSchedulerProps } from '@bryntum/schedulerpro-angular';

class AppResourceModel extends SchedulerResourceModel {

    bg? : string;
    icon? : string;
    textColor? : string;

    static override get fields() {
        return [
            'bg',
            'icon',
            'textColor'
        ];
    }
}

export const schedulerProps : BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom          : true,
    stripeFeature       : true,
    dependenciesFeature : true,
    timeRangesFeature   : true,
    eventDragFeature    : {
        constrainDragToResource : true
    },
    pdfExportFeature : {
        exportServer : 'http://localhost:8080',

        // Development config
        translateURLsToAbsolute : 'http://localhost:4200',

        // For production replace with this one. See README.md for explanation
        // translateURLsToAbsolute : 'http://localhost:8080/resources/', // Trailing slash is important
        keepPathName : false
    },

    rowHeight : 50,
    barMargin : 8,

    columns : [
        {
            text  : 'Production line',
            width : 150,
            field : 'name'
        }
    ],

    startDate : new Date(2017, 11, 1),
    endDate   : new Date(2017, 11, 3),

    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'assets/data/data.json'
            }
        }
    },

    viewPreset : {
        base            : 'hourAndDay',
        tickWidth       : 25,
        columnLinesFor  : 0,
        mainHeaderLevel : 1,
        headers         : [
            {
                unit       : 'd',
                align      : 'center',
                dateFormat : 'ddd DD MMM'
            },
            {
                unit       : 'h',
                align      : 'center',
                dateFormat : 'HH'
            }
        ]
    },

    eventRenderer({ eventRecord, resourceRecord, renderData } : { eventRecord : SchedulerEventModel; resourceRecord : AppResourceModel; renderData : any }) : string {
        const
            { encodeHtml } = StringHelper,
            bgColor        = encodeHtml(resourceRecord.bg || '');

        renderData.style = `background:${bgColor};border-color:${bgColor};color:${encodeHtml(resourceRecord.textColor || '')}`;
        renderData.iconCls.add('fa', `fa-${encodeHtml(resourceRecord.icon || '')}`);

        return encodeHtml(eventRecord.name);
    }

};
