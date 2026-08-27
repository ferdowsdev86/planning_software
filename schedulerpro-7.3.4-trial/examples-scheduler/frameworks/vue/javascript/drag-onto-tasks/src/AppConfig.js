/**
 * Configuration for the scheduler
 */
import { DateHelper, StringHelper } from '@bryntum/schedulerpro';
import Task from './lib/Task';

export const schedulerProps = {
    rowHeight  : 100,
    barMargin  : 4,
    eventColor : 'indigo',
    eventStyle : 'tonal',
    startDate  : new Date(2017, 11, 1, 8),
    endDate    : new Date(2017, 11, 1, 18),
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    resourceImages : {
        path      : 'users/',
        extension : '.png'
    },
    columns : [
        {
            type           : 'resourceInfo',
            text           : 'Name',
            width          : 200,
            showEventCount : false,
            showRole       : true
        }
    ],

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

    eventMenuFeature : {
        items : [
            // custom item with inline handler
            {
                text   : 'Remove all equipment',
                icon   : 'fa fa-times',
                weight : 200,
                onItem : ({ eventRecord }) =>
                    (eventRecord.equipment = [])
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
                ref          : 'equipment',
                items        : [],
                weight       : 900
            }
        }
    },

    crudManager : {
        autoLoad   : true,
        eventStore : {
            modelClass : Task
        },
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    // Render some extra elements for the assignment equipment items
    eventRenderer({ eventRecord }) {
        const
            date      = DateHelper.format(eventRecord.startDate, 'LT'),
            name      = eventRecord.name || '',
            equipment = eventRecord.equipment.map((itemId) => this.equipmentStore.getById(itemId) || {});

        return `
            <div class="b-sch-event-startdate">${date}</div>
            <div class="b-sch-event-name">${StringHelper.encodeHtml(name)}</div>
            <ul class="b-sch-event-equipment-wrap">
                ${equipment.map(item => `<li title="${StringHelper.encodeHtml(item.name)}" class="${item.iconCls}"></li>`).join('')}
            </ul>
        `;
    },

    onEquipmentStoreLoad() {
        // Setup the data for the equipment combo inside the event editor
        // Since the event bars contain icons for equipment, we need to refresh rows once equipment store is available
        this.refreshRows();
    }
};

export const gridProps = {
    cls : 'equipmentGrid',

    store : {
        modelClass : Task,
        readUrl    : 'data/equipment.json',
        sorters    : [{ field : 'name', ascending : true }]
    },

    filterBarFeature : true,
    cellEditFeature  : false,

    rowHeight : 100,

    columns : [{
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
        renderer   : data => StringHelper.xss`<i class="b-equipment-icon ${data.record.iconCls}"></i>${data.record.name}`
    }]
};

