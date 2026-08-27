import { ColumnConfig, Model, SchedulerResourceModel, StringHelper } from '@bryntum/schedulerpro';
import { BryntumSchedulerProps } from '@bryntum/schedulerpro-angular';
import './lib/RoomThemeColumn';

class CustomResourceModel extends SchedulerResourceModel {

    static get fields() {
        return [
            'capacity',
            'condition',
            'color',
            'floor',
            { name : 'theme', type : 'number' },
            { name : 'redecorated', type : 'date' }
        ];
    }

    color: string;
}

type SchedulerProps = BryntumSchedulerProps;

export const schedulerProps: SchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    startDate  : new Date(2019, 1, 19, 6),
    endDate    : new Date(2019, 1, 19, 20),
    viewPreset : 'hourAndDay',
    rowHeight  : 50,
    barMargin  : 5,
    eventStyle : 'indented',

    crudManager : {
        autoLoad : true,

        resourceStore : {
            modelClass : CustomResourceModel
        },

        transport : {
            load : {
                url : 'assets/data/data.json'
            }
        }
    },

    columns : [
        {
            text       : 'Room',
            field      : 'name',
            width      : 135,
            region     : 'left',
            htmlEncode : false,
            renderer   : ({ value, record }: { value: string; record: Model }): string => {
                return `<div class="box b-color-${(record as CustomResourceModel).color}"></div>${StringHelper.encodeHtml(value)}`;
            }
        },
        {
            text   : 'Floor',
            field  : 'floor',
            width  : 100,
            region : 'left'
        },
        {
            type       : 'number',
            text       : 'Capacity',
            field      : 'capacity',
            width      : 100,
            region     : 'left',
            align      : 'right',
            htmlEncode : false,
            renderer({ value }: { value: number }): string {
                const icon = value < 25 ? 'user' : value < 200 ? 'user-friends' : 'users';
                return `${StringHelper.encodeHtml(value.toString())}<div class="capacity fa fa-fw fa-${icon}"></div>`;
            }
        },
        { type : 'roomthemecolumn', region : 'left', minWidth : '14em' } as ColumnConfig & { type : 'roomthemecolumn' },
        {
            type   : 'date',
            text   : 'Redecorated',
            field  : 'redecorated',
            width  : 120,
            region : 'right'
        },
        {
            type   : 'rating',
            text   : 'Condition',
            field  : 'condition',
            region : 'right'
        }
    ],

    subGridConfigs : {
        left : {
            width : 450
        },
        // A "normal" flexed region is automatically added for scheduler unless specified
        right : {
            width : 300
        }
    },

    eventEditFeature : {
        items : {
            resourceField : {
                label : 'Room'
            }
        }
    },

    columnLines : false,

    tbar : [
        '->', // Makes buttons right aligned in the toolbar container
        {
            type : 'button',
            ref  : 'addButton',
            icon : 'fa-plus',
            text : 'Add column'
        }, {
            type     : 'button',
            ref      : 'removeButton',
            cls      : 'b-red',
            icon     : 'fa-trash',
            text     : 'Remove column',
            disabled : true
        }
    ]
};
