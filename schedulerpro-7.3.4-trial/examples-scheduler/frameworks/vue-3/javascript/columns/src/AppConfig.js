import { StringHelper } from '@bryntum/schedulerpro';

/**
 * Application configuration
 */
export const schedulerProps = {
    startDate  : new Date(2019, 1, 19, 6),
    endDate    : new Date(2019, 1, 19, 20),
    viewPreset : 'hourAndDay',
    rowHeight  : 50,
    barMargin  : 5,
    eventStyle : 'indented',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    crudManager : {
        autoLoad : true,

        resourceStore : {
            // Additional fields for resources
            fields : [
                'capacity',
                'condition',
                'color',
                'floor',
                {
                    name : 'redecorated',
                    type : 'date'
                }
            ]
        },

        loadUrl : 'data/data.json'
    },

    columns : [
        {
            text       : 'Room',
            field      : 'name',
            width      : 135,
            region     : 'left',
            htmlEncode : false,
            renderer   : ({ value, record }) => `<div class="box b-color-${record.color}"></div>${StringHelper.encodeHtml(value)}`
        },
        {
            text   : 'Floor',
            field  : 'floor',
            width  : 100,
            region : 'left'
        },
        {
            text       : 'Capacity',
            field      : 'capacity',
            width      : 110,
            region     : 'left',
            type       : 'number',
            align      : 'right',
            htmlEncode : false,
            renderer({ value }) {
                const icon = value < 25 ? 'user' : value < 200 ? 'user-friends' : 'users';
                return `${StringHelper.encodeHtml(value.toString())}<div class="capacity fa fa-fw fa-${icon}"></div>`;
            }
        },
        {
            text   : 'Redecorated',
            field  : 'redecorated',
            width  : 120,
            region : 'right',
            type   : 'date'
        },
        {
            text   : 'Condition',
            field  : 'condition',
            region : 'right',
            type   : 'rating'
        }
    ],

    subGridConfigs : {
        left : {
            width : 310
        },
        // A "normal" flexed region is automatically added for scheduler unless specified
        right : {
            width : 275
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
        {
            type : 'button',
            ref  : 'addButton',
            icon : 'fa fa-plus',
            text : 'Add column'
        }, {
            type     : 'button',
            ref      : 'removeButton',
            cls      : 'b-red',
            icon     : 'fa fa-trash',
            text     : 'Remove column',
            disabled : true
        }
    ]
};

