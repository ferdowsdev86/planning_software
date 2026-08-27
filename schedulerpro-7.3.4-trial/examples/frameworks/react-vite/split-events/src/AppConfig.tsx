import { type DomConfig, SchedulerPro, StringHelper } from '@bryntum/schedulerpro';
import { type BryntumSchedulerProProjectModelProps, type BryntumSchedulerProProps } from '@bryntum/schedulerpro-react';
import { TruckResourceModel } from './lib/TruckResourceModel';
import { TruckEventModel } from './lib/TruckEventModel';

export const projectProps: BryntumSchedulerProProjectModelProps = {
    autoLoad           : true,
    loadUrl            : './data/data.json',
    resourceModelClass : TruckResourceModel,
    eventModelClass    : TruckEventModel
};

export const schedulerProps: BryntumSchedulerProProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    startDate  : '2025-03-24',
    endDate    : '2025-03-25',
    rowHeight  : 60,
    barMargin  : 15,
    viewPreset : 'hourAndDay',

    eventDragFeature : {
        constrainDragToTimeline : true
    },

    eventRenderer({ eventRecord }) {
        const event = eventRecord as TruckEventModel;
        // Display name from the segment, or the event it belongs to
        return (
            <>
                <i className={event.icon || event.event?.icon}/>
                <div>{StringHelper.encodeHtml(eventRecord.name! || event.event!.name!)}</div>
            </>
        );
    },

    tbar : [
        {
            type    : 'slidetoggle',
            text    : 'Auto-merge adjacent segments',
            checked : true,
            tooltip : 'If two segments are placed next to each other, you can either have them be merged or keep them separated',
            onAction({ value, source }) {
                (source.up(SchedulerPro.type) as SchedulerPro).project.autoMergeAdjacentSegments = value;
            }
        }
    ],

    columns : [
        {
            type       : 'column',
            text       : 'Resource',
            width      : 150,
            field      : 'name',
            // We want to use custom markup
            htmlEncode : false,
            // Renderer that returns a DOM config object, a more performant way than returning a html string, allows
            // reusing elements as cells are re-rendered
            renderer({ record }) {
                const resource = record as TruckResourceModel;
                return ({
                    children : [
                        // <i> tag with the icon
                        resource.icon ? {
                            tag       : 'i',
                            className : `fa fa-fw ${resource.icon}`,
                            style     : 'margin-right: .5em'
                        } : null,
                        // text node with the name
                        resource.name
                    ]
                }) as DomConfig;
            }
        }
    ]

};
