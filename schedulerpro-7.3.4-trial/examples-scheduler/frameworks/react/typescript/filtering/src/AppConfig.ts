/**
 * Scheduler config
 */
import { DateHelper, FieldTriggerConfig, StringHelper } from '@bryntum/schedulerpro';
import { BryntumSchedulerProps, BryntumTextFieldProps } from '@bryntum/schedulerpro-react';

export const schedulerProps: BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    eventStyle     : 'traced',
    resourceImages : {
        path      : 'users/',
        extension : '.png'
    },
    columns : [
        {
            type  : 'resourceInfo',
            text  : 'Staff',
            width : 170
        },
        {
            text   : 'Role',
            field  : 'role',
            width  : 140,
            editor : {
                type        : 'combo',
                items       : ['Sales', 'Developer', 'Marketing', 'Product manager'],
                editable    : false,
                pickerWidth : 140
            }
        }
    ],
    filterBarFeature  : true,
    stripeFeature     : true,
    timeRangesFeature : true,
    eventEditFeature  : {
        items : {
            locationField : {
                type    : 'text',
                name    : 'location',
                label   : 'Location',
                dataset : { eventType : 'Meeting' },
                weight  : 200
            }
        }
    },

    displayDateFormat : 'HH:mm',

    barMargin : 5,
    rowHeight : 55,

    startDate  : new Date(2017, 1, 7, 8),
    endDate    : new Date(2017, 1, 7, 18),
    viewPreset : 'hourAndDay',

    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/data.json'
    },

    // Specialized event bar template with header and footer
    eventRenderer({
        eventRecord,
        resourceRecord,
        renderData
    }: {
        eventRecord: any
        resourceRecord: any
        renderData: any
    }): string {
        renderData.style = 'background-color:' + resourceRecord.color;

        return `
            <div class="b-sch-event-header">${DateHelper.format(eventRecord.startDate, this.displayDateFormat as string)}</div>
            <div class="b-sch-event-footer">${StringHelper.encodeHtml(eventRecord.name) || ''}</div>
        `;
    }
};

export const findProps: BryntumTextFieldProps = {
    placeholder          : 'Find tasks by name',
    keyStrokeChangeDelay : 80,
    clearable            : true,
    width                : '15em',
    triggers             : {
        filter : {
            align : 'start',
            cls   : 'fa fa-filter'
        } as FieldTriggerConfig
    }
};

export const highlightProps: BryntumTextFieldProps = {
    placeholder          : 'Highlight tasks',
    keyStrokeChangeDelay : 80,
    clearable            : true,
    width                : '15em',
    triggers             : {
        filter : {
            align : 'start',
            cls   : 'fa fa-search'
        } as FieldTriggerConfig
    }
};

