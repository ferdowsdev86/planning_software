/**
 * Application configuration
 */
import { Scheduler, StringHelper, Popup, Tooltip } from '@bryntum/schedulerpro';

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

export const schedulerProps = {
    cls              : 'styles',
    startDate        : new Date(2017, 0, 1, 6),
    endDate          : new Date(2017, 0, 1, 20),
    viewPreset       : 'hourAndDay',
    barMargin        : 5,
    rowHeight        : 50,
    multiEventSelect : true,
    // Enables smoother wheel and pinch zooming
    smoothZoom       : true,

    cellEditFeature  : false,
    eventDragFeature : {
        constrainDragToResource : true
    },
    eventEditFeature : {
        showNameField     : false,
        showResourceField : false,
        items             : {
            styleCombo : {
                type     : 'combo',
                label    : 'Style',
                name     : 'eventStyle',
                editable : false,
                weight   : 100,
                items    : Scheduler.eventStyles
            },
            colorCombo : {
                type        : 'combo',
                label       : 'Color',
                name        : 'eventColor',
                editable    : false,
                weight      : 200,
                listItemTpl : item => `<div class="color-box b-color-${item.value}"></div><div>${item.value}</div>`,
                items       : Scheduler.eventColors
            }
        }
    },

    columns : [
        {
            text       : 'Name',
            field      : 'name',
            htmlEncode : false,
            width      : 130,
            renderer   : ({ record }) => StringHelper.xss`<div class="color-box b-color-${record.name.toLowerCase()}"></div>${record.name}`
        }
    ],

    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/data.json'
    },

    eventRenderer({ eventRecord }) {
        return eventRecord.eventStyle;
    }
};

// Tooltip for add client buttons (plain divs)
new Tooltip({
    forSelector : '.add',
    html        : 'Add client',
    hideDelay   : 100
});

export const tasksProps = {
    cls               : 'tasks',
    timeRangesFeature : true,
    startDate         : new Date(2018, 4, 7),
    endDate           : new Date(2018, 4, 26),
    barMargin         : 7,
    rowHeight         : 45,
    eventColor        : null,
    eventStyle        : 'filled',
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,
    cellEditFeature   : false,
    eventDragFeature  : {
        constrainDragToResource : true,
        showExactDropPosition   : true
    },
    eventEditFeature : {
        typeField : 'type',
        items     : {
            locationField : {
                type    : 'text',
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
                listItemTpl : data => `<div class="color-item ${data.value}"></div>${data.text}`,
                weight      : 200,
                dataset     : { eventType : 'employee' }
            }
        }
    },
    eventResizeFeature : {
        showExactResizePosition : true
    },
    nonWorkingTimeFeature : true,
    treeFeature           : true,
    viewPreset            : {
        base              : 'weekAndDay',
        displayDateFormat : 'll'
    },

    // Resource grid column configuration
    columns : [
        {
            type                   : 'tree',
            text                   : 'Employees',
            field                  : 'name',
            width                  : '15em',
            htmlEncode             : false,
            // Hide default tree icons
            expandedFolderIconCls  : null,
            collapsedFolderIconCls : null,
            leafIconCls            : null,
            // Custom renderer display employee info or client color + name
            renderer({ record, value, size }) {
                // Parent rows are employees
                if (record.isParent) {
                    // Make employee row higher
                    size.height = 60;
                    // Employee template
                    return StringHelper.xss`
                        <div class = "info">
                        <div class = "name">${value}</div>
                        <div class = "title">${record.title}</div>
                        </div>
                        <div class = "add"><i class    = "fa fa-plus"></i></div>
                        <img class = "profile-img" src = "users/${record.name.toLowerCase()}.png" />
                    `;
                }
                // Other rows are clients
                else {
                    // Client template
                    return `<div class="client-color b-color-${record.color}"></div>${value}`;
                }
            }
        }
    ],

    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/tasks.json',

        resourceStore : {
            fields : ['color', 'title'],
            tree   : true
        },

        eventStore : {
            fields : ['color', 'location']
        }
    },

    eventRenderer({ renderData, resourceRecord, eventRecord }) {
        if (resourceRecord.isParent) {
            renderData.wrapperCls += ' employee ';
        }

        if (eventRecord.color) {
            renderData.wrapperCls += eventRecord.color;
        }
        else if (resourceRecord.color) {
            renderData.wrapperCls += ' ' + resourceRecord.color;
        }

        return StringHelper.encodeHtml(eventRecord.name) + (eventRecord.location ? `<span>, ${StringHelper.encodeHtml(eventRecord.location)}</span>` : '');
    },

    listeners : {
        dragCreateEnd({ eventRecord, resourceRecord }) {
            // Make new event have correct type, to show correct fields in event editor
            eventRecord.type = resourceRecord.isLeaf ? 'client' : 'employee';
        },

        cellDblClick({ record, cellElement, column }) {
            // Show a custom editor when dbl clicking a client cell
            if (column.field === 'name' && record.isLeaf) {
                new Popup({
                    autoShow     : true,
                    autoClose    : true,
                    closeAction  : 'destroy',
                    scrollAction : 'realign',
                    forElement   : cellElement,
                    anchor       : true,
                    width        : '20em',
                    cls          : 'client-editor',
                    items        : [{
                        type       : 'text',
                        name       : 'name',
                        label      : 'Client',
                        labelWidth : '4em',
                        value      : record.name,
                        onChange   : ({ value }) => {
                            record.name = value;
                        }
                    }, {
                        type        : 'combo',
                        cls         : 'b-last-row',
                        name        : 'color',
                        label       : 'Color',
                        labelWidth  : '4em',
                        items       : colors.map(color => [color.toLowerCase(), color]),
                        listItemTpl : data => `<div class="color-item ${data.value}"></div>${data.text}`,
                        value       : record.color,
                        onChange    : ({ value }) => {
                            record.color = value;
                        }
                    }]
                });
            }
        },

        prio : 1
    }
};

