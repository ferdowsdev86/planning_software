import React from 'react';

import { Column, SchedulerEventModel, SchedulerResourceModel, StringHelper } from '@bryntum/schedulerpro';
import type { BryntumSchedulerProps } from '@bryntum/schedulerpro-react';

import DemoButton from './components/DemoButton';
import DemoEventTip from './components/DemoEventTip';
import DemoTooltip from './components/DemoTooltip';
import DemoWidget from './components/DemoWidget';
import DemoYesNoEditor from './components/DemoYesNoEditor';

class ResourceModelWithImportant extends SchedulerResourceModel {
    important?: boolean;
}

const handleDelayClick = (record: SchedulerResourceModel) => {
    record.events.forEach((event: SchedulerEventModel) => {
        event.startDate = new Date((event.startDate as Date).getTime!() + 1000 * 60 * 60);
    });
};

export const schedulerProps: BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    startDate  : new Date(2025, 1, 7, 8),
    endDate    : new Date(2025, 1, 7, 18),

    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/data.json'
    },

    viewPreset : 'hourAndDay',
    eventStyle : 'traced',
    barMargin  : 5,

    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        const resource = resourceRecord as ResourceModelWithImportant;
        let prefix     = '';

        if (resource.important) {
            renderData.eventColor = 'red';
            prefix                = '<i>Important:</i> ';
        }
        return prefix + StringHelper.encodeHtml(eventRecord.name);
    },

    bbar : {
        items : [{
            type : 'widget',
            html : <DemoWidget/>
        }]
    },

    cellTooltipFeature : {
        rendition       : 'rich',
        tooltipRenderer : ({ record, column }: { record: SchedulerResourceModel; column: Column }) => {
            return (
                <React.StrictMode>
                    <DemoTooltip record={record} column={column}/>
                </React.StrictMode>
            );
        }
    },

    eventTooltipFeature : {
        // Custom cls to for scoped tooltip styling
        cls       : 'react-tooltip',
        rendition : 'rich',
        template  : data => (
            <React.StrictMode>
                <DemoEventTip data={data}/>
            </React.StrictMode>
        )
    },

    columns : [
        {
            type                 : 'column',
            text                 : 'Staff<div class="small-text">(React JSX)</div>',
            field                : 'name',
            htmlEncodeHeaderText : false,
            width                : 130,
            renderer             : ({ value }) => {
                return (
                    <div>
                        <b>{StringHelper.encodeHtml(value as string)}</b>
                    </div>
                );
            }
        },
        {
            type  : 'column',
            text  : 'Type',
            field : 'role',
            width : 130
        },
        {
            type                 : 'column',
            text                 : 'Delay<div class="small-text">(React component)</div>',
            htmlEncodeHeaderText : false,
            width                : 130,
            align                : 'center',
            editor               : false,
            // No tooltip in this column
            tooltipRenderer      : false,
            // Using custom React component
            renderer             : ({ record }) => {
                const resourceRecord = record as SchedulerResourceModel;
                return (
                    <React.StrictMode>
                        <DemoButton
                            text={'+1 hour'}
                            onClick={() => handleDelayClick(resourceRecord)}
                        />
                    </React.StrictMode>
                );
            }
        },
        {
            type                 : 'column',
            text                 : 'Important<div class="small-text">(React editor)</div>',
            htmlEncodeHeaderText : false,
            field                : 'important',
            width                : 120,
            align                : 'center',
            // No tooltip in this column
            tooltipRenderer      : false,
            editor               : ref => <DemoYesNoEditor
                ref={ref}
            />,
            renderer : ({ value }) => (value as boolean ? 'Yes' : 'No')
        }
    ]

};

