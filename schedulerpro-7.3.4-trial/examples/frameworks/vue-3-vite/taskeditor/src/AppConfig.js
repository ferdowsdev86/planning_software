import { EventModel, ResourceModel, StringHelper } from '@bryntum/schedulerpro';
/**
 * Application configuration
 */
// Custom event model with multiple additional fields and a reconfigured default field
class ProEvent extends EventModel {
    static get fields() {
        return [
            { name : 'durationUnit', defaultValue : 'hour' },
            { name : 'order', defaultValue : 'New order' },
            'cost',
            'contact',
            'phone'
        ];
    }
}
// Custom resource model with an additional field
class Resource extends ResourceModel {
    static get fields() {
        return [
            'type'
        ];
    }
}
export const schedulerProps = {
    project : {
        autoLoad           : true,
        loadUrl            : './data/data.json',
        // Custom model classes that have additional fields
        resourceModelClass : Resource,
        eventModelClass    : ProEvent
    },
    startDate  : new Date(2020, 3, 6),
    endDate    : new Date(2020, 3, 11),
    rowHeight  : 50,
    barMargin  : 0,
    eventStyle : undefined,
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    viewPreset : {
        base      : 'hourAndDay',
        tickWidth : 20,
        headers   : [
            {
                unit       : 'day',
                dateFormat : 'dddd' // Monday
            },
            {
                unit       : 'hour',
                dateFormat : 'HH' // 00-23
            }
        ]
    },
    columns : [
        {
            text  : 'Resource',
            field : 'name',
            width : 200
        },
        {
            text   : 'Type',
            field  : 'type',
            hidden : true
        },
        {
            text   : 'Tasks',
            field  : 'events.length',
            width  : 70,
            align  : 'right',
            editor : false
        },
        {
            text      : 'Allocation',
            type      : 'percent',
            editor    : false,
            sortable  : false,
            groupable : false,
            align     : 'center',
            renderer({ record, grid, column }) {
                // Detect overlap
                if (record.events.some(task => task.isScheduled && !grid.eventStore.isDateRangeAvailable(task.startDate, task.endDate, task, record))) {
                    return {
                        tag       : 'i',
                        className : 'fa fa-exclamation-triangle',
                        style     : 'color : red',
                        dataset   : {
                            btip : 'Overlap!'
                        }
                    };
                }
                // Calculate allocation
                const duration = record.events.reduce((total, task) => total += task.duration, 0), allocation = Math.round((duration / 40) * 100);
                return column.defaultRenderer({ value : allocation });
            }
        }
    ],
    timeAxis : {
        filters : [{
            filterBy(tick) {
                return tick.startDate.getHours() > 6 && tick.startDate.getHours() < 17;
            }
        }]
    },
    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        renderData.eventColor = new Map([
            ['Order 1', '#ffefd5'],
            ['Order 2', '#87cefa'],
            ['New order', '#ffa500']
        ]).get(eventRecord.order);
        // Highlight overlapping tasks within a resource
        if (!eventRecord.eventStore.isDateRangeAvailable(eventRecord.startDate, eventRecord.endDate, eventRecord, resourceRecord)) {
            renderData.eventColor = '#f08080';
        }
        renderData.style = `border-color: ${renderData.eventColor}; color: ${renderData.eventColor}`;
        return [
            {
                className : 'desc',
                children  : [
                    StringHelper.encodeHtml(eventRecord.name),
                    {
                        tag       : 'div',
                        className : 'order',
                        html      : `${eventRecord.order}, ${eventRecord.percentDone}%`
                    }
                ]
            },
            eventRecord.note ? {
                tag       : 'i',
                className : 'fa fa-sticky-note b-last',
                dataset   : {
                    btip : eventRecord.note
                }
            } : null
        ];
    }
};
export const taskEditConfig = {
    // Change editor title
    editorConfig : {
        title : 'Edit '
    },
    // Customize its contents
    items : {
        generalTab : {
            // Customize the title of the general tab
            title : 'Common',
            items : {
                // Hide the end date field
                endDateField : null,
                // Add a field to edit order name
                orderField   : {
                    type   : 'text',
                    name   : 'order',
                    label  : 'Order',
                    // Place after name field
                    weight : 150
                },
                priority : {
                    type       : 'radiogroup',
                    name       : 'priority',
                    label      : 'Priority',
                    labelWidth : '6em',
                    flex       : '1 0 100%',
                    weight     : 150,
                    options    : {
                        high : 'High',
                        med  : 'Medium',
                        low  : 'Low'
                    }
                }
            }
        },
        // Hide the notes tab
        notesTab  : null,
        // Add a custom tab with some fields
        customTab : {
            defaults : {
                labelWidth : '5em'
            },
            title : 'Job',
            items : {
                noteField : {
                    type  : 'text',
                    name  : 'note',
                    label : 'Note'
                },
                costField : {
                    type  : 'number',
                    name  : 'cost',
                    label : 'Cost'
                },
                contactField : {
                    type  : 'text',
                    name  : 'contact',
                    label : 'Contact'
                },
                phoneField : {
                    type  : 'text',
                    name  : 'phone',
                    label : 'Phone'
                }
            },
            // Show it after generalTab, which has weight 100
            weight : 150
        }
    }
};
