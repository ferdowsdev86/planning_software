import { BryntumSchedulerProps } from '@bryntum/schedulerpro-angular';
import { DateHelper, StringHelper } from '@bryntum/schedulerpro';
import { AppEventModel, AppResourceModel } from './app.types';

export const schedulerProps: BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    eventStyle : 'traced',
    barMargin  : 5,
    rowHeight  : 55,
    startDate  : new Date(2017, 1, 7, 8),
    endDate    : new Date(2017, 1, 7, 18),
    viewPreset : 'hourAndDay',

    resourceImages : {
        path      : 'assets/users/',
        extension : '.png'
    },
    filterBarFeature : true,
    columns          : [
        {
            type  : 'resourceInfo',
            text  : 'Staff',
            width : 170
        },
        {
            text   : 'Type',
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

    eventStore : {
        // @ts-ignore
        modelClass : AppEventModel
    },

    resourceStore : {
        modelClass : AppResourceModel
    },

    eventEditFeature : {
        // Add extra widgets to the event editor
        items : {
            location : {
                weight  : 210, // After resource
                type    : 'text',
                name    : 'location',
                label   : 'Location',
                dataset : {
                    eventType : 'Meeting'
                }
            }
        }
    },

    eventRenderer({ eventRecord, resourceRecord, renderData }: { eventRecord: AppEventModel; resourceRecord: AppResourceModel; renderData: any }) {

        renderData.style = 'background-color:' + resourceRecord.color;

        return StringHelper.xss`
            <section>
                <div class="b-sch-event-header">${DateHelper.format(eventRecord.startDate as Date, this.displayDateFormat)}</div>
                <div class="b-sch-event-footer">${eventRecord.name || ''}</div>
            </section>
        `;
    }

};
