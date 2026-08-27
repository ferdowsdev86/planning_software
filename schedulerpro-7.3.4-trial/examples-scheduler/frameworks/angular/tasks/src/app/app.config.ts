import { ComboModel, DomClassList, SchedulerEventModel, SchedulerResourceModel, SchedulerResourceModelConfig, StringHelper } from '@bryntum/schedulerpro';
import { BryntumSchedulerProps } from '@bryntum/schedulerpro-angular';

SchedulerResourceModel.childrenField = 'clients';

type BryntumEmployeeResourceModelProps = SchedulerResourceModelConfig & {
    color?: string
    title? : string
}

export class EmployeeResourceModel extends SchedulerResourceModel {
    declare color : string;
    declare title : string;

    constructor(config?: BryntumEmployeeResourceModelProps) {
        super(config);
    }
}

export class AppEventModel extends SchedulerEventModel {
    declare location? : string;
    declare color? : string;
    declare type?: string;
}

export const colors = [
    'Cyan',
    'Blue',
    'Green',
    'Light-green',
    'Lime',
    'Orange',
    'Purple',
    'Red',
    'Teal'
];

export const schedulerProps : BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    startDate  : new Date(2018, 4, 7),
    endDate    : new Date(2018, 4, 26),
    barMargin  : 7,
    rowHeight  : 45,
    eventColor : undefined,
    eventStyle : 'filled',

    viewPreset : {
        base              : 'weekAndDay',
        displayDateFormat : 'll'
    },

    // Disable cell editing, this demo has its own custom row editor

    cellEditFeature : {
        disabled : true
    },

    // Drag only within clients/employees, snap to days
    eventDragFeature : {
        constrainDragToResource : true,
        showExactDropPosition   : true
    },

    // Event editor with two custom fields, location for clients and color for employees
    eventEditFeature : {
        typeField : 'type',
        items     : {
            locationField : {
                type    : 'textfield',
                name    : 'location',
                label   : 'Location',
                weight  : 100,
                dataset : { eventType : 'client' }
            },
            colorCombo : {
                type        : 'combo',
                name        : 'color',
                label       : 'Color',
                items       : colors.map(color => [color.toLowerCase(), color]),
                weight      : 100,
                dataset     : { eventType : 'employee' },
                listItemTpl : record => {
                    const row = record as ComboModel;
                    return `<div class="color-item ${row.value}"></div>${row.text}`;
                }
            }
        }
    },

    // Resize snapping to days
    eventResizeFeature : {
        showExactResizePosition : true
    },

    // Shade weekends
    nonWorkingTimeFeature : true,

    // Uses a tree where parent nodes are employees and child nodes are clients
    treeFeature         : true,
    stickyEventsFeature : false,

    columns : [
        {
            type  : 'tree',
            text  : 'Employees',
            field : 'name',
            width : '18em',

            // Hide default tree icons
            expandedFolderIconCls  : null,
            collapsedFolderIconCls : null,
            leafIconCls            : null,

            htmlEncode : false,
            // Custom renderer display employee info or client color + name
            renderer(
                { record, value, size } : { record : any; value : string; size : any }
            ) : string {
                // Parent rows are employees
                if (record.isParent) {
                    const image = record.image !== false ? StringHelper.xss`
                    <img 
                       class="profile-img" 
                       src="assets/users/${record.name.toLowerCase()}.png"
                       alt="${record.name}" 
                    />` : '';
                    // Make employee row higher
                    size.height = 60;
                    // Employee template
                    return StringHelper.xss`
                        <div class="info">
                            <div class="name">${value}</div>
                            <div class="title">${record.title}</div>
                        </div>
                        <div class="add"><i class="fa fa-plus"></i></div>
                    ` + image;
                }
                // Other rows are clients
                else {
                    // Client template
                    return StringHelper.xss`<div class="client-color b-color-${record.color}"></div>${value}`;
                }
            }
        }
    ],

    // CrudManager loads all data from a single source
    crudManager : {
        autoLoad : true,

        transport : {
            load : {
                url : 'assets/data/data.json'
            }
        },

        resourceStore : {
            modelClass : EmployeeResourceModel,
            fields     : ['color', 'title'],
            tree       : true
        },

        eventStore : {
            fields : ['color', 'location']
        },

        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    // Custom event renderer that applies colors and display events location
    eventRenderer({ renderData, resourceRecord, eventRecord }) : string {
        const wrapperClassList = renderData.wrapperCls as DomClassList;

        if (resourceRecord.isParent) {
            wrapperClassList.add('employee');
        }

        const appEvent = eventRecord as AppEventModel;
        const appResource = resourceRecord as EmployeeResourceModel;
        if (appEvent.color) {
            wrapperClassList.add(`b-color-${appEvent.color}`);
        }
        else if (appResource.color) {
            wrapperClassList.add(`b-color-${appResource.color}`);
        }

        return StringHelper.encodeHtml(appEvent.name) + (appEvent.location ? `<span>, ${StringHelper.encodeHtml(appEvent.location)}</span>` : '');
    }
};
