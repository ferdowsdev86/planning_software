import { DateHelper, StringHelper } from '@bryntum/schedulerpro';
import { AppEventModel, Equipment } from './app.types';

const { encodeHtml } = StringHelper;

export const schedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    startDate  : new Date(2017, 11, 1, 8),
    endDate    : new Date(2017, 11, 1, 18),

    timeRangesFeature : true,
    resourceImages    : {
        path      : 'assets/users/',
        extension : '.png'
    },

    eventMenuFeature : {
        items : [
            // custom item with inline handler
            {
                text   : 'Remove all equipment',
                icon   : 'fa fa-times',
                weight : 200,
                onItem : ({ eventRecord }: { eventRecord: AppEventModel }) => eventRecord.equipment = []
            }
        ]
    },
    eventEditFeature : {
        // Add an extra combo box to the editor to select equipment
        items : {
            equipmentCombo : {
                type         : 'combo',
                editable     : false,
                multiSelect  : true,
                valueField   : 'id',
                displayField : 'name',
                name         : 'equipment',
                label        : 'Equipment',
                items        : []
            }
        }
    },

    rowHeight  : 100,
    barMargin  : 4,
    eventColor : 'indigo',

    columns : [
        {
            type           : 'resourceInfo',
            text           : 'Name',
            width          : 200,
            showEventCount : false,
            showRole       : true
        }
    ],

    crudManager : {
        autoLoad   : true,
        eventStore : {
            durationUnit : 'hour',
            equipment    : []
        },
        transport : {
            load : {
                url : 'assets/data/data.json'
            }
        }
    },

    viewPreset : {
        base           : 'hourAndDay',
        columnLinesFor : 0,
        headers        : [
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

    // Render some extra elements for the assignment equipment items
    eventRenderer({ eventRecord }: { eventRecord : AppEventModel}): any {
        const
            date      = DateHelper.format(eventRecord.startDate as Date, 'LT'),
            name      = eventRecord.name || '',
            // @ts-ignore
            equipment = this.equipmentStore && eventRecord.equipment ? eventRecord.equipment.map(itemId => this.equipmentStore.getById(itemId) || {}) : [];

        return `
            <div class="b-sch-event-startdate">${date}</div>
            <div class="b-sch-event-name">${encodeHtml(name)}</div>
            <ul class="b-sch-event-equipment-wrap">
                ${equipment.map((item : Equipment) => `<li title="${encodeHtml(item.name || '')}" class="${encodeHtml(item.iconCls || '')}"></li>`).join('')}
            </ul>
        `;
    }

};

export const gridProps = {
    filterBarFeature : true,
    cellEditFeature  : false,
    rowHeight        : 100,
    columns          : [{
        text       : '',
        field      : 'name',
        ariaLabel  : 'Equipment column',
        filterable : {
            filterField : {
                ariaLabel : 'Filter equipment'
            }
        },
        htmlEncode : false,
        cellCls    : 'b-equipment',
        renderer   : (data : any) => `<i class="b-equipment-icon ${encodeHtml(data.record.iconCls)}"></i>${encodeHtml(data.record.name)}`
    }]
};
