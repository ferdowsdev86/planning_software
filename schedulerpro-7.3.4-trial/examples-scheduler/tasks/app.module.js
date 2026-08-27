import shared from '../_shared/shared.module.js';
import { StringHelper, Popup, SchedulerResourceModel, Scheduler } from '../../build/schedulerpro.module.js';

// The data for this demo (data/data.json) uses the 'clients' property to hold children of resources
SchedulerResourceModel.childrenField = 'clients';

const colors = [
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

function editClient(record, cellElement) {
    new Popup({
        autoShow     : true,
        autoClose    : true,
        closeAction  : 'destroy',
        scrollAction : 'realign',
        forElement   : cellElement,
        anchor       : true,
        width        : '20em',
        cls          : 'client-editor',
        items        : {
            name : {
                type       : 'text',
                name       : 'name',
                label      : 'Client',
                labelWidth : '4em',
                value      : record.name,
                onChange   : ({ value }) => {
                    record.name = value;
                }
            },
            color : {
                type        : 'combo',
                cls         : 'b-last-row',
                name        : 'color',
                label       : 'Color',
                labelWidth  : '4em',
                items       : colors.map(color => [color.toLowerCase(), color]),
                listItemTpl : data => `<div class="color-item b-color-${data.value}"></div>${data.text}`,
                value       : record.eventColor,
                onChange    : ({ value }) => {
                    record.eventColor = value;
                }
            }
        }
    });
}

const scheduler = new Scheduler({
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    startDate  : new Date(2018, 4, 7),
    endDate    : new Date(2018, 4, 26),
    barMargin  : 7,
    rowHeight  : 60,
    eventColor : null,
    eventStyle : 'filled',

    viewPreset : {
        base              : 'weekAndDay',
        displayDateFormat : 'll'
    },

    features : {
        // Disable cell editing, this demo has its own custom row editor
        cellEdit  : false,
        // Drag only within clients/employees, snap to days
        eventDrag : {
            constrainDragToResource : true,
            showExactDropPosition   : true
        },
        // Event editor with two custom fields, location for clients and color for employees
        eventEdit : {
            typeField : 'type',

            items : {
                location : {
                    type    : 'text',
                    name    : 'location',
                    label   : 'Location',
                    weight  : 110,
                    dataset : { eventType : 'client' }
                },
                color : {
                    type        : 'combo',
                    name        : 'color',
                    label       : 'Color',
                    items       : colors.map(color => [color.toLowerCase(), color]),
                    listItemTpl : data => StringHelper.xss`<div class="color-item ${data.value}"></div>${data.text}`,
                    weight      : 120,
                    dataset     : { eventType : 'employee' }
                }
            }
        },
        // Resize snapping to days
        eventResize : {
            showExactResizePosition : true
        },
        // Shade weekends
        nonWorkingTime : true,
        // Uses a tree where parent nodes are employees and child nodes are clients
        tree           : true,
        stickyEvents   : false,
        cellMenu       : {
            items : {
                editClient : {
                    text   : 'Edit client',
                    icon   : 'b-icon b-icon-edit',
                    weight : 50,
                    onItem : ({ record }) => {
                        editClient(record, scheduler.getCell({ record, field : 'name' }));
                    }
                }
            },
            processItems({ items, record }) {
                // Only show 'Edit client' menu item when right clicking a client name cell
                if (!record.isLeaf) {
                    items.editClient = null;
                }
            }
        }
    },

    columns : [
        {
            type                   : 'tree',
            text                   : 'Employees',
            field                  : 'name',
            width                  : '18em',
            // Hide default tree icons
            expandedFolderIconCls  : null,
            collapsedFolderIconCls : null,
            leafIconCls            : null,
            // Set to `false` to render our custom markup
            htmlEncode             : false,
            // Custom renderer display employee info or client color + name
            renderer({ record, value, size }) {
                // Parent rows are employees
                if (record.isParent) {
                    const image = record.image !== false ? StringHelper.xss`<img class="profile-img" src="../_shared/images/transparent-users/${record.name.toLowerCase()}.png" alt="${record.name}"/>` : '';
                    // Make employee row higher
                    size.height = 60;
                    // Employee template
                    return StringHelper.xss`
                        <div class="info">
                            <div class="name">${value}</div>
                            <div class="title">${record.title}</div>
                        </div>
                        <div class="add" data-btip="Add client"><i class="fa fa-plus"></i></div>
                    ` + image;
                }
                // Other rows are clients
                else {
                    // Client template
                    return StringHelper.xss`<div class="client-color b-color-${record.eventColor}"></div>${value}`;
                }
            }
        }
    ],

    // CrudManager loads all data from a single source
    crudManager : {
        autoLoad : true,

        loadUrl : 'data/data.json',

        resourceStore : {
            fields : ['title'],
            tree   : true
        },

        eventStore : {
            fields : ['color', 'location']
        }
    },

    // Custom event renderer that applies colors and display events location
    eventRenderer({ renderData, resourceRecord, eventRecord }) {
        const { isParent } = resourceRecord;

        if (isParent) {
            renderData.wrapperCls.add('employee');
        }

        const location = StringHelper.capitalize(eventRecord.location) || '';

        return (location && !isParent ? `<span>${StringHelper.encodeHtml(location)}</span>` : '') +
            StringHelper.encodeHtml(eventRecord.name);
    },

    listeners : {
        cellClick({ record, event }) {
            // Add a new client when clicking plus icon
            if (event.target.closest('.add')) {
                record.appendChild({
                    name       : 'New client',
                    // New client gets a random color
                    eventColor : colors[Math.floor(Math.random() * colors.length)].toLowerCase()
                });
            }
        },

        dragCreateEnd({ eventRecord, resourceRecord }) {
            // Make new event have correct type, to show correct fields in event editor
            eventRecord.type = resourceRecord.isLeaf ? 'client' : 'employee';
        },

        cellDblClick({ record, cellElement, column }) {
            // Show a custom editor when dbl clicking a client cell
            if (column.field === 'name' && record.isLeaf) {
                editClient(record, cellElement);
            }
        },

        prio : 1
    }
});
